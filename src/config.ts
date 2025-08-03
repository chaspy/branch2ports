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
    console.log(`Configuration file ${configPath} not found. Using default settings.`);
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
    console.error(`Failed to load configuration file: ${error}`);
    console.log('Using default settings.');
    return DEFAULT_CONFIG;
  }
}

export function createDefaultConfig(configPath: string): void {
  const configData = JSON.stringify(DEFAULT_CONFIG, null, 2);
  fs.writeFileSync(configPath, configData, 'utf-8');
  console.log(`Created default configuration file: ${configPath}`);
}