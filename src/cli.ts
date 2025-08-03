#!/usr/bin/env node

import { Command } from 'commander';
import { generatePorts } from './index';
import { initConfig } from './init';
import { CLIOptions } from './types';

const packageJson = require('../package.json');

const program = new Command();

program
  .name('branch2ports')
  .description('A CLI tool that dynamically generates port numbers based on repository and branch names')
  .version(packageJson.version);

program
  .command('generate', { isDefault: true })
  .description('Generate port numbers and write to output file')
  .option('-c, --config <file>', 'Configuration file path', '.branch2ports')
  .option('-o, --output <file>', 'Output file path')
  .action(async (options: CLIOptions) => {
    try {
      await generatePorts(options);
      console.log('Port generation completed successfully');
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Create configuration file interactively')
  .option('-c, --config <file>', 'Configuration file path', '.branch2ports')
  .action(async (options: { config?: string }) => {
    try {
      await initConfig(options.config);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();