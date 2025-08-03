import * as fs from 'fs';
import * as path from 'path';
import { generateEnvContent, writePortsToFile, generatePorts } from '../index';
import { PortResult } from '../types';
import * as config from '../config';
import * as portCalculator from '../port-calculator';

// Mock dependencies
jest.mock('fs');
jest.mock('../config');
jest.mock('../port-calculator');

describe('index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateEnvContent', () => {
    it('should generate correct env format', () => {
      const ports: PortResult[] = [
        { service: 'frontend', port: 3100, envVar: 'FRONTEND_PORT' },
        { service: 'backend', port: 5100, envVar: 'BACKEND_PORT' },
        { service: 'database', port: 5532, envVar: 'DATABASE_PORT' },
      ];

      const result = generateEnvContent(ports);

      expect(result).toBe('FRONTEND_PORT=3100\nBACKEND_PORT=5100\nDATABASE_PORT=5532\n');
    });

    it('should handle empty ports array', () => {
      const result = generateEnvContent([]);
      expect(result).toBe('\n');
    });

    it('should handle single port', () => {
      const ports: PortResult[] = [
        { service: 'web', port: 8080, envVar: 'WEB_PORT' },
      ];

      const result = generateEnvContent(ports);
      expect(result).toBe('WEB_PORT=8080\n');
    });
  });

  describe('writePortsToFile', () => {
    const mockWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>;

    it('should write ports to file correctly', () => {
      const ports: PortResult[] = [
        { service: 'frontend', port: 3100, envVar: 'FRONTEND_PORT' },
        { service: 'backend', port: 5100, envVar: 'BACKEND_PORT' },
      ];

      writePortsToFile(ports, '.env.test');

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('.env.test'),
        'FRONTEND_PORT=3100\nBACKEND_PORT=5100\n',
        'utf-8'
      );
      expect(console.log).toHaveBeenCalledWith('Port settings written to .env.test:');
      expect(console.log).toHaveBeenCalledWith('  FRONTEND_PORT=3100 (frontend)');
      expect(console.log).toHaveBeenCalledWith('  BACKEND_PORT=5100 (backend)');
    });

    it('should handle different output paths', () => {
      const ports: PortResult[] = [
        { service: 'web', port: 8080, envVar: 'WEB_PORT' },
      ];

      writePortsToFile(ports, '/tmp/ports.env');

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('ports.env'),
        'WEB_PORT=8080\n',
        'utf-8'
      );
    });

    it('should log each port correctly', () => {
      const ports: PortResult[] = [
        { service: 'api', port: 5000, envVar: 'API_PORT' },
        { service: 'cache', port: 6379, envVar: 'CACHE_PORT' },
      ];

      writePortsToFile(ports, 'output.env');

      expect(console.log).toHaveBeenCalledWith('Port settings written to output.env:');
      expect(console.log).toHaveBeenCalledWith('  API_PORT=5000 (api)');
      expect(console.log).toHaveBeenCalledWith('  CACHE_PORT=6379 (cache)');
    });
  });

  describe('generatePorts', () => {
    const mockLoadConfig = config.loadConfig as jest.MockedFunction<typeof config.loadConfig>;
    const mockGeneratePortNumbers = portCalculator.generatePortNumbers as jest.MockedFunction<typeof portCalculator.generatePortNumbers>;
    const mockWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>;

    it('should use default config path when not specified', async () => {
      const mockConfig = {
        basePort: { web: 3000 },
        outputFile: '.env',
        offsetRange: 1000,
      };
      const mockPorts: PortResult[] = [
        { service: 'web', port: 3100, envVar: 'WEB_PORT' },
      ];

      mockLoadConfig.mockReturnValue(mockConfig);
      mockGeneratePortNumbers.mockReturnValue(mockPorts);

      await generatePorts({});

      expect(mockLoadConfig).toHaveBeenCalledWith('.branch2ports');
      expect(mockGeneratePortNumbers).toHaveBeenCalledWith(
        mockConfig.basePort,
        mockConfig.offsetRange
      );
      expect(mockWriteFileSync).toHaveBeenCalled();
    });

    it('should use custom config path when specified', async () => {
      const mockConfig = {
        basePort: { api: 5000 },
        outputFile: '.env.production',
        offsetRange: 500,
      };
      const mockPorts: PortResult[] = [
        { service: 'api', port: 5200, envVar: 'API_PORT' },
      ];

      mockLoadConfig.mockReturnValue(mockConfig);
      mockGeneratePortNumbers.mockReturnValue(mockPorts);

      await generatePorts({ config: 'custom.config.json' });

      expect(mockLoadConfig).toHaveBeenCalledWith('custom.config.json');
      expect(mockGeneratePortNumbers).toHaveBeenCalledWith(
        mockConfig.basePort,
        mockConfig.offsetRange
      );
    });

    it('should use CLI output option over config outputFile', async () => {
      const mockConfig = {
        basePort: { web: 3000 },
        outputFile: '.env',
        offsetRange: 1000,
      };
      const mockPorts: PortResult[] = [
        { service: 'web', port: 3100, envVar: 'WEB_PORT' },
      ];

      mockLoadConfig.mockReturnValue(mockConfig);
      mockGeneratePortNumbers.mockReturnValue(mockPorts);

      await generatePorts({ output: '.env.override' });

      // Should write to CLI specified output, not config outputFile
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('.env.override'),
        expect.any(String),
        'utf-8'
      );
    });

    it('should handle empty basePort configuration', async () => {
      const mockConfig = {
        basePort: {},
        outputFile: '.env',
        offsetRange: 1000,
      };

      mockLoadConfig.mockReturnValue(mockConfig);
      mockGeneratePortNumbers.mockReturnValue([]);

      await generatePorts({});

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.any(String),
        '\n',
        'utf-8'
      );
    });
  });
});