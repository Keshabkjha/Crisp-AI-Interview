# Crisp AI Interview

[![CI](https://github.com/Keshabkjha/Crisp-AI-Interview/actions/workflows/ci.yml/badge.svg)](https://github.com/Keshabkjha/Crisp-AI-Interview/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Crisp AI Interview is an AI-powered interview practice and screening platform that helps teams and candidates run structured technical interviews with analytics, offline resiliency, and resume-driven question flows.

**Live demo:** https://crispai.netlify.app/

## Features

- AI-generated interview questions powered by Google Gemini (with offline fallback prompts)
- Interviewee and interviewer modes with dashboards and analytics
- Resume upload, parsing, and candidate detail capture
- Configurable interview settings with timers and scoring
- Exportable reports and insights

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Google Gemini API integration
- Chart.js analytics
- Vitest + React Testing Library
- Playwright end-to-end tests

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and provide a Gemini API key.

- macOS/Linux

```bash
cp .env.example .env
```

- Windows (PowerShell)

```powershell
Copy-Item .env.example .env
```

| Variable | Description | Required |
| --- | --- | --- |
| `VITE_GEMINI_API_KEY` | Gemini API key for AI-powered flows | Optional (app falls back to offline mode) |

### Run locally

```bash
npm run dev
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build a production bundle |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint the codebase |
| `npm run typecheck` | Run TypeScript checks only |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |
| `npm run test:e2e:ui` | Run Playwright in UI mode |

## Project Structure

- `components/` - React UI components
- `hooks/` - Custom React hooks
- `services/` - API clients and business logic
- `schemas/` - Zod validation schemas
- `data/` - Static question banks and fixtures
- `tests/` - Unit tests
- `e2e/` - Playwright end-to-end tests

## Testing

```bash
npm run test         # Unit tests
npm run test:watch   # Watch mode
npm run test:e2e     # End-to-end tests
npm run test:e2e:ui  # Playwright UI mode
```

## Troubleshooting

- **Gemini API key issues:** The app falls back to offline mode if no key is provided.
- **Dev server port in use:** Run `npm run dev -- --port 3000`.

## Deployment

The production site is hosted on Netlify. To deploy manually:

```bash
npm run build
```

Publish the `dist` directory.

## Contributing

Please review [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## License

This project is licensed under the [MIT License](LICENSE).

## Maintainer

- **Name:** Keshab Kumar
- **Email:** keshabkumarjha876@gmail.com
- **GitHub:** https://github.com/keshabkjha
- **LinkedIn:** https://www.linkedin.com/in/keshabkjha/
