#!/usr/bin/env node

import { Command } from 'commander';
import { extract } from './commands/extract';
import { translate } from './commands/translate';
import { setup } from './commands/setup';
import { transform } from './commands/transform';

const program = new Command();

program
  .name('parlai')
  .description('CLI tool for extracting and managing i18n translations in React apps')
  .version('0.1.0');

program
  .command('setup')
  .description('Set up i18n in your React application')
  .option('--package-manager <manager>', 'Specify package manager (npm or yarn)', 'yarn')
  .action(setup);

program
  .command('extract')
  .description('Extract hardcoded strings from React components')
  .argument('<dir>', 'Directory containing React components')
  .action(extract);

program
  .command('transform')
  .description('Replace hardcoded strings with i18n keys')
  .argument('<dir>', 'Directory containing React components')
  .action(transform);

program
  .command('translate')
  .description('Translate extracted strings using AI')
  .requiredOption('--api-key <key>', 'API key for translation service')
  .option('--source <lang>', 'Source language', 'en')
  .option('--target <langs...>', 'Target languages', ['fr', 'es'])
  .action(translate);

program.parse(); 