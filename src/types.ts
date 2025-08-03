export interface Config {
  basePort: Record<string, number>;
  outputFile: string;
  offsetRange: number;
}

export interface CLIOptions {
  config?: string;
  output?: string;
}

export interface PortResult {
  service: string;
  port: number;
  envVar: string;
}