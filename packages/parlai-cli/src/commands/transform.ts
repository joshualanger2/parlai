import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { execSync } from 'child_process';

interface TransformOptions {
  dryRun?: boolean;
}

function detectPackageManager(dir: string): 'npm' | 'yarn' {
  // Check for yarn.lock or package-lock.json
  if (fs.existsSync(path.join(dir, 'yarn.lock'))) {
    return 'yarn';
  }
  return 'npm';
}

async function ensureDependencies(dir: string) {
  const packageJsonPath = path.join(dir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json not found. Please run this command in a Node.js project.');
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const requiredDeps = ['i18next', 'react-i18next'];
  const missingDeps = requiredDeps.filter(dep => !dependencies[dep]);

  if (missingDeps.length > 0) {
    console.log(`📦 Installing required dependencies: ${missingDeps.join(', ')}...`);
    const packageManager = detectPackageManager(dir);
    const installCmd = packageManager === 'yarn' 
      ? `yarn add ${missingDeps.join(' ')}`
      : `npm install ${missingDeps.join(' ')}`;
    
    try {
      execSync(installCmd, { stdio: 'inherit', cwd: dir });
      console.log('✨ Dependencies installed successfully');
    } catch (error) {
      throw new Error(`Failed to install dependencies: ${error}`);
    }
  }
}

function isNextJsProject(dir: string): boolean {
  try {
    // Check for next.config.js/ts
    const hasNextConfig = fs.existsSync(path.join(dir, 'next.config.js')) || 
                         fs.existsSync(path.join(dir, 'next.config.ts'));
    if (hasNextConfig) return true;

    // Check package.json for Next.js dependency
    const packageJsonPath = path.join(dir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      return !!(packageJson.dependencies?.next || packageJson.devDependencies?.next);
    }

    return false;
  } catch {
    return false;
  }
}

function needsUseClient(file: string, projectRoot: string): boolean {
  if (!isNextJsProject(projectRoot)) {
    return false;
  }

  // In Next.js 13+, 'use client' is needed for components using hooks in:
  // - app directory (except for page.tsx files which are server by default)
  // - components that might be used in the app directory
  
  const relativePath = path.relative(projectRoot, file);
  
  // Check if file is in app directory
  if (relativePath.includes('/app/')) {
    // Don't add 'use client' to page.tsx, layout.tsx, or route.tsx files
    // as they are server components by default
    const fileName = path.basename(file);
    if (['page.tsx', 'page.jsx', 'layout.tsx', 'layout.jsx', 'route.tsx', 'route.jsx'].includes(fileName)) {
      return false;
    }
    return true;
  }

  // Check if file is in a components directory
  if (relativePath.includes('/components/')) {
    return true;
  }

  return false;
}

function flattenTranslations(obj: any, prefix = ''): Record<string, string> {
  return Object.entries(obj).reduce((acc: Record<string, string>, [key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      acc[value] = newKey;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(acc, flattenTranslations(value, newKey));
    }
    return acc;
  }, {});
}

async function updateRootLayout(dir: string, options: TransformOptions) {
  // Find the root layout file
  const layoutPaths = [
    path.join(dir, 'app', 'layout.tsx'),
    path.join(dir, 'app', 'layout.jsx'),
    path.join(dir, 'pages', '_app.tsx'),
    path.join(dir, 'pages', '_app.jsx')
  ];

  const layoutFile = layoutPaths.find(p => fs.existsSync(p));
  if (!layoutFile) {
    console.log('⚠️ Could not find root layout file to update');
    return;
  }

  const content = fs.readFileSync(layoutFile, 'utf-8');
  const ast = parse(content, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  let hasI18nProvider = false;
  let hasI18nImport = false;

  // Check if I18nProvider is already imported and used
  traverse(ast, {
    ImportDeclaration(path) {
      if (path.node.source.value.includes('I18nProvider')) {
        hasI18nImport = true;
      }
    },
    JSXIdentifier(path) {
      if (path.node.name === 'I18nProvider') {
        hasI18nProvider = true;
      }
    }
  });

  if (!hasI18nProvider || !hasI18nImport) {
    // Add import if needed
    if (!hasI18nImport) {
      // Calculate relative path from layout file to I18nProvider
      const layoutDir = path.dirname(layoutFile);
      const componentsDir = path.join(dir, 'components');
      const relativePath = path.relative(layoutDir, componentsDir).replace(/\\/g, '/');
      const importPath = relativePath + '/I18nProvider';

      ast.program.body.unshift(
        t.importDeclaration(
          [t.importSpecifier(t.identifier('I18nProvider'), t.identifier('I18nProvider'))],
          t.stringLiteral(importPath)
        )
      );
    }

    // Wrap children with I18nProvider
    traverse(ast, {
      JSXElement(path) {
        if (path.node.openingElement.name.type === 'JSXIdentifier' &&
            path.node.openingElement.name.name === 'body') {
          const children = path.node.children;
          path.node.children = [
            t.jsxText('\n        '),
            t.jsxElement(
              t.jsxOpeningElement(t.jsxIdentifier('I18nProvider'), []),
              t.jsxClosingElement(t.jsxIdentifier('I18nProvider')),
              children,
              false
            ),
            t.jsxText('\n      ')
          ];
        }
      }
    });

    if (!options.dryRun) {
      const output = generate(ast, { retainLines: true }, content);
      fs.writeFileSync(layoutFile, output.code);
      console.log('✨ Updated root layout with I18nProvider');
    } else {
      console.log('Would update root layout with I18nProvider');
    }
  }
}

function transformComponent(ast: t.File, shouldAddUseClient: boolean): boolean {
  let hasChanges = false;
  
  // Create a new program body with the correct order
  const newBody: t.Statement[] = [];
  
  // 1. Add 'use client' if needed
  if (shouldAddUseClient) {
    newBody.push(t.expressionStatement(t.stringLiteral('use client')));
    newBody.push(t.emptyStatement()); // Add blank line
    hasChanges = true;
  }

  // 2. Add imports
  const imports: t.ImportDeclaration[] = [];
  const nonImports: t.Statement[] = [];
  
  ast.program.body.forEach((node: t.Statement) => {
    if (node.type === 'ImportDeclaration') {
      imports.push(node as t.ImportDeclaration);
    } else {
      nonImports.push(node);
    }
  });

  // Handle react-i18next import
  let hasTranslationImport = imports.some(node => 
    node.source.value === 'react-i18next'
  );

  // Remove any existing i18n-related imports
  imports.forEach((node, index) => {
    if (node.source.value.includes('i18n')) {
      imports.splice(index, 1);
      hasChanges = true;
    }
  });

  if (!hasTranslationImport) {
    imports.push(
      t.importDeclaration(
        [t.importSpecifier(t.identifier('useTranslation'), t.identifier('useTranslation'))],
        t.stringLiteral('react-i18next')
      )
    );
    hasChanges = true;
  }

  // Add all imports with proper spacing
  newBody.push(...imports);
  newBody.push(t.emptyStatement()); // Add blank line

  // 3. Add the rest of the code with proper spacing
  nonImports.forEach((node, index) => {
    if (index > 0 && node.type === 'ExportDefaultDeclaration') {
      newBody.push(t.emptyStatement()); // Add blank line before export
    }
    newBody.push(node);
  });

  // Replace the program body with the reordered version
  ast.program.body = newBody;

  return hasChanges;
}

export async function transform(dir: string, options: TransformOptions = {}): Promise<void> {
  try {
    // Ensure required dependencies are installed
    await ensureDependencies(dir);

    // Check if en.json exists in locales directory
    const translationsPath = path.join(process.cwd(), 'locales', 'en.json');
    if (!fs.existsSync(translationsPath)) {
      throw new Error('locales/en.json not found. Run "parlai extract" first.');
    }

    // Load translations
    const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf-8'));
    const reverseTranslations = flattenTranslations(translations);

    // Find all .tsx and .jsx files
    const pattern = `${dir}/**/*.{tsx,jsx}`;
    const files = await new Promise<string[]>((resolve, reject) => {
      glob(pattern, (err, matches) => {
        if (err) reject(err);
        else resolve(matches);
      });
    });

    let totalChanges = 0;
    const projectRoot = process.cwd();

    for (const file of files) {
      let hasChanges = false;
      let needsTranslation = false;
      const content = fs.readFileSync(file, 'utf-8');
      
      // Parse the file
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      // First pass: check if we need translations in this file
      traverse(ast, {
        StringLiteral(path) {
          const value = path.node.value;
          const key = reverseTranslations[value];
          if (key && shouldTransformNode(path)) {
            needsTranslation = true;
          }
        },
        JSXText(path) {
          const value = path.node.value.trim();
          const key = reverseTranslations[value];
          if (key && value) {
            needsTranslation = true;
          }
        },
        JSXAttribute(path) {
          if (path.node.value?.type === 'StringLiteral') {
            const value = path.node.value.value;
            const key = reverseTranslations[value];
            if (key && shouldTransformAttribute(path.node.name.name.toString())) {
              needsTranslation = true;
            }
          }
        },
      });

      // Only proceed with transformation if we need translations
      if (needsTranslation) {
        // Check if we need to add 'use client'
        const shouldAddUseClient = needsUseClient(file, projectRoot);
        
        // Transform the component with proper formatting
        hasChanges = transformComponent(ast, shouldAddUseClient) || hasChanges;

        // Add translation hook setup with proper spacing
        traverse(ast, {
          FunctionDeclaration(path) {
            if (path.node.id?.name.match(/^[A-Z]/) || path.node.id?.name.includes('Page')) {
              const body = path.node.body.body;
              const hasTranslationHook = body.some((node: any) =>
                node.type === 'VariableDeclaration' &&
                node.declarations.some((d: any) => d.id.name === 't')
              );

              if (!hasTranslationHook) {
                // Add translation hook with proper spacing
                body.unshift(
                  t.emptyStatement(), // Add blank line
                  t.variableDeclaration('const', [
                    t.variableDeclarator(
                      t.objectPattern([
                        t.objectProperty(
                          t.identifier('t'),
                          t.identifier('t'),
                          false,
                          true
                        )
                      ]),
                      t.callExpression(
                        t.identifier('useTranslation'),
                        []
                      )
                    )
                  ])
                );
                hasChanges = true;
              }
            }
          }
        });

        // Replace string literals and JSX text with t() calls
        traverse(ast, {
          StringLiteral(path) {
            const value = path.node.value;
            const key = reverseTranslations[value];
            if (key && shouldTransformNode(path)) {
              // If parent is a JSX attribute, wrap in JSXExpressionContainer
              if (path.parent.type === 'JSXAttribute') {
                path.replaceWith(
                  t.jsxExpressionContainer(
                    t.callExpression(t.identifier('t'), [t.stringLiteral(key)])
                  )
                );
              } else {
                path.replaceWith(
                  t.callExpression(t.identifier('t'), [t.stringLiteral(key)])
                );
              }
              hasChanges = true;
            }
          },
          JSXText(path) {
            const value = path.node.value.trim();
            const key = reverseTranslations[value];
            if (key && value) {
              path.replaceWith(
                t.jsxExpressionContainer(
                  t.callExpression(t.identifier('t'), [t.stringLiteral(key)])
                )
              );
              hasChanges = true;
            }
          },
          JSXAttribute(path) {
            if (path.node.value?.type === 'StringLiteral') {
              const value = path.node.value.value;
              const key = reverseTranslations[value];
              if (key && shouldTransformAttribute(path.node.name.name.toString())) {
                path.node.value = t.jsxExpressionContainer(
                  t.callExpression(t.identifier('t'), [t.stringLiteral(key)])
                );
                hasChanges = true;
              }
            }
          },
        });
      }

      // Save changes if needed
      if (hasChanges) {
        totalChanges++;
        if (!options.dryRun) {
          const output = generate(ast, { retainLines: true }, content);
          fs.writeFileSync(file, output.code);
        }
      }
    }

    // Add call to update root layout
    await updateRootLayout(dir, options);

    if (options.dryRun) {
      console.log(`Would transform ${totalChanges} file(s)`);
    } else {
      console.log(`Transformed ${totalChanges} file(s)`);
    }
  } catch (error) {
    console.error('\n❌ Error during transformation:', error);
    process.exit(1);
  }
}

export function shouldTransformNode(path: any): boolean {
  // Skip if inside a JSX attribute that we don't want to transform
  if (path.parent.type === 'JSXAttribute') {
    const attrName = path.parent.name.name;
    return shouldTransformAttribute(attrName);
  }

  // Skip if inside an import statement
  if (path.findParent((p: any) => p.type === 'ImportDeclaration')) {
    return false;
  }

  // Skip if inside a variable declaration that looks like a constant
  const varDecl = path.findParent((p: any) => p.type === 'VariableDeclarator');
  if (varDecl && varDecl.node.id.name.match(/^[A-Z_]+$/)) {
    return false;
  }

  return true;
}

export function shouldTransformAttribute(name: string): boolean {
  const technicalAttrs = [
    'className', 'class', 'style', 'id', 'type', 'name', 'href', 'src',
    'width', 'height', 'target', 'rel', 'role', 'aria-', 'data-',
    'xmlns', 'viewBox', 'fill', 'stroke', 'transform', 'pattern',
    'lang', 'dir', 'value', 'placeholder', 'for', 'method', 'action',
    'encType', 'accept', 'acceptCharset', 'autocomplete'
  ];

  return !technicalAttrs.some(attr => 
    name === attr || name.startsWith(attr)
  );
} 