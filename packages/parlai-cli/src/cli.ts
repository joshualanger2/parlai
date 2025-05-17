#!/usr/bin/env node

import { Command } from 'commander';
import { extract } from './commands/extract';
import { translate } from './commands/translate';
import { setup } from './commands/setup';
import { createDemo } from './commands/create-demo';

const program = new Command();

program
  .name('parlai')
  .description(`A powerful CLI tool for automating i18n setup and management in React applications.

Features:
  🚀 One-command i18n setup with automatic dependency installation
  🔍 Extract strings and transform components in one step
  🌐 AI-powered translation suggestions
  📦 Support for both npm and yarn
  🎯 Demo app generator for quick testing

Quick Start:
  1. parlai create-demo my-app - Create a demo React app
  2. cd my-app && parlai setup - Set up i18n in your project
  3. parlai extract ./src     - Extract strings and transform components
  4. parlai translate        - (Optional) Generate translations`)
  .version('0.1.0');

program
  .command('create-demo')
  .description(`Create a demo Next.js app with sample components.
  - Sets up a new Next.js project with TypeScript and Tailwind CSS
  - Creates sample components with hardcoded text
  - Perfect for testing the i18n workflow`)
  .argument('<name>', 'Name of the demo app')
  .action(createDemo);

program
  .command('setup')
  .description(`Set up i18n in your React application.
  - Installs required dependencies (i18next, react-i18next)
  - Creates i18n configuration files
  - Sets up the translation infrastructure`)
  .option('--package-manager <manager>', 'Specify package manager (npm or yarn)', 'yarn')
  .action(setup);

program
  .command('extract')
  .description(`Extract strings and transform components in one step.
  - Finds and extracts all text content from JSX components
  - Creates/updates locales/en.json with extracted strings
  - Transforms components to use i18n hooks and keys
  - Makes components async-ready for translation loading
  - Adds proper error handling and loading states
  
Example:
  $ parlai extract ./src
  
This command combines string extraction and component transformation into a single step:
1. Extracts all strings to locales/en.json
2. Adds necessary i18n imports and configuration
3. Replaces hardcoded strings with translation keys
4. Makes components async-safe with proper error handling`)
  .argument('<dir>', 'Directory containing React components')
  .option('--dry-run', 'Preview changes without modifying files', false)
  .option('--backup', 'Create backup files before modifying', false)
  .option('--cleanup', 'Remove strings that won\'t be transformed from en.json', false)
  .action(extract);

program
  .command('translate')
  .description(`Translate extracted strings to other languages using AI.
Optional step after extraction to generate translations for other languages.
Requires locales/en.json to exist (created by extract command).`)
  .requiredOption('--api-key <key>', 'API key for translation service')
  .option('--source <lang>', 'Source language', 'en')
  .option('--target <langs...>', 'Target languages to translate to', ['fr', 'es'])
  .action(translate);

program.parse();