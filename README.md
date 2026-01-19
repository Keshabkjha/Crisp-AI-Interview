# Crisp AI Interview

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

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Variables

Copy the example environment file and provide a Gemini API key.

```bash
cp .env.example .env
```

| Variable | Description | Required |
| --- | --- | --- |
| `VITE_GEMINI_API_KEY` | Gemini API key for AI-powered flows | Optional (app falls back to offline mode) |

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Testing

```bash
npm run test
npm run test:e2e
```

### Linting

```bash
npm run lint
```

## Deployment

The production site is hosted on Netlify. To deploy manually, run:

```bash
npm run build
```

and publish the `dist` directory.

## Contributing

Please review [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## License

This project is licensed under the [MIT License](LICENSE).
