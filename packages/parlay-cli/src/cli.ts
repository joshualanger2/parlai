#!/usr/bin/env node

import { Command } from 'commander';
import { extract } from './commands/extract';
import { translate } from './commands/translate';

const program = new Command();

program
  .name('parlay')
  .description('CLI tool for extracting and managing i18n translations in React apps')
  .version('0.1.0');

program
  .command('extract')
  .description('Extract hardcoded strings from React components')
  .argument('<dir>', 'Directory containing React components')
  .action(extract);

program
  .command('translate')
  .description('Translate extracted strings using AI')
  .requiredOption('--api-key <key>', 'API key for translation service')
  .option('--source <lang>', 'Source language', 'en')
  .option('--target <langs...>', 'Target languages', ['fr', 'es'])
  .action(translate);

program.parse(); 