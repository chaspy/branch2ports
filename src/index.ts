import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from './config';
import { generatePortNumbers } from './port-calculator';
import { CLIOptions, PortResult } from './types';

export function generateEnvContent(ports: PortResult[]): string {
  const lines = ports.map(port => `${port.envVar}=${port.port}`);
  return lines.join('\n') + '\n';
}

export function writePortsToFile(ports: PortResult[], outputPath: string): void {
  const content = generateEnvContent(ports);
  const fullPath = path.resolve(outputPath);
  
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`Port settings written to ${outputPath}:`);
  
  ports.forEach(port => {
    console.log(`  ${port.envVar}=${port.port} (${port.service})`);
  });
}

export async function generatePorts(options: CLIOptions): Promise<void> {
  const configPath = options.config || '.branch2ports';
  const config = loadConfig(configPath);
  
  const outputFile = options.output || config.outputFile;
  
  const ports = generatePortNumbers(config.basePort, config.offsetRange);
  
  writePortsToFile(ports, outputFile);
}

export * from './types';
export * from './config';
export * from './port-calculator';