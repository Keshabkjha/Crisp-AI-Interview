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

## Application Workflow

### Interviewer flow

1. Launch the app and select Interviewer mode.
2. Upload candidate resumes and capture candidate details.
3. Configure interview parameters (skills, duration, difficulty, and scoring).
4. Start the interview session with AI-generated or offline fallback prompts.
5. Review analytics, feedback, and exportable reports.

### Interviewee flow

1. Launch the app and select Interviewee mode.
2. Provide profile details and upload a resume (optional).
3. Choose skills and interview preferences.
4. Complete the timed interview with AI-generated questions.
5. Review performance feedback and recommendations.

## Application Details

### Core modules

- **Interview setup:** Skill selection, timers, scoring rules, and mode configuration.
- **Interview session:** Guided questions with real-time timing and scoring support.
- **Resume management:** Upload, preview, and download candidate resumes.
- **Analytics dashboard:** Charts, insights, and exportable reports.
- **Offline resiliency:** Automatic fallback prompts when Gemini API access is unavailable.

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

## CI Workflow

GitHub Actions runs the CI workflow on every pull request and on pushes to `main` or `master`:

1. Install dependencies with `npm ci`.
2. Lint and typecheck the codebase.
3. Run unit tests (Vitest).
4. Build the production bundle.
5. Run Playwright end-to-end tests.

## Project Structure

- **components/** - React UI components
- **hooks/** - Custom React hooks
- **services/** - API clients and business logic
- **schemas/** - Zod validation schemas
- **data/** - Static question banks and fixtures
- **tests/** - Unit tests
- **e2e/** - Playwright end-to-end tests

## Testing

```bash
npm run test         # Unit tests
npm run test:watch   # Watch mode
npm run test:e2e     # End-to-end tests
npm run test:e2e:ui  # Playwright UI mode
```

## Troubleshooting

- **Gemini API key setup:**
  - Copy `.env.example` to `.env`.
  - Create a Gemini API key at <https://aistudio.google.com/app/apikey> and set `VITE_GEMINI_API_KEY=your_api_key_here`.
  - Restart the dev server after updating `.env`.
- **Offline mode:** The app still works without an API key by using offline prompts.
- **Dev server port in use:** Run `npm run dev -- --port 3001` (or another open port, like `--port 3002`).
- **Check port usage (macOS/Linux):** Use `lsof -i :5173` to verify if the default port is busy.

## Deployment

The production site is hosted on Netlify. To deploy manually:

```bash
npm run build
```

Publish the `dist` directory.

## Contributing

Please review [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## Code of Conduct

Please review [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community expectations.

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## Maintainer

**Keshab Kumar**  
Email: [keshabkumarjha876@gmail.com](mailto:keshabkumarjha876@gmail.com)

### Connect

- GitHub: https://github.com/keshabkjha
- LinkedIn: https://www.linkedin.com/in/keshabkjha/
- Facebook: https://www.facebook.com/keshabkjha
- Instagram: https://www.instagram.com/keshabkjha
- X (Twitter): https://x.com/Keshabkjha
- Threads: https://www.threads.com/@keshabkjha
- Kaggle: https://www.kaggle.com/keshabkkumar
- Codolio: https://codolio.com/profile/Keshabkjha
- LeetCode: https://leetcode.com/Keshabkjha/
- Medium: https://medium.com/@keshabkjha
- Linktree: https://linktr.ee/Keshabkjha
- Dev.to: https://dev.to/keshabkjha
- Commudle: https://www.commudle.com/users/Keshabkjha
- Wonderful.dev: https://wonderful.dev/Keshabkjha

## License

This project is licensed under the [MIT License](LICENSE).

## Maintainer

- **Name:** Keshab Kumar
- **Email:** keshabkumarjha876@gmail.com
- **GitHub:** https://github.com/keshabkjha
- **LinkedIn:** https://www.linkedin.com/in/keshabkjha/
