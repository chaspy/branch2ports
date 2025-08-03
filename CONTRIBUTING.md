# Contributing to branch2ports

Thank you for your interest in contributing to branch2ports! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check existing issues to see if the bug has already been reported
2. If not, create a new issue with:
   - Clear, descriptive title
   - Detailed description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - System information (OS, Node.js version)
   - Any error messages or logs

### Suggesting Features

1. Check existing issues and discussions for similar suggestions
2. Open a new issue or discussion with:
   - Clear description of the feature
   - Use cases and benefits
   - Potential implementation approach

### Contributing Code

1. **Fork the repository** and clone it locally
2. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following our coding standards
4. **Write tests** for new functionality
5. **Run tests locally** to ensure everything passes:
   ```bash
   npm test
   npm run lint
   npm run typecheck
   ```
6. **Commit your changes** using conventional commits:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
7. **Push to your fork** and open a Pull Request

## Development Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Coding Standards

- Use TypeScript for all new code
- Follow existing code style and patterns
- Write meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Handle errors appropriately

## Testing Guidelines

- Write tests for all new features
- Maintain or improve test coverage
- Use descriptive test names
- Test edge cases and error conditions
- Run tests before submitting PR

## Commit Message Guidelines

We follow Conventional Commits specification:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Maintenance tasks

Examples:
```
feat: add support for custom port ranges
fix: handle missing git repository gracefully
docs: update installation instructions
test: add tests for config loader
```

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Add tests for new functionality
4. Keep PR focused on a single change
5. Write clear PR description
6. Be responsive to review feedback

## Questions?

Feel free to open an issue or start a discussion if you have questions!