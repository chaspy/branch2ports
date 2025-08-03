#!/usr/bin/env node

import { Command } from 'commander';
import { generatePorts } from './index';
import { initConfig } from './init';
import { CLIOptions } from './types';

const program = new Command();

program
  .name('branch2ports')
  .description('ブランチ名とディレクトリ名を基に動的にポート番号を生成するCLIツール')
  .version('1.0.0');

program
  .command('generate', { isDefault: true })
  .description('ポート番号を生成して出力ファイルに書き込み')
  .option('-c, --config <file>', '設定ファイルのパス', '.branch2ports')
  .option('-o, --output <file>', '出力ファイルのパス')
  .action(async (options: CLIOptions) => {
    try {
      await generatePorts(options);
      console.log('ポート番号の生成が完了しました');
    } catch (error) {
      console.error('エラーが発生しました:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('設定ファイルを対話的に作成')
  .option('-c, --config <file>', '設定ファイルのパス', '.branch2ports')
  .action(async (options: { config?: string }) => {
    try {
      await initConfig(options.config);
    } catch (error) {
      console.error('エラーが発生しました:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();