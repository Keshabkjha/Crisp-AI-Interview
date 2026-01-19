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

## Testing

```bash
npm run test
npm run test:e2e
```

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
- **LinkedIn:** https://www.linkedin.com/in/keshabkjha/

## Links

- **GitHub:** https://github.com/keshabkjha
- **LinkedIn:** https://www.linkedin.com/in/keshabkjha/
- **Facebook:** https://www.facebook.com/keshabkjha
- **Instagram:** https://www.instagram.com/keshabkjha
- **X:** https://x.com/Keshabkjha
- **Threads:** https://www.threads.com/@keshabkjha
- **Kaggle:** https://www.kaggle.com/keshabkkumar
- **Codolio:** https://codolio.com/profile/Keshabkjha
- **LeetCode:** https://leetcode.com/Keshabkjha/
- **Medium:** https://medium.com/@keshabkjha
- **Dev.to:** https://dev.to/keshabkjha
- **Commudle:** https://www.commudle.com/users/Keshabkjha
- **Wonderful.dev:** https://wonderful.dev/Keshabkjha
- **Linktree:** https://linktr.ee/Keshabkjha
