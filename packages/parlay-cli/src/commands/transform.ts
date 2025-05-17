import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

export async function transform(dir: string): Promise<void> {
  try {
    // Check if en.json exists
    const translationsPath = path.join(process.cwd(), 'en.json');
    if (!fs.existsSync(translationsPath)) {
      throw new Error('en.json not found. Run "parlai extract" first.');
    }

    // Load translations
    const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf-8'));
    const reverseTranslations = Object.entries(translations).reduce((acc, [key, value]) => {
      acc[value as string] = key;
      return acc;
    }, {} as Record<string, string>);

    // Find all .tsx and .jsx files
    const pattern = `${dir}/**/*.{tsx,jsx}`;
    const files = await new Promise<string[]>((resolve, reject) => {
      glob(pattern, (err, matches) => {
        if (err) reject(err);
        else resolve(matches);
      });
    });

    for (const file of files) {
      let hasChanges = false;
      const content = fs.readFileSync(file, 'utf-8');
      
      // Parse the file
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      // Add useTranslation import if needed
      let hasTranslationImport = false;
      traverse(ast, {
        ImportDeclaration(path) {
          if (path.node.source.value.includes('i18n')) {
            hasTranslationImport = true;
          }
        },
      });

      if (!hasTranslationImport) {
        (ast.program.body as any[]).unshift(
          t.importDeclaration(
            [t.importSpecifier(t.identifier('useTranslation'), t.identifier('useTranslation'))],
            t.stringLiteral('../i18n')
          )
        );
        hasChanges = true;
      }

      // Transform the component to use async/await if needed
      traverse(ast, {
        FunctionDeclaration(path) {
          if (path.node.async === false && path.node.id?.name.includes('Page')) {
            path.node.async = true;
            hasChanges = true;
          }
        },
        ArrowFunctionExpression(path) {
          if (path.node.async === false && path.parent.type === 'VariableDeclarator') {
            const varName = (path.parent as any).id?.name;
            if (varName && varName.includes('Page')) {
              path.node.async = true;
              hasChanges = true;
            }
          }
        },
      });

      // Add useTranslation hook
      traverse(ast, {
        FunctionDeclaration(path) {
          if (path.node.id?.name.includes('Page')) {
            const body = path.node.body.body;
            const hasTranslationHook = body.some((node: any) =>
              node.type === 'VariableDeclaration' &&
              node.declarations.some((d: any) => d.id.elements?.some((e: any) => e.name === 't'))
            );

            if (!hasTranslationHook) {
              body.unshift(
                t.variableDeclaration('const', [
                  t.variableDeclarator(
                    t.identifier('t'),
                    t.awaitExpression(
                      t.callExpression(t.identifier('useTranslation'), [
                        t.stringLiteral('en'),
                        t.stringLiteral('translation')
                      ])
                    )
                  ),
                ])
              );
              hasChanges = true;
            }
          }
        },
      });

      // Replace string literals and JSX text with t() calls
      traverse(ast, {
        StringLiteral(path) {
          const value = path.node.value;
          const key = reverseTranslations[value];
          if (key && shouldTransformNode(path)) {
            path.replaceWith(
              t.callExpression(t.identifier('t'), [t.stringLiteral(key)])
            );
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
            if (key && path.node.name.name === 'className') {
              path.node.value = t.jsxExpressionContainer(
                t.callExpression(t.identifier('t'), [t.stringLiteral(key)])
              );
              hasChanges = true;
            }
          }
        },
      });

      // Save changes if any were made
      if (hasChanges) {
        const output = generate(ast, {}, content);
        fs.writeFileSync(file, output.code);
        console.log(`✨ Transformed ${file}`);
      }
    }

    console.log('✨ All files processed successfully!');

  } catch (error) {
    console.error('Error transforming files:', error);
    process.exit(1);
  }
}

function shouldTransformNode(path: any): boolean {
  const parent = path.parent;
  
  // Don't transform import statements
  if (parent.type === 'ImportDeclaration') return false;
  
  // Don't transform object properties (unless it's a specific prop we want to transform)
  if (parent.type === 'ObjectProperty' && parent.key === path.node) return false;
  
  // Don't transform variable names
  if (parent.type === 'VariableDeclarator' && parent.id === path.node) return false;
  
  return true;
} 