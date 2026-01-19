import { test, expect } from '@playwright/test';

test('shows the interview setup heading', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('crisp-ai-onboarding-complete', 'true');
  });

  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: /prepare for your ai interview/i })
  ).toBeVisible();
});
