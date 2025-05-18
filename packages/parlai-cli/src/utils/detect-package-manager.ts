import * as fs from 'fs';
import * as path from 'path';

export function detectPackageManager(dir: string = process.cwd()): 'npm' | 'yarn' {
  // Check for yarn.lock
  if (fs.existsSync(path.join(dir, 'yarn.lock'))) {
    return 'yarn';
  }

  // Default to npm
  return 'npm';
} 