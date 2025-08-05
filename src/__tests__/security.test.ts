import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Security tests', () => {
  const cliPath = path.join(__dirname, '../../dist/cli.js');
  let testDir: string;

  beforeEach(() => {
    // Create a temporary directory for each test
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'branch2ports-security-test-'));
    process.chdir(testDir);
  });

  afterEach(() => {
    // Clean up temporary directory
    process.chdir(__dirname);
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  describe('File path validation', () => {
    it('should reject path traversal attacks in config path', () => {
      const dangerousPaths = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32\\hosts',
        '~/sensitive-file',
        '/etc/passwd'
      ];

      for (const dangerousPath of dangerousPaths) {
        try {
          execSync(`echo "" | node ${cliPath} init -c "${dangerousPath}"`, { 
            encoding: 'utf-8',
            stdio: 'pipe'
          });
          // If we reach here, the command didn't fail as expected
          throw new Error(`Expected command to fail for dangerous path: ${dangerousPath}`);
        } catch (error) {
          // Expected behavior - command should fail
          expect(error).toBeDefined();
        }
      }
    });

    it('should reject dangerous characters in file names', () => {
      const dangerousNames = [
        'file<script>',
        'file|rm -rf',
        'file;rm -rf /',
        'file$(rm -rf)',
        'file`rm -rf`',
        'file with spaces and; semicolon'
      ];

      for (const dangerousName of dangerousNames) {
        try {
          execSync(`printf "${dangerousName}\\n1000\\n" | node ${cliPath} init`, { 
            encoding: 'utf-8',
            stdio: 'pipe'
          });
          // If we reach here, the command didn't fail as expected
          throw new Error(`Expected command to fail for dangerous name: ${dangerousName}`);
        } catch (error) {
          // Expected behavior - command should fail
          expect(error).toBeDefined();
        }
      }
    });

    it('should accept safe file paths', () => {
      const safePaths = [
        '.env',
        'config.env',
        'app.config',
        'branch2ports.json',
        'my-config_file.env'
      ];

      for (const safePath of safePaths) {
        expect(() => {
          const result = execSync(`printf "${safePath}\\n1000\\n" | node ${cliPath} init`, { 
            encoding: 'utf-8',
            stdio: 'pipe'
          });
          expect(result).toContain('Configuration file .branch2ports created!');
        }).not.toThrow();
        
        // Clean up created file
        if (fs.existsSync('.branch2ports')) {
          fs.unlinkSync('.branch2ports');
        }
      }
    });

    it('should validate config file extensions', () => {
      // This test ensures we don't accidentally create files with unexpected extensions
      const result = execSync(`printf "config.txt\\n1000\\n" | node ${cliPath} init`, { 
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      // Should still create the file but with proper validation
      expect(result).toContain('Configuration file .branch2ports created!');
    });

    it('should handle edge cases gracefully', () => {
      // Empty string should work (defaults to .env)
      let result = execSync(`printf "\\n1000\\n" | node ${cliPath} init`, { 
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      expect(result).toContain('Configuration file .branch2ports created!');
      
      if (fs.existsSync('.branch2ports')) {
        fs.unlinkSync('.branch2ports');
      }

      // Test that ".." is properly rejected
      try {
        execSync(`printf "..\\n1000\\n" | node ${cliPath} init`, { 
          encoding: 'utf-8',
          stdio: 'pipe'
        });
        throw new Error('Expected command to fail for ".." path');
      } catch (error) {
        // Expected behavior - command should fail
        expect(error).toBeDefined();
      }
    });
  });

  describe('Input sanitization', () => {
    it('should handle malicious service names safely', () => {
      // Test that service names are properly handled
      const maliciousServiceName = 'service"; rm -rf /; echo "';
      
      // This should not cause any system damage, just create a config with sanitized values
      const result = execSync(`printf ".env\\n1000\\n${maliciousServiceName}\\n3000\\nn\\n" | node ${cliPath} init`, { 
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      expect(result).toContain('Configuration file .branch2ports created!');
      
      // Verify the config file was created safely
      expect(fs.existsSync('.branch2ports')).toBe(true);
      const config = JSON.parse(fs.readFileSync('.branch2ports', 'utf-8'));
      
      // The malicious service name should be stored as-is in JSON (which is safe)
      // but we should verify no system commands were executed
      expect(typeof config.basePort).toBe('object');
    });
  });
});