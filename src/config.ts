import * as fs from 'fs';
import * as path from 'path';
import { Config } from './types';

const DEFAULT_CONFIG: Config = {
  basePort: {
    frontend: 3000,
    backend: 5000,
    database: 5432,
  },
  outputFile: '.env',
  offsetRange: 1000,
};

export function loadConfig(configPath: string): Config {
  const fullPath = path.resolve(configPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`設定ファイル ${configPath} が見つかりません。デフォルト設定を使用します。`);
    return DEFAULT_CONFIG;
  }

  try {
    const configData = fs.readFileSync(fullPath, 'utf-8');
    const userConfig = JSON.parse(configData) as Partial<Config>;
    
    return {
      ...DEFAULT_CONFIG,
      ...userConfig,
      basePort: {
        ...DEFAULT_CONFIG.basePort,
        ...userConfig.basePort,
      },
    };
  } catch (error) {
    console.error(`設定ファイルの読み込みに失敗しました: ${error}`);
    console.log('デフォルト設定を使用します。');
    return DEFAULT_CONFIG;
  }
}

export function createDefaultConfig(configPath: string): void {
  const configData = JSON.stringify(DEFAULT_CONFIG, null, 2);
  fs.writeFileSync(configPath, configData, 'utf-8');
  console.log(`デフォルト設定ファイルを作成しました: ${configPath}`);
}