import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

interface TransformOptions {
  dryRun?: boolean;
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

export async function transform(dir: string, options: TransformOptions = {}): Promise<void> {
  try {
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
        // Add imports if needed
        let hasTranslationImport = false;

        traverse(ast, {
          ImportDeclaration(path) {
            // Handle react-i18next import
            if (path.node.source.value === 'react-i18next') {
              hasTranslationImport = true;
            }
            // Remove any existing i18n-related imports
            if (path.node.source.value.includes('i18n')) {
              path.remove();
              hasChanges = true;
            }
          },
        });

        if (!hasTranslationImport) {
          (ast.program.body as any[]).unshift(
            t.importDeclaration(
              [t.importSpecifier(t.identifier('useTranslation'), t.identifier('useTranslation'))],
              t.stringLiteral('react-i18next')
            )
          );
          hasChanges = true;
        }

        // Add translation hook setup
        traverse(ast, {
          FunctionDeclaration(path) {
            if (path.node.id?.name.match(/^[A-Z]/) || path.node.id?.name.includes('Page')) {
              const body = path.node.body.body;
              const hasTranslationHook = body.some((node: any) =>
                node.type === 'VariableDeclaration' &&
                node.declarations.some((d: any) => d.id.name === 't')
              );

              if (!hasTranslationHook) {
                // Add translation hook
                body.unshift(
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
          },
          ArrowFunctionExpression(path) {
            // Similar logic for arrow functions
            if (path.parent.type === 'VariableDeclarator') {
              const varName = (path.parent as any).id?.name;
              if (varName && (varName.includes('Page') || varName.match(/^[A-Z]/))) {
                if (path.node.body.type !== 'BlockStatement') {
                  path.node.body = t.blockStatement([t.returnStatement(path.node.body)]);
                }

                const body = (path.node.body as t.BlockStatement).body;
                const hasTranslationHook = body.some((node: any) =>
                  node.type === 'VariableDeclaration' &&
                  node.declarations.some((d: any) => d.id.name === 't')
                );

                if (!hasTranslationHook) {
                  // Add translation hook
                  body.unshift(
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

      // Save changes if any were made
      if (hasChanges) {
        const output = generate(ast, {}, content);
        if (!options.dryRun) {
          fs.writeFileSync(file, output.code);
        }
        console.log(`${options.dryRun ? '🔍 Would transform' : '✨ Transformed'} ${file}`);
        totalChanges++;
      }
    }

    if (totalChanges > 0) {
      console.log(`\n${options.dryRun ? 'Would transform' : 'Transformed'} ${totalChanges} file${totalChanges === 1 ? '' : 's'}`);
    } else {
      console.log('\nNo files needed transformation');
    }

  } catch (error) {
    console.error('\n❌ Error during transformation:', error);
    process.exit(1);
  }
}

export function shouldTransformNode(path: any): boolean {
  const parent = path.parent;
  const value = path.node.value;
  
  // Don't transform import statements or requires
  if (parent.type === 'ImportDeclaration' || parent.type === 'CallExpression' && parent.callee?.name === 'require') {
    return false;
  }
  
  // Don't transform object properties unless they're specific UI-related props
  if (parent.type === 'ObjectProperty') {
    const allowedProps = ['title', 'description', 'label', 'placeholder', 'alt', 'text', 'message', 'heading'];
    // Skip if it's the key or not in allowed props
    if (parent.key === path.node || !allowedProps.includes(parent.key.name)) {
      return false;
    }
  }
  
  // Skip technical patterns
  if (
    // Import paths, URLs, file paths
    value.startsWith('@/') ||
    value.startsWith('./') ||
    value.startsWith('../') ||
    value.startsWith('http') ||
    value.includes('/') ||
    
    // Common development strings
    value.match(/^[a-z]+:/) || // protocols, schemes
    value.match(/^[a-z]+\.[a-z]+/) || // file extensions, domains
    value.match(/^\$\{.*\}$/) || // template literals
    
    // Development identifiers
    value.match(/^[A-Z][a-zA-Z]+(?:\.[a-zA-Z]+)*$/) || // PascalCase identifiers
    value.match(/^[a-z]+[A-Z][a-zA-Z]*$/) || // camelCase identifiers
    value.match(/^[A-Z][A-Z_]+$/) // CONSTANT_CASE
  ) {
    return false;
  }
  
  // Don't transform variable names or identifiers
  if (parent.type === 'VariableDeclarator' && parent.id === path.node) {
    return false;
  }

  // Don't transform style-related attributes
  if (parent.type === 'JSXAttribute') {
    const skipAttributes = [
      'className', 'style', 'id', 'name', 'type', 'role', 'src', 'href',
      'target', 'rel', 'method', 'action', 'encType', 'data-', 'aria-'
    ];
    if (skipAttributes.some(attr => parent.name.name.startsWith(attr))) {
      return false;
    }
  }
  
  return true;
}

export function shouldTransformAttribute(name: string): boolean {
  // Only transform human-readable text attributes
  const transformableAttributes = [
    'placeholder',
    'title',
    'alt',
    'label',
    'aria-label',
    'aria-description',
    'description',
    'caption',
    'summary',
    'heading',
    'text'
  ];
  
  // Skip any attribute that starts with technical prefixes
  const technicalPrefixes = ['data-', 'aria-', 'x-', 'ng-', 'v-'];
  if (technicalPrefixes.some(prefix => name.startsWith(prefix))) {
    return false;
  }
  
  return transformableAttributes.includes(name);
} 