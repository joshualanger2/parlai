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
    const i18nConfig = `import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';
import { getOptions } from './i18n.config';

const initI18next = async (lng: string, ns: string) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) => import(\`../../../\${language}.json\`)))
    .init(getOptions(lng, ns));
  return i18nInstance;
};

export async function useTranslation(lng: string, ns: string, options: { keyPrefix?: string } = {}) {
  const i18nextInstance = await initI18next(lng, ns);
  return {
    t: i18nextInstance.getFixedT(lng, ns, options.keyPrefix),
    i18n: i18nextInstance
  };
}`;

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

    // Write files
    const srcDir = path.join(process.cwd(), 'src');
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
    }

    fs.writeFileSync(path.join(srcDir, 'i18n.ts'), i18nConfig);
    fs.writeFileSync(path.join(srcDir, 'i18n.config.ts'), i18nConfigOptions);

    console.log('✨ Setup complete! Now you can run:');
    console.log('1. parlai extract ./src - to extract strings');
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