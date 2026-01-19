import { http, HttpResponse, type RequestHandler } from 'msw';

export const handlers: RequestHandler[] = [
  http.get('/api/health', () =>
    HttpResponse.json({ status: 'ok' })
  ),
];
