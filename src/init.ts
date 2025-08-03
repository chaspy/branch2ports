import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from './types';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

export async function initConfig(configPath: string = '.branch2ports'): Promise<void> {
  console.log('🚀 Creating branch2ports configuration file\n');

  const fullPath = path.resolve(configPath);
  
  if (fs.existsSync(fullPath)) {
    const overwrite = await question(`Configuration file ${configPath} already exists. Overwrite? (y/N): `);
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log('Configuration file creation cancelled.');
      rl.close();
      return;
    }
  }

  const outputFile = await question('Specify output file name (.env): ') || '.env';
  const offsetRangeInput = await question('Specify offset range (1000): ');
  const offsetRange = parseInt(offsetRangeInput) || 1000;

  console.log('\n📋 Configure service ports');
  console.log('Press Enter without input to use default values\n');

  const basePort: Record<string, number> = {};
  
  const defaultServices = [
    { name: 'frontend', port: 3000 },
    { name: 'backend', port: 5000 },
    { name: 'database', port: 5432 }
  ];

  for (const { name, port } of defaultServices) {
    const serviceName = await question(`Service name (${name}): `) || name;
    const portInput = await question(`Port number (${port}): `);
    const servicePort = parseInt(portInput) || port;
    basePort[serviceName] = servicePort;
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const addMore = await question('\nAdd another service? (y/N): ');
    if (addMore.toLowerCase() !== 'y' && addMore.toLowerCase() !== 'yes') {
      break;
    }

    const serviceName = await question('Service name: ');
    if (!serviceName.trim()) {
      console.log('No service name entered. Skipping.');
      continue;
    }

    const portInput = await question('Port number: ');
    const servicePort = parseInt(portInput);
    if (isNaN(servicePort) || servicePort <= 0 || servicePort > 65535) {
      console.log('Invalid port number. Skipping.');
      continue;
    }

    basePort[serviceName.trim()] = servicePort;
  }

  const config: Config = {
    basePort,
    outputFile,
    offsetRange
  };

  try {
    const configData = JSON.stringify(config, null, 2);
    fs.writeFileSync(fullPath, configData, 'utf-8');
    
    console.log(`\n✅ Configuration file ${configPath} created!`);
    console.log('\n📝 Configuration:');
    console.log(`  Output file: ${outputFile}`);
    console.log(`  Offset range: ${offsetRange}`);
    console.log('  Services:');
    for (const [service, port] of Object.entries(basePort)) {
      console.log(`    ${service}: ${port}`);
    }
    console.log('\n🎉 Ready! Run npx branch2ports to generate port numbers.');
  } catch (error) {
    console.error('Failed to create configuration file:', error);
  } finally {
    rl.close();
  }
}