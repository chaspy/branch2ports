import { calculateOffset, generatePortNumbers } from '../port-calculator';

describe('port-calculator', () => {
  describe('calculateOffset', () => {
    it('should generate consistent offsets for same input', () => {
      const input = 'test-repository-main';
      const range = 1000;
      
      const offset1 = calculateOffset(input, range);
      const offset2 = calculateOffset(input, range);
      
      expect(offset1).toBe(offset2);
      expect(offset1).toBeGreaterThanOrEqual(0);
      expect(offset1).toBeLessThan(range);
    });

    it('should generate different offsets for different inputs', () => {
      const range = 1000;
      
      const offset1 = calculateOffset('repo1-main', range);
      const offset2 = calculateOffset('repo2-main', range);
      const offset3 = calculateOffset('repo1-feature', range);
      
      // While theoretically collisions are possible, they should be rare
      const offsets = [offset1, offset2, offset3];
      const uniqueOffsets = new Set(offsets);
      expect(uniqueOffsets.size).toBeGreaterThan(1);
    });

    it('should respect the offset range', () => {
      const input = 'test-input';
      
      const offset1 = calculateOffset(input, 100);
      expect(offset1).toBeGreaterThanOrEqual(0);
      expect(offset1).toBeLessThan(100);
      
      const offset2 = calculateOffset(input, 500);
      expect(offset2).toBeGreaterThanOrEqual(0);
      expect(offset2).toBeLessThan(500);
    });
  });

  describe('generatePortNumbers', () => {
    // Mock git commands
    
    beforeEach(() => {
      jest.spyOn(require('child_process'), 'execSync').mockImplementation((cmd: unknown) => {
        const cmdStr = cmd as string;
        if (cmdStr.includes('git remote get-url origin')) {
          return 'https://github.com/test/repo.git\n';
        }
        if (cmdStr.includes('git rev-parse --abbrev-ref HEAD')) {
          return 'test-branch\n';
        }
        return '';
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should generate port numbers with correct offset', () => {
      const basePort = {
        frontend: 3000,
        backend: 5000,
        database: 5432
      };
      const offsetRange = 1000;
      
      const ports = generatePortNumbers(basePort, offsetRange);
      
      expect(ports).toHaveLength(3);
      
      // All ports should have the same offset
      const frontendOffset = ports.find(p => p.service === 'frontend')!.port - 3000;
      const backendOffset = ports.find(p => p.service === 'backend')!.port - 5000;
      const databaseOffset = ports.find(p => p.service === 'database')!.port - 5432;
      
      expect(frontendOffset).toBe(backendOffset);
      expect(backendOffset).toBe(databaseOffset);
      expect(frontendOffset).toBeGreaterThanOrEqual(0);
      expect(frontendOffset).toBeLessThan(offsetRange);
    });

    it('should generate correct environment variable names', () => {
      const basePort = {
        'web-server': 3000,
        'api_service': 5000,
        'database': 5432
      };
      
      const ports = generatePortNumbers(basePort, 1000);
      
      expect(ports.find(p => p.service === 'web-server')?.envVar).toBe('WEB-SERVER_PORT');
      expect(ports.find(p => p.service === 'api_service')?.envVar).toBe('API_SERVICE_PORT');
      expect(ports.find(p => p.service === 'database')?.envVar).toBe('DATABASE_PORT');
    });

    it('should handle git command failures gracefully', () => {
      // Mock git commands to throw errors
      jest.spyOn(require('child_process'), 'execSync').mockImplementation(() => {
        throw new Error('Git command failed');
      });
      
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const basePort = { frontend: 3000 };
      const ports = generatePortNumbers(basePort, 1000);
      
      expect(ports).toHaveLength(1);
      expect(ports[0].port).toBeGreaterThanOrEqual(3000);
      expect(ports[0].port).toBeLessThan(4000);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to'));
      
      consoleWarnSpy.mockRestore();
    });
  });
});