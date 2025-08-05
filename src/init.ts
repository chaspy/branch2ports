import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from './types';

interface ReadlineInterface {
  rl: readline.Interface;
  eofDetected: boolean;
  handleStdinEnd: () => void;
}

/**
 * Validates a file path to prevent path traversal attacks
 * @param input The file path to validate
 * @param allowedExtensions Optional array of allowed file extensions
 * @returns The validated file path
 * @throws Error if the path is invalid
 */
function validateFilePath(input: string, allowedExtensions?: string[]): string {
  // Reject dangerous patterns
  if (input.includes('..') || input.includes('~') || path.isAbsolute(input)) {
    throw new Error('Invalid file path. Please use a relative path without ".." or "~"');
  }
  
  // Validate file name characters
  const basename = path.basename(input);
  const safePattern = /^[a-zA-Z0-9._-]+$/;
  if (!safePattern.test(basename)) {
    throw new Error('File name contains invalid characters. Only letters, numbers, dots, underscores, and hyphens are allowed');
  }
  
  // Check file extension if specified
  if (allowedExtensions && allowedExtensions.length > 0) {
    const ext = path.extname(basename);
    if (!allowedExtensions.includes(ext)) {
      throw new Error(`Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`);
    }
  }
  
  return input;
}

/**
 * Creates and configures readline interface with EOF handling
 */
function createReadlineInterface(): ReadlineInterface {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let eofDetected = false;
  const handleStdinEnd = () => {
    eofDetected = true;
  };
  process.stdin.on('end', handleStdinEnd);

  return { rl, eofDetected, handleStdinEnd };
}

/**
 * Prompts user for input with EOF handling
 */
function createQuestionFunction(rlInterface: ReadlineInterface): (prompt: string) => Promise<string> {
  return (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      // If EOF was already detected, return empty string immediately
      if (rlInterface.eofDetected) {
        resolve('');
        return;
      }
      
      // Track if the question has been answered
      let answered = false;
      
      rlInterface.rl.question(prompt, (answer) => {
        answered = true;
        resolve(answer);
      });
      
      // Handle EOF (Ctrl+D or end of input)
      const handleClose = () => {
        if (!answered) {
          rlInterface.eofDetected = true;
          resolve('');
        }
      };
      
      rlInterface.rl.once('close', handleClose);
      process.stdin.once('end', handleClose);
    });
  };
}

/**
 * Cleans up readline interface and stdin handlers
 */
function cleanupReadline(rlInterface: ReadlineInterface): void {
  rlInterface.rl.close();
  process.stdin.removeListener('end', rlInterface.handleStdinEnd);
  // Resume stdin to prevent hanging
  process.stdin.resume();
  process.stdin.pause();
}

/**
 * Checks if existing config should be overwritten
 */
async function checkExistingConfig(
  configPath: string, 
  fullPath: string, 
  question: (prompt: string) => Promise<string>
): Promise<boolean> {
  if (!fs.existsSync(fullPath)) {
    return true; // Continue with creation
  }

  const overwrite = await question(`Configuration file ${configPath} already exists. Overwrite? (y/N): `);
  if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
    console.log('Configuration file creation cancelled.');
    return false; // Cancel creation
  }
  
  return true; // Continue with overwrite
}

/**
 * Prompts for and validates output file
 */
async function getOutputFile(question: (prompt: string) => Promise<string>): Promise<string> {
  const outputFileInput = await question('Specify output file name (.env): ') || '.env';
  return validateFilePath(outputFileInput);
}

/**
 * Prompts for offset range
 */
async function getOffsetRange(question: (prompt: string) => Promise<string>): Promise<number> {
  const offsetRangeInput = await question('Specify offset range (1000): ');
  return parseInt(offsetRangeInput) || 1000;
}

/**
 * Configures default services
 */
async function configureDefaultServices(
  question: (prompt: string) => Promise<string>,
  basePort: Record<string, number>
): Promise<void> {
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
}

/**
 * Prompts for additional custom services
 */
async function addCustomServices(
  question: (prompt: string) => Promise<string>,
  basePort: Record<string, number>
): Promise<void> {
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
}

/**
 * Saves configuration to file and displays summary
 */
function saveConfiguration(
  fullPath: string,
  configPath: string,
  config: Config
): void {
  const configData = JSON.stringify(config, null, 2);
  fs.writeFileSync(fullPath, configData, 'utf-8');
  
  console.log(`\n✅ Configuration file ${configPath} created!`);
  console.log('\n📝 Configuration:');
  console.log(`  Output file: ${config.outputFile}`);
  console.log(`  Offset range: ${config.offsetRange}`);
  console.log('  Services:');
  for (const [service, port] of Object.entries(config.basePort)) {
    console.log(`    ${service}: ${port}`);
  }
  console.log('\n🎉 Ready! Run npx branch2ports to generate port numbers.');
}

export async function initConfig(configPath: string = '.branch2ports'): Promise<void> {
  console.log('🚀 Creating branch2ports configuration file\n');
  
  // Validate config path
  try {
    validateFilePath(configPath);
  } catch (error) {
    console.error(`Invalid configuration file path: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
  
  const rlInterface = createReadlineInterface();
  const question = createQuestionFunction(rlInterface);
  const fullPath = path.resolve(configPath);
  
  try {
    // Check if should proceed with creation/overwrite
    const shouldContinue = await checkExistingConfig(configPath, fullPath, question);
    if (!shouldContinue) {
      cleanupReadline(rlInterface);
      return;
    }

    // Get configuration values
    let outputFile: string;
    try {
      outputFile = await getOutputFile(question);
    } catch (error) {
      console.error(`Invalid output file path: ${error instanceof Error ? error.message : error}`);
      cleanupReadline(rlInterface);
      process.exit(1);
    }
    
    const offsetRange = await getOffsetRange(question);

    // Configure services
    console.log('\n📋 Configure service ports');
    console.log('Press Enter without input to use default values\n');

    const basePort: Record<string, number> = {};
    await configureDefaultServices(question, basePort);
    await addCustomServices(question, basePort);

    // Save configuration
    const config: Config = {
      basePort,
      outputFile,
      offsetRange
    };

    saveConfiguration(fullPath, configPath, config);
    
  } catch (error) {
    console.error('Failed to create configuration file:', error);
  } finally {
    cleanupReadline(rlInterface);
  }
}