import { useMemo } from 'react';

const offlineMessages = {
  setupNotice:
    'You are currently offline. The interview will use a standard set of questions.',
  offlineDetectedNotice:
    'You are offline. The offline interview has started with a standard question set.',
  offlineStartLoading:
    'Offline interview starting with a standard question set...',
  offlineStartNotice:
    'The offline interview has started with a standard question set.',
  aiUnavailableStart: 'All AI models are unavailable. Starting offline interview...',
  aiUnavailableNotice:
    'All AI models are unavailable. The offline interview has started with a standard question set.',
  offlineTour:
    "Don't worry about losing connection. If you go offline, the interview will seamlessly continue with a standard set of questions.",
  retryingAi: (attempt: number, delayMs: number) =>
    `Retrying AI question generation in ${Math.ceil(delayMs / 1000)} seconds (attempt ${attempt}).`,
};

export function useOfflineMessaging() {
  return useMemo(() => offlineMessages, []);
}
