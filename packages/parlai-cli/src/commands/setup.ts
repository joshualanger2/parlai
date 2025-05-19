import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import { detectPackageManager } from '../utils/detect-package-manager';

interface SetupOptions {
  packageManager?: 'npm' | 'yarn';
}

interface I18nConfig {
  srcDir: string;
  localesDir: string;
  defaultLanguage: string;
}

const defaultConfig: I18nConfig = {
  srcDir: './src',
  localesDir: './src/locales',
  defaultLanguage: 'en'
};

function isNextAppDirectory(srcDir: string): boolean {
  // Check if we're in a Next.js app directory structure
  // by looking for app/ directory and layout.tsx/page.tsx files
  const appDir = path.join(process.cwd(), srcDir, 'app');
  if (!fs.existsSync(appDir)) return false;

  const hasLayoutOrPage = fs.existsSync(path.join(appDir, 'layout.tsx')) ||
                         fs.existsSync(path.join(appDir, 'layout.js')) ||
                         fs.existsSync(path.join(appDir, 'page.tsx')) ||
                         fs.existsSync(path.join(appDir, 'page.js'));

  return hasLayoutOrPage;
}

const parlaiConfigTemplate = (config: I18nConfig, useClientDirective: boolean) => 
`${useClientDirective ? "'use client';\n\n" : ''}import { PropsWithChildren, useEffect, useState } from 'react';
import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

/**
 * Parlai Configuration
 * -------------------
 * This file manages your app's internationalization setup.
 * Created and managed by Parlai (https://github.com/your-org/parlai)
 * 
 * Commands:
 * - parlai extract: Extract strings from your components
 * - parlai translate: Add new languages to your app
 */

export const parlaiConfig = {
  // Default language for your app
  defaultLanguage: '${config.defaultLanguage}',
  
  // Directory where translation files are stored (relative to this file)
  localesDir: './locales',
  
  // Currently supported languages
  // More languages will be added here when you run 'parlai translate'
  supportedLanguages: ['${config.defaultLanguage}'],

  // Namespace for translations
  defaultNamespace: 'translation',

  // Whether to load only language code (en) or full locale (en-US)
  loadLocaleFrom: 'languageOnly' as const
};

// Initialize i18next instance
i18n
  .use(initReactI18next)
  .use(resourcesToBackend((language: string) => 
    import(\`\${parlaiConfig.localesDir}/\${language}.json\`)))
  .init({
    lng: parlaiConfig.defaultLanguage,
    fallbackLng: parlaiConfig.defaultLanguage,
    supportedLngs: parlaiConfig.supportedLanguages,
    defaultNS: parlaiConfig.defaultNamespace,
    fallbackNS: parlaiConfig.defaultNamespace,
    interpolation: {
      escapeValue: false, // React already escapes
    },
    load: parlaiConfig.loadLocaleFrom
  });

// Provider component for wrapping your app
export function ParlaiProvider({ children }: PropsWithChildren) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!i18n.isInitialized) {
        await i18n.init();
      }
      setInitialized(true);
    };

    init();
  }, []);

  if (!initialized) {
    return null; // or a loading spinner
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}

// Export initialized i18n instance for advanced use cases
export default i18n;`;

async function promptForConfig(): Promise<I18nConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'srcDir',
      message: 'Where is your source code located?',
      default: './src',
      validate: (input: string) => {
        if (!fs.existsSync(input)) {
          return `Directory ${input} does not exist. Please create it first.`;
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'localesDir',
      message: 'Where would you like to store your translation files?',
      default: (answers: any) => `${answers.srcDir}/locales`
    },
    {
      type: 'input',
      name: 'defaultLanguage',
      message: 'What is your default language code? (e.g., en, es, fr)',
      default: 'en'
    }
  ]);

  return answers as I18nConfig;
}

async function createDirectories(config: I18nConfig): Promise<void> {
  // Create locales directory if it doesn't exist
  if (!fs.existsSync(config.localesDir)) {
    fs.mkdirSync(config.localesDir, { recursive: true });
    console.log(`  Created locales directory at ${config.localesDir}`);
  }

  // Create the default language file
  const defaultLangPath = path.join(config.localesDir, `${config.defaultLanguage}.json`);
  if (!fs.existsSync(defaultLangPath)) {
    fs.writeFileSync(defaultLangPath, '{}', 'utf8');
    console.log(`  Created default language file: ${defaultLangPath}`);
  }
}

async function createConfigFiles(config: I18nConfig): Promise<void> {
  // Determine if we need the 'use client' directive
  const useClientDirective = isNextAppDirectory(config.srcDir);
  
  // Create parlai.config.tsx
  const configPath = path.join(config.srcDir, 'parlai.config.tsx');
  fs.writeFileSync(configPath, parlaiConfigTemplate(config, useClientDirective), 'utf8');
  console.log(`  Created Parlai configuration at ${configPath}`);
  
  // Log info about the detected structure
  if (useClientDirective) {
    console.log('\n  📦 Note: Detected Next.js app directory - added \'use client\' directive');
  }
}

export async function setup(options: SetupOptions = {}): Promise<void> {
  try {
    console.log('🚀 Welcome to Parlai setup!\n');
    
    // Step 1: Install dependencies
    console.log('📦 Step 1: Installing dependencies');
    const packageManager = options.packageManager || detectPackageManager();
    console.log(`  Using ${packageManager} as package manager`);

    const dependencies = [
      'i18next',
      'react-i18next',
      'i18next-resources-to-backend'
    ];
    
    const installCmd = packageManager === 'yarn' 
      ? `yarn add ${dependencies.join(' ')}`
      : `npm install ${dependencies.join(' ')}`;
    
    console.log('  Installing:', dependencies.join(', '));
    execSync(installCmd, { stdio: 'inherit' });
    console.log('  ✅ Dependencies installed successfully!\n');

    // Step 2: Interactive configuration
    console.log('🔧 Step 2: Configuring your i18n setup');
    const config = await promptForConfig();
    console.log('');

    // Step 3: Create necessary directories and files
    console.log('📁 Step 3: Creating directories and files');
    await createDirectories(config);
    await createConfigFiles(config);

    // Step 4: Show next steps with more detailed usage examples
    console.log('\n✨ Setup complete! Here are your next steps:\n');
    
    console.log('1. Wrap your app with the ParlaiProvider:');
    console.log('   -------------------------------');
    console.log(`   // In your app root (app.tsx or app/layout.tsx):`);
    console.log(`   import { ParlaiProvider } from './parlai.config';\n`);
    console.log('   export default function App() {');
    console.log('     return (');
    console.log('       <ParlaiProvider>');
    console.log('         <YourApp />');
    console.log('       </ParlaiProvider>');
    console.log('     );');
    console.log('   }\n');

    console.log('2. Extract strings from your components:');
    console.log('   -------------------------------');
    console.log(`   $ parlai extract ${config.srcDir}\n`);
    
    console.log('3. Use translations in your components:');
    console.log('   -------------------------------');
    console.log('   import { useTranslation } from \'react-i18next\';');
    console.log('   import { parlaiConfig } from \'./parlai.config\';\n');
    console.log('   export function MyComponent() {');
    console.log('     const { t } = useTranslation();\n');
    console.log('     // Example with translation and language selection');
    console.log('     return (');
    console.log('       <div>');
    console.log('         <h1>{t(\'welcome.title\')}</h1>');
    console.log('         <select>');
    console.log('           {parlaiConfig.supportedLanguages.map(lang => (');
    console.log('             <option key={lang} value={lang}>{lang}</option>');
    console.log('           ))}');
    console.log('         </select>');
    console.log('       </div>');
    console.log('     );');
    console.log('   }\n');

  } catch (error) {
    console.error('\n❌ Error during setup:', error);
    process.exit(1);
  }
} 