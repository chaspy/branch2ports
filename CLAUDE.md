# CLAUDE.md - AI Assistant Guidelines

This document outlines the rules and guidelines for AI assistants working on this project.

## Pull Request Management

### IMPORTANT: Never Auto-merge PRs
- **DO NOT** merge pull requests without explicit user approval
- After creating a PR, always wait for the user's review and approval
- The user will explicitly say when to merge (e.g., "merge PR #XX" or "マージして")

### PR Workflow
1. Create the PR with appropriate title and description
2. Share the PR URL with the user
3. **STOP and WAIT** for user instructions
4. Only proceed with merge when explicitly instructed

## Code Changes

### Before Making Changes
- Always explain what you plan to change and why
- For significant changes, ask for confirmation before proceeding
- Respect existing code style and conventions

### Testing
- Run all tests before committing
- Ensure CI passes before suggesting a merge
- Add tests for new functionality

## Release Process

### Version Bumps
- Only bump version numbers when explicitly asked
- Follow semantic versioning (MAJOR.MINOR.PATCH)
- Document all changes in commit messages

### Publishing
- **NEVER** publish to npm without explicit permission
- **NEVER** run `npm publish` unless explicitly instructed (e.g., "npm publishして" or "release it")
- Always run full test suite before release
- Ensure all CI checks pass
- Even after version bump, wait for explicit release instruction

## Communication

### Language
- Respond in the same language as the user
- Be concise and direct
- Acknowledge mistakes promptly

### Decision Making
- When in doubt, ask for clarification
- Don't make assumptions about user intent
- Present options rather than making unilateral decisions

## Project-Specific Rules

### branch2ports
- Maintain backward compatibility
- Keep dependencies up to date but test thoroughly
- Ensure the tool works across different environments (Linux, macOS, Windows)

## Examples of Prohibited Actions

### ❌ NEVER DO THIS:
```bash
# Creating and merging PR without permission
gh pr create --title "..." --body "..."
gh pr merge 15 --squash  # ← WRONG! Must wait for user approval

# Publishing without explicit instruction
npm publish  # ← WRONG! Even after version bump, need explicit permission
```

### ✅ CORRECT APPROACH:
```bash
# Create PR and stop
gh pr create --title "..." --body "..."
# Output: "PR created: https://github.com/.../pull/15"
# Then WAIT for user to say "merge it" or "マージして"

# After version bump, wait for instruction
git commit -m "chore: bump version to 0.1.2"
# Then WAIT for user to say "release it" or "npm publishして"
```

## Past Violations Log

### 2025-08-04
- **Violation**: Merged PR #15 without user approval
- **Violation**: Published v0.1.2 to npm without explicit permission
- **Lesson**: Always wait for explicit user instructions before merging PRs or publishing releases

---

Last updated: 2025-08-04