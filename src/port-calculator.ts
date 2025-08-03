import * as crypto from 'crypto';
import { execSync } from 'child_process';
import { PortResult } from './types';

export function getRepositoryIdentifier(): string {
  try {
    const remoteUrl = execSync('git remote get-url origin', { 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();
    return remoteUrl;
  } catch {
    try {
      const repoRoot = execSync('git rev-parse --show-toplevel', { 
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
      }).trim();
      return repoRoot;
    } catch {
      console.warn('Failed to identify Git repository. Using current directory.');
      return process.cwd();
    }
  }
}

export function getCurrentBranch(): string {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();
    return branch;
  } catch {
    console.warn('Failed to get Git branch. Using directory name only.');
    return '';
  }
}

export function calculateOffset(input: string, range: number): number {
  const hash = crypto.createHash('md5').update(input).digest('hex');
  const numericHash = parseInt(hash.substring(0, 8), 16);
  return numericHash % range;
}

export function generatePortNumbers(
  basePort: Record<string, number>,
  offsetRange: number
): PortResult[] {
  const repositoryId = getRepositoryIdentifier();
  const branchName = getCurrentBranch();
  const seedString = `${repositoryId}-${branchName}`;
  
  console.log(`Repository: ${repositoryId}`);
  console.log(`Branch: ${branchName || '(unknown)'}`);
  console.log(`Seed string: ${seedString}`);
  
  const offset = calculateOffset(seedString, offsetRange);
  console.log(`Offset: ${offset}`);
  
  const results: PortResult[] = [];
  
  for (const [service, port] of Object.entries(basePort)) {
    const newPort = port + offset;
    const envVar = `${service.toUpperCase()}_PORT`;
    
    results.push({
      service,
      port: newPort,
      envVar,
    });
  }
  
  return results;
}