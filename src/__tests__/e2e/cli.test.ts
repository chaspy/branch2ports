import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('branch2ports CLI E2E tests', () => {
  const cliPath = path.join(__dirname, '../../../dist/cli.js');
  const fixturesPath = path.join(__dirname, '../fixtures');
  let testDir: string;

  beforeEach(() => {
    // Create a temporary directory for each test
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'branch2ports-test-'));
    process.chdir(testDir);
  });

  afterEach(() => {
    // Clean up temporary directory
    process.chdir(__dirname);
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  describe('generate command', () => {
    it('should exit cleanly without hanging', (done) => {
      // This test verifies that the generate command doesn't hang
      const startTime = Date.now();
      
      const output = execSync(`node ${cliPath}`, { 
        encoding: 'utf-8',
        timeout: 5000 // 5 second timeout
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // The command should complete quickly (less than 2 seconds)
      expect(duration).toBeLessThan(2000);
      expect(output).toContain('Port generation completed successfully');
      done();
    });

    it('should generate port numbers with default configuration', () => {
      const output = execSync(`node ${cliPath}`, { encoding: 'utf-8' });
      
      expect(output).toContain('Repository:');
      expect(output).toContain('Branch:');
      expect(output).toContain('Seed string:');
      expect(output).toContain('Offset:');
      expect(output).toContain('Port settings written to .env:');
      expect(output).toContain('Port generation completed successfully');
      
      // Check if .env file was created
      expect(fs.existsSync('.env')).toBe(true);
      
      const envContent = fs.readFileSync('.env', 'utf-8');
      expect(envContent).toMatch(/FRONTEND_PORT=\d+/);
      expect(envContent).toMatch(/BACKEND_PORT=\d+/);
      expect(envContent).toMatch(/DATABASE_PORT=\d+/);
    });

    it('should use custom configuration file', () => {
      // Copy test config to test directory
      const configPath = path.join(testDir, 'custom-config.json');
      fs.copyFileSync(path.join(fixturesPath, 'test-config.json'), configPath);
      
      const output = execSync(`node ${cliPath} --config custom-config.json`, { encoding: 'utf-8' });
      
      expect(output).toContain('Port settings written to .env.test:');
      expect(output).toContain('WEB_PORT=');
      expect(output).toContain('API_PORT=');
      expect(output).toContain('DB_PORT=');
      
      // Check if .env.test file was created (as specified in config)
      expect(fs.existsSync('.env.test')).toBe(true);
      
      const envContent = fs.readFileSync('.env.test', 'utf-8');
      expect(envContent).toMatch(/WEB_PORT=\d+/);
      expect(envContent).toMatch(/API_PORT=\d+/);
      expect(envContent).toMatch(/DB_PORT=\d+/);
    });

    it('should use custom output file when specified via CLI', () => {
      const output = execSync(`node ${cliPath} --output .env.custom`, { encoding: 'utf-8' });
      
      expect(output).toContain('Port settings written to .env.custom:');
      expect(fs.existsSync('.env.custom')).toBe(true);
    });

    it('should handle missing configuration file gracefully', () => {
      const output = execSync(`node ${cliPath} --config nonexistent.json`, { encoding: 'utf-8' });
      
      expect(output).toContain('Configuration file nonexistent.json not found. Using default settings.');
      expect(output).toContain('Port generation completed successfully');
      expect(fs.existsSync('.env')).toBe(true);
    });

    it('should generate deterministic port numbers for same repository and branch', () => {
      // Run twice and compare outputs
      const output1 = execSync(`node ${cliPath}`, { encoding: 'utf-8' });
      const env1 = fs.readFileSync('.env', 'utf-8');
      
      fs.unlinkSync('.env');
      
      const output2 = execSync(`node ${cliPath}`, { encoding: 'utf-8' });
      const env2 = fs.readFileSync('.env', 'utf-8');
      
      // Extract offset values
      const offset1 = output1.match(/Offset: (\d+)/)?.[1];
      const offset2 = output2.match(/Offset: (\d+)/)?.[1];
      
      expect(offset1).toBe(offset2);
      expect(env1).toBe(env2);
    });
  });

  describe('init command', () => {
    it('should handle EOF gracefully and create default configuration', () => {
      // Test with EOF input (simulating < /dev/null)
      const result = execSync(`node ${cliPath} init < /dev/null`, { 
        encoding: 'utf-8'
      });
      
      expect(result).toContain('Creating branch2ports configuration file');
      expect(result).toContain('Configuration file .branch2ports created!');
      expect(result).toContain('Output file: .env');
      expect(result).toContain('Offset range: 1000');
      expect(result).toContain('frontend: 3000');
      expect(result).toContain('backend: 5000');
      expect(result).toContain('database: 5432');
      
      // Verify config file was created with defaults
      expect(fs.existsSync('.branch2ports')).toBe(true);
      const config = JSON.parse(fs.readFileSync('.branch2ports', 'utf-8'));
      expect(config.outputFile).toBe('.env');
      expect(config.offsetRange).toBe(1000);
      expect(config.basePort.frontend).toBe(3000);
      expect(config.basePort.backend).toBe(5000);
      expect(config.basePort.database).toBe(5432);
    });

    it('should exit gracefully without hanging when EOF is received', (done) => {
      // This test verifies the fix for the EOF handling issue
      // It should complete within a reasonable time (5 seconds)
      const startTime = Date.now();
      
      execSync(`node ${cliPath} init < /dev/null`, { 
        encoding: 'utf-8',
        timeout: 5000 // 5 second timeout
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // The command should complete quickly (less than 2 seconds)
      expect(duration).toBeLessThan(2000);
      done();
    });

    it.skip('should not overwrite existing config without confirmation', () => {
      // Skip for now - interactive prompts are difficult to test in CI
      // TODO: Consider refactoring init command to be more testable
    });
  });

  describe('help command', () => {
    it('should display help information', () => {
      const output = execSync(`node ${cliPath} --help`, { encoding: 'utf-8' });
      
      expect(output).toContain('branch2ports');
      expect(output).toContain('A CLI tool that dynamically generates port numbers');
      expect(output).toContain('Commands:');
      expect(output).toContain('generate');
      expect(output).toContain('init');
    });
  });
});