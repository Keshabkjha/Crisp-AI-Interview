# Contributing to Crisp AI Interview

Thanks for your interest in contributing! Please follow these guidelines to keep contributions smooth and consistent.

## Code of Conduct

This project follows the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold these standards.

## Getting Started

1. Fork the repository and create your branch from `main`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

## Development Workflow

- Run the dev server:
  ```bash
  npm run dev
  ```
- Run linting:
  ```bash
  npm run lint
  ```
- Run unit tests:
  ```bash
  npm run test
  ```
- Run end-to-end tests:
  ```bash
  npm run test:e2e
  ```

## Pull Request Checklist

- [ ] Ensure linting and tests pass.
- [ ] Keep changes focused and minimal.
- [ ] Update documentation when behavior changes.

## Reporting Issues

Please open an issue with clear reproduction steps and expected behavior.
