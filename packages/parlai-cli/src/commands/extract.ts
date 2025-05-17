import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import { StringLiteral, JSXText, Node, CallExpression, ObjectProperty, VariableDeclarator, Identifier } from '@babel/types';
import { transform, shouldTransformNode, shouldTransformAttribute } from './transform';

interface ExtractedString {
  value: string;
  key: string;
  file: string;
  line: number;
  wasTransformed: boolean;
}

interface ExtractOptions {
  dryRun?: boolean;
  backup?: boolean;
  cleanup?: boolean; // Whether to remove unused translations
}

const i18nConfigTemplate = `export const defaultNS = 'translation';
export const fallbackLng = 'en';

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    supportedLngs: ['en'],
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns
  };
}`;

const i18nTemplate = `'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { getOptions } from './i18n.config';

// Initialize i18next for the application
i18n
  .use(initReactI18next)
  .use(resourcesToBackend((language: string) => import(\`./locales/\${language}.json\`)))
  .init(getOptions());

export default i18n;`;

function generateKey(file: string, value: string): string {
  // Convert the file path to a namespace
  const namespace = path.basename(file, path.extname(file)).toLowerCase();
  
  // Convert the string value to a key
  const key = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 30);
  
  return `${namespace}.${key}`;
}

function shouldExtractString(node: StringLiteral | JSXText, path: any): boolean {
  // Skip empty strings
  if (node.type === 'JSXText' && !node.value.trim()) {
    return false;
  }
  
  const value = node.type === 'StringLiteral' ? node.value : node.value.trim();
  
  // Skip if empty after trimming
  if (!value.trim()) {
    return false;
  }

  // Always extract text from JSX elements like h1, h2, p, etc.
  if (node.type === 'JSXText') {
    const parentElement = path.findParent((p: NodePath<Node>) => {
      if (!p.node || p.node.type !== 'JSXElement') return false;
      const elementName = p.node.openingElement.name;
      return elementName.type === 'JSXIdentifier' &&
             ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'label', 'button'].includes(elementName.name);
    });
    if (parentElement) {
      return true;
    }
  }

  // Check the parent node's context
  const parent = path.parent;
  
  // Skip if inside a configuration or metadata object
  const isInConfig = path.findParent((p: NodePath<Node>) => {
    if (!p.node) return false;
    
    // Check for configuration-like variable names
    if (p.node.type === 'VariableDeclarator' && p.node.id.type === 'Identifier') {
      const varName = p.node.id.name.toLowerCase();
      return varName.includes('config') || 
             varName.includes('options') || 
             varName.includes('settings') ||
             varName.includes('meta');
    }
    
    // Check for configuration-like object properties
    if (p.node.type === 'ObjectProperty' && p.node.key.type === 'Identifier') {
      const keyName = p.node.key.name.toLowerCase();
      return keyName === 'subsets' ||
             keyName === 'variable' ||
             keyName === 'metadata' ||
             keyName === 'config' ||
             keyName === 'options' ||
             keyName === 'settings';
    }
    
    return false;
  });
  
  if (isInConfig) {
    return false;
  }

  // Skip className attributes and other technical attributes
  if (parent.type === 'JSXAttribute') {
    const attrName = parent.name.name;
    const technicalAttrs = [
      'className', 'class', 'style', 'id', 'type', 'name', 'href', 'src',
      'width', 'height', 'target', 'rel', 'role', 'aria-', 'data-',
      'xmlns', 'viewBox', 'fill', 'stroke', 'transform', 'pattern',
      'lang', 'dir', 'value', 'placeholder', 'for', 'method', 'action',
      'encType', 'accept', 'acceptCharset', 'autocomplete', 'variable'
    ];
    
    if (technicalAttrs.some(attr => 
      attrName === attr || attrName.startsWith(attr)
    )) {
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
    
    // CSS and styling patterns
    value.includes('px') ||
    value.includes('rem') ||
    value.includes('em') ||
    value.includes('vh') ||
    value.includes('vw') ||
    value.match(/^(bg|text|mx|my|px|py|flex|grid|font|rounded|shadow|hover|focus|sm|md|lg|xl)-/) || // Tailwind classes
    
    // Common development strings
    value.match(/^[a-z]+:/) || // protocols, schemes
    value.match(/^[a-z]+\.[a-z]+/) || // file extensions, domains
    value.match(/^\$\{.*\}$/) || // template literals
    value.match(/^[<>]/) || // JSX/HTML tags
    
    // Development identifiers
    value.match(/^[A-Z][a-zA-Z]+(?:\.[a-zA-Z]+)*$/) || // PascalCase identifiers
    value.match(/^[a-z]+[A-Z][a-zA-Z]*$/) || // camelCase identifiers
    value.match(/^[A-Z][A-Z_]+$/) || // CONSTANT_CASE
    
    // Skip strings that are just numbers or boolean values
    value.match(/^(?:\d+|true|false|null|undefined)$/) ||
    
    // Skip very long strings without spaces (likely identifiers/hashes)
    (value.length > 40 && !value.includes(' ')) ||
    
    // Skip language codes and locales
    value.match(/^[a-z]{2}(?:-[A-Z]{2})?$/) || // e.g., 'en', 'en-US'
    
    // Skip font-related strings
    value.match(/^(?:sans|serif|mono|latin|cyrillic|greek|vietnamese|arabic|hebrew|devanagari)$/)
  ) {
    return false;
  }

  // For strings with spaces, additional checks
  if (value.includes(' ')) {
    // Skip if it looks like a CSS class string
    if (value.split(' ').every(part => 
      part.match(/^(?:bg|text|mx|my|px|py|flex|grid|font|rounded|shadow|hover|focus|sm|md|lg|xl)-[\w-]+$/) ||
      part.includes('px') ||
      part.includes('rem')
    )) {
      return false;
    }
  }

  // For single words, they must look like actual words
  if (!value.includes(' ')) {
    // Must contain at least one lowercase letter (catches most technical strings)
    if (!value.match(/[a-z]/)) {
      return false;
    }
    
    // Skip common code words unless they're clearly UI text
    const commonCodeWords = new Set([
      'props', 'state', 'ref', 'key', 'id', 'src', 'href', 'type', 'name', 'value',
      'data', 'style', 'class', 'true', 'false', 'null', 'undefined', 'next', 'prev',
      'default', 'primary', 'secondary', 'success', 'error', 'warning', 'info',
      'latin', 'mono', 'sans', 'serif', 'font', 'layout', 'config', 'meta',
      'title', 'head', 'body', 'main', 'header', 'footer', 'nav', 'section',
      'article', 'aside', 'div', 'span', 'lang', 'dir', 'role', 'aria'
    ]);
    if (commonCodeWords.has(value.toLowerCase()) && !isInTranslatableContext(path)) {
      return false;
    }
  }

  // Skip if inside a font configuration
  const isInFontConfig = path.findParent((p: NodePath<Node>) => {
    if (!p.node) return false;
    if (p.node.type === 'CallExpression' && p.node.callee.type === 'Identifier') {
      const fontFunctions = ['Geist', 'Geist_Mono', 'Inter', 'Roboto', 'createFont'];
      return fontFunctions.includes(p.node.callee.name);
    }
    return false;
  });
  
  if (isInFontConfig) {
    return false;
  }

  return true;
}

function isInTranslatableContext(path: any): boolean {
  // Check if the string is JSX text content
  if (path.type === 'JSXText' || path.parent.type === 'JSXText') {
    return true;
  }

  // Check if the string is in a JSX element (like h1, h2, p, etc.)
  const isInJSX = path.findParent((p: NodePath<Node>) => {
    if (!p.node) return false;
    return p.node.type === 'JSXElement' && 
           p.node.openingElement.name.type === 'JSXIdentifier' &&
           ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'label', 'button'].includes(p.node.openingElement.name.name);
  });

  if (isInJSX) {
    return true;
  }

  // Check if the string is in an array of features/items
  const isInArray = path.findParent((p: NodePath<Node>) => {
    if (!p.node) return false;
    return p.node.type === 'ArrayExpression';
  });

  if (isInArray) {
    // Check if it's a title or description in an object
    const objectProperty = path.findParent((p: NodePath<Node>) => {
      if (!p.node || p.node.type !== 'ObjectProperty') return false;
      const key = p.node.key;
      return key.type === 'Identifier' && 
             ['title', 'description', 'text', 'label', 'heading'].includes(key.name);
    });
    return !!objectProperty;
  }

  return false;
}

function ensureI18nSetup(srcDir: string, options: ExtractOptions) {
  // Get the app root directory (one level up from src)
  const appDir = path.dirname(srcDir);
  
  // Check both possible locations for i18n files
  const srcI18nConfig = path.join(srcDir, 'i18n.config.ts');
  const srcI18nPath = path.join(srcDir, 'i18n.ts');
  const appI18nConfig = path.join(appDir, 'i18n.config.ts');
  const appI18nPath = path.join(appDir, 'i18n.ts');

  // Check if files exist in either location
  const hasI18nConfig = fs.existsSync(srcI18nConfig) || fs.existsSync(appI18nConfig);
  const hasI18n = fs.existsSync(srcI18nPath) || fs.existsSync(appI18nPath);

  if (!hasI18nConfig || !hasI18n) {
    console.log('\n📦 Setting up i18n configuration...');

    if (!options.dryRun) {
      if (!hasI18nConfig) {
        // Create i18n.config.ts in app root
        fs.writeFileSync(appI18nConfig, i18nConfigTemplate);
        console.log('✨ Created i18n.config.ts in app root');
      }

      if (!hasI18n) {
        // Create i18n.ts in app root
        fs.writeFileSync(appI18nPath, i18nTemplate);
        console.log('✨ Created i18n.ts in app root');
      }
    } else {
      console.log('Would create:');
      if (!hasI18nConfig) console.log('- i18n.config.ts in app root');
      if (!hasI18n) console.log('- i18n.ts in app root');
    }
  }
}

function setNestedValue(obj: any, path: string[], value: string) {
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  current[path[path.length - 1]] = value;
}

export async function extract(dir: string, options: ExtractOptions = {}): Promise<void> {
  try {
    console.log('🔍 Analyzing components...');

    // Create backup if requested
    if (options.backup) {
      console.log('📦 Creating backup...');
      const backupDir = path.join(process.cwd(), 'i18n-backup-' + Date.now());
      fs.mkdirSync(backupDir, { recursive: true });
      
      // Copy source directory
      fs.cpSync(dir, path.join(backupDir, path.basename(dir)), { recursive: true });
      
      // Copy locales if they exist
      const localesDir = path.join(process.cwd(), 'locales');
      if (fs.existsSync(localesDir)) {
        fs.cpSync(localesDir, path.join(backupDir, 'locales'), { recursive: true });
      }
      
      console.log(`✨ Backup created at ${backupDir}`);
    }

    if (options.dryRun) {
      console.log('\n🔍 Dry run mode - no files will be modified');
    }

    // Find all .tsx and .jsx files
    const pattern = `${dir}/**/*.{tsx,jsx}`;
    const files = await new Promise<string[]>((resolve, reject) => {
      glob(pattern, (err, matches) => {
        if (err) reject(err);
        else resolve(matches);
      });
    });
    
    // Ensure i18n setup exists
    const srcDir = path.resolve(dir);
    ensureI18nSetup(srcDir, options);

    const extractedStrings: ExtractedString[] = [];
    const transformedStrings = new Set<string>();
    
    console.log('\n📝 Extracting strings...');
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });
      
      // First pass: Extract strings and simulate transform to track usage
      traverse(ast, {
        StringLiteral(path) {
          if (shouldExtractString(path.node, path)) {
            const wouldTransform = shouldTransformNode(path);
            extractedStrings.push({
              value: path.node.value,
              key: generateKey(file, path.node.value),
              file: file,
              line: path.node.loc?.start.line || 0,
              wasTransformed: wouldTransform
            });
            if (wouldTransform) {
              transformedStrings.add(path.node.value);
            }
          }
        },
        JSXText(path) {
          const text = path.node.value.trim();
          if (text && shouldExtractString(path.node, path)) {
            const wouldTransform = true; // JSX Text is always transformed if extracted
            extractedStrings.push({
              value: text,
              key: generateKey(file, text),
              file: file,
              line: path.node.loc?.start.line || 0,
              wasTransformed: wouldTransform
            });
            if (wouldTransform) {
              transformedStrings.add(text);
            }
          }
        },
        JSXAttribute(path) {
          if (path.node.value?.type === 'StringLiteral') {
            const value = path.node.value.value;
            if (shouldExtractString(path.node.value, path) && shouldTransformAttribute(path.node.name.name.toString())) {
              extractedStrings.push({
                value,
                key: generateKey(file, value),
                file: file,
                line: path.node.loc?.start.line || 0,
                wasTransformed: true
              });
              transformedStrings.add(value);
            }
          }
        }
      });
    }

    // Filter out strings that won't be transformed
    const finalStrings = options.cleanup 
      ? extractedStrings.filter(s => s.wasTransformed)
      : extractedStrings;
    
    // Generate translations file
    const translations = {};
    finalStrings.forEach(({ key, value }) => {
      // Split the key into parts (e.g., "features.title" -> ["features", "title"])
      const keyParts = key.split('.');
      setNestedValue(translations, keyParts, value);
    });
    
    // Create locales directory if it doesn't exist
    const localesDir = path.join(process.cwd(), 'locales');
    if (!fs.existsSync(localesDir)) {
      fs.mkdirSync(localesDir, { recursive: true });
    }
    
    if (!options.dryRun) {
      fs.writeFileSync(
        path.join(localesDir, 'en.json'),
        JSON.stringify(translations, null, 2)
      );
    }

    const unusedCount = extractedStrings.length - finalStrings.length;
    console.log(`\n📊 String Analysis:`);
    console.log(`  - Total strings found: ${extractedStrings.length}`);
    console.log(`  - Strings that will be transformed: ${finalStrings.length}`);
    if (unusedCount > 0) {
      console.log(`  - Skipped ${unusedCount} strings that wouldn't be transformed`);
    }
    
    console.log(`\n${options.dryRun ? 'Would extract' : 'Extracted'} ${finalStrings.length} strings to locales/en.json`);

    // Transform components
    console.log('\n🔄 Transforming components...');
    await transform(dir, { dryRun: options.dryRun });

    if (options.dryRun) {
      console.log('\n✨ Dry run completed. Run without --dry-run to apply changes.');
    } else {
      console.log('\n✨ All done! Your components are now internationalized.');
      console.log('\nNext steps:');
      console.log('1. Check the transformed components in your editor');
      console.log('2. Run your app to verify everything works');
      console.log('3. (Optional) Run "parlai translate" to generate translations');
    }
  } catch (error) {
    console.error('\n❌ Error during extraction:', error);
    process.exit(1);
  }
} 