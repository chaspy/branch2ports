# branch2ports

[![CI](https://github.com/chaspy/branch2ports/actions/workflows/ci.yml/badge.svg)](https://github.com/chaspy/branch2ports/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/branch2ports.svg)](https://www.npmjs.com/package/branch2ports)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A CLI tool that dynamically generates port numbers based on repository and branch names

## Overview

`branch2ports` is a tool designed to avoid port conflicts when developing with git worktree or multiple branches in parallel. It generates unique port numbers by hashing the combination of repository identifier and branch name, then calculating an offset to add to base ports.

## Usage

### Initial Setup

```bash
# Create configuration file interactively
npx branch2ports init
```

### Port Generation

```bash
# Basic usage
npx branch2ports

# Or explicitly specify generate command
npx branch2ports generate

# Specify custom configuration file
npx branch2ports --config .my-config

# Specify output file
npx branch2ports --output .env.local
```

## Configuration

Create a `.branch2ports` file in your project root. Refer to `.branch2ports.example` for a sample configuration.

```json
{
  "basePort": {
    "frontend": 3000,
    "backend": 5000,
    "database": 5432
  },
  "outputFile": ".env",
  "offsetRange": 1000
}
```

### Configuration Options

- `basePort`: Define base port numbers for each service
- `outputFile`: Output file name for generated port numbers (default: `.env`)
- `offsetRange`: Range for offset values (default: 1000)

## How It Works

1. Retrieves Git repository identifier (remote URL → repository root path → current directory, in order of preference) and branch name
2. Hashes the combination of repository identifier + branch name
3. Calculates offset value as the hash modulo `offsetRange`
4. Determines final port numbers by adding offset to base ports
5. Writes the results to the specified output file as environment variables

**Uniqueness Guarantee**: The same repository and branch combination always generates the same port numbers, while different repositories or branches generate different port numbers.

## Output Example

```bash
# .env file output example
FRONTEND_PORT=3247
BACKEND_PORT=5247
DATABASE_PORT=5679
```

## Use Cases

- Parallel development with git worktree
- Local development environment with multiple branches
- Port management for Docker Compose
- Avoiding port conflicts within development teams

## Technical Specifications

- **Language**: TypeScript
- **Runtime**: Node.js
- **Dependencies**: Minimal (CLI libraries like commander.js)
- **Distribution**: npm package (executable via npx)

## Development & Contributing

```bash
# Setup development environment
npm install
npm run build

# Run tests
npm test

# Build package
npm run build
```