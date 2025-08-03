import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from '../config';
import { Config } from '../types';

describe('config', () => {
  const testDir = path.join(__dirname, 'test-configs');
  
  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('loadConfig', () => {
    it('should return default config when file does not exist', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const config = loadConfig('nonexistent.json');
      
      expect(config).toEqual({
        basePort: {
          frontend: 3000,
          backend: 5000,
          database: 5432,
        },
        outputFile: '.env',
        offsetRange: 1000,
      });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Configuration file nonexistent.json not found')
      );
      
      consoleLogSpy.mockRestore();
    });

    it('should load and merge user config with defaults', () => {
      const configPath = path.join(testDir, 'user-config.json');
      const userConfig: Partial<Config> = {
        basePort: {
          web: 8080,
        },
        outputFile: '.env.production',
      };
      
      fs.writeFileSync(configPath, JSON.stringify(userConfig, null, 2));
      
      const config = loadConfig(configPath);
      
      expect(config).toEqual({
        basePort: {
          frontend: 3000,  // Default
          backend: 5000,   // Default
          database: 5432,  // Default
          web: 8080,       // User override
        },
        outputFile: '.env.production',
        offsetRange: 1000, // Default value
      });
    });

    it('should handle invalid JSON gracefully', () => {
      const configPath = path.join(testDir, 'invalid.json');
      fs.writeFileSync(configPath, 'invalid json content');
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const config = loadConfig(configPath);
      
      expect(config).toEqual({
        basePort: {
          frontend: 3000,
          backend: 5000,
          database: 5432,
        },
        outputFile: '.env',
        offsetRange: 1000,
      });
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load configuration file')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('Using default settings.');
      
      consoleErrorSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should merge nested basePort configuration correctly', () => {
      const configPath = path.join(testDir, 'partial-config.json');
      const userConfig: Partial<Config> = {
        basePort: {
          frontend: 4000,
          newService: 6000,
        },
      };
      
      fs.writeFileSync(configPath, JSON.stringify(userConfig, null, 2));
      
      const config = loadConfig(configPath);
      
      expect(config.basePort).toEqual({
        frontend: 4000,    // Overridden
        backend: 5000,     // Default
        database: 5432,    // Default
        newService: 6000,  // Added
      });
    });
  });
});