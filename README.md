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

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- Git

### Getting Started

```bash
# Clone the repository
git clone https://github.com/chaspy/branch2ports.git
cd branch2ports

# Install dependencies
npm install

# Build the project
npm run build

# Run the CLI locally
node dist/cli.js --help
```

### Development Workflow

```bash
# Watch mode for development
npm run dev

# Run tests in watch mode
npm run test:watch

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Testing

We maintain comprehensive test coverage with unit tests, integration tests, and E2E tests.

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test src/__tests__/port-calculator.test.ts

# Run tests in watch mode during development
npm run test:watch
```

#### Test Structure

- `src/__tests__/*.test.ts` - Unit tests for individual modules
- `src/__tests__/e2e/*.test.ts` - End-to-end CLI tests
- `src/__tests__/fixtures/` - Test fixtures and mock data

#### Writing Tests

When adding new features or fixing bugs:

1. Write tests first (TDD approach recommended)
2. Ensure tests pass locally before submitting PR
3. Maintain or improve code coverage

Example test:
```typescript
describe('calculateOffset', () => {
  it('should generate consistent offsets for same input', () => {
    const offset1 = calculateOffset('repo-main', 1000);
    const offset2 = calculateOffset('repo-main', 1000);
    expect(offset1).toBe(offset2);
  });
});
```

### Pull Request Guidelines

1. **Fork & Clone**: Fork the repository and clone your fork
2. **Branch**: Create a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit**: Use conventional commits format:
   - `feat:` New features
   - `fix:` Bug fixes
   - `docs:` Documentation changes
   - `test:` Test additions or changes
   - `refactor:` Code refactoring
   - `chore:` Maintenance tasks
4. **Test**: Ensure all tests pass (`npm test`)
5. **Lint**: Fix any linting issues (`npm run lint`)
6. **Push**: Push to your fork
7. **PR**: Open a Pull Request with a clear description

### CI/CD

All pull requests are automatically tested with:
- Multiple Node.js versions (16.x, 18.x, 20.x)
- Type checking
- Linting
- Full test suite
- E2E tests

### Project Structure

```
branch2ports/
├── src/
│   ├── cli.ts           # CLI entry point
│   ├── index.ts         # Main logic
│   ├── port-calculator.ts # Port calculation logic
│   ├── config.ts        # Configuration handling
│   ├── init.ts          # Interactive setup
│   └── types.ts         # TypeScript types
├── src/__tests__/       # Test files
├── dist/                # Compiled output (git ignored)
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

### Debugging

For debugging during development:

```bash
# Run with Node.js inspector
node --inspect dist/cli.js

# View debug logs (if implemented)
DEBUG=branch2ports* node dist/cli.js
```

### Release Process

Releases are managed through GitHub Actions (coming soon):
1. Version bump in package.json
2. Create git tag
3. GitHub Actions publishes to npm

### Need Help?

- Open an issue for bugs or feature requests
- Join discussions in GitHub Discussions
- Check existing issues before creating new ones

### Code of Conduct

Please note that this project follows a standard Code of Conduct. By participating, you are expected to uphold this code.