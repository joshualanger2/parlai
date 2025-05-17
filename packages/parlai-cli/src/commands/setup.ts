import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface SetupOptions {
  packageManager?: 'yarn' | 'npm';
}

export async function setup(options: SetupOptions = {}): Promise<void> {
  try {
    // Detect package manager
    const packageManager = options.packageManager || detectPackageManager();
    console.log(`📦 Using ${packageManager} as package manager`);

    // Install dependencies
    console.log('🔧 Installing i18n dependencies...');
    const installCmd = packageManager === 'yarn' 
      ? 'yarn add i18next i18next-resources-to-backend react-i18next'
      : 'npm install i18next i18next-resources-to-backend react-i18next';
    
    execSync(installCmd, { stdio: 'inherit' });

    // Create i18n configuration files
    console.log('📝 Creating i18n configuration files...');
    
    // Create i18n.ts
    const i18nConfig = `'use client';

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

    // Create i18n.config.ts
    const i18nConfigOptions = `export const defaultNS = 'translation';
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

    // Create directories
    const srcDir = path.join(process.cwd(), 'src');
    const localesDir = path.join(process.cwd(), 'locales');
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
    }
    if (!fs.existsSync(localesDir)) {
      fs.mkdirSync(localesDir, { recursive: true });
    }

    // Write files
    fs.writeFileSync(path.join(srcDir, 'i18n.ts'), i18nConfig);
    fs.writeFileSync(path.join(srcDir, 'i18n.config.ts'), i18nConfigOptions);

    console.log('✨ Setup complete! Now you can run:');
    console.log('1. parlai extract ./src - to extract strings to locales/en.json');
    console.log('2. parlai transform ./src - to replace hardcoded strings');

  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
}

function detectPackageManager(): 'yarn' | 'npm' {
  // Check for yarn.lock or package-lock.json
  if (fs.existsSync(path.join(process.cwd(), 'yarn.lock'))) {
    return 'yarn';
  }
  return 'npm';
} 