import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { StringLiteral, JSXText } from '@babel/types';

interface ExtractedString {
  value: string;
  key: string;
  file: string;
  line: number;
}

export async function extract(dir: string): Promise<void> {
  try {
    // Find all .tsx and .jsx files
    const pattern = `${dir}/**/*.{tsx,jsx}`;
    const files = await new Promise<string[]>((resolve, reject) => {
      glob(pattern, (err, matches) => {
        if (err) reject(err);
        else resolve(matches);
      });
    });
    
    const extractedStrings: ExtractedString[] = [];
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Parse the file
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });
      
      // Traverse the AST
      traverse(ast, {
        StringLiteral(path) {
          if (shouldExtractString(path.node)) {
            extractedStrings.push({
              value: path.node.value,
              key: generateKey(file, path.node.value),
              file: file,
              line: path.node.loc?.start.line || 0,
            });
          }
        },
        JSXText(path) {
          const text = path.node.value.trim();
          if (text && shouldExtractString(path.node)) {
            extractedStrings.push({
              value: text,
              key: generateKey(file, text),
              file: file,
              line: path.node.loc?.start.line || 0,
            });
          }
        },
      });
    }
    
    // Generate translations file
    const translations = extractedStrings.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    // Write translations to en.json
    fs.writeFileSync(
      path.join(process.cwd(), 'en.json'),
      JSON.stringify(translations, null, 2)
    );
    
    console.log(`✨ Extracted ${extractedStrings.length} strings to en.json`);
    
  } catch (error) {
    console.error('Error extracting strings:', error);
    process.exit(1);
  }
}

function shouldExtractString(node: StringLiteral | JSXText): boolean {
  // Add logic to filter out strings that shouldn't be translated
  // e.g., URLs, variable names, etc.
  const value = 'value' in node ? node.value : node.value.trim();
  
  // Skip empty strings
  if (!value) return false;
  
  // Skip strings that look like URLs
  if (value.startsWith('http') || value.startsWith('www.')) return false;
  
  // Skip strings that are just numbers
  if (/^\d+$/.test(value)) return false;
  
  return true;
}

function generateKey(file: string, value: string): string {
  // Convert file path to dot notation
  const fileKey = path.basename(file, path.extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');
  
  // Convert value to snake case
  const valueKey = value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 20);
  
  return `${fileKey}.${valueKey}`;
} 