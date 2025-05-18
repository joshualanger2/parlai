import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { detectPackageManager } from '../utils/detect-package-manager';

interface SetupOptions {
  packageManager?: 'npm' | 'yarn';
}

export async function setup(options: SetupOptions = {}): Promise<void> {
  try {
    // Detect package manager
    const packageManager = options.packageManager || detectPackageManager();
    console.log(`📦 Using ${packageManager} as package manager`);

    // Install dependencies
    console.log('🔧 Installing i18n dependencies...');
    const dependencies = [
      'i18next',
      'react-i18next',
      'i18next-resources-to-backend'
    ];
    
    const installCmd = packageManager === 'yarn' 
      ? `yarn add ${dependencies.join(' ')}`
      : `npm install ${dependencies.join(' ')}`;
    
    execSync(installCmd, { stdio: 'inherit' });

    console.log('✨ Setup complete! Now you can run:');
    console.log('1. parlai extract ./src - to extract strings and set up i18n');
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