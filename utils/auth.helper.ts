import { Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ENV } from '../config/env.config';

/**
 * Creates an authenticated browser context by logging in once and saving the storage state.
 * This enables session reuse across tests to avoid redundant login steps.
 */
export async function createAuthenticatedContext(browser: Browser): Promise<BrowserContext> {
  const context = await browser.newContext();
  const page = await context.newPage();
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(
    ENV.credentials.standardUser.username,
    ENV.credentials.standardUser.password,
  );

  // Wait for successful navigation to inventory
  await page.waitForURL('**/inventory.html');
  await page.close();

  return context;
}

/**
 * Helper to get a logged-in page from an existing authenticated context.
 */
export async function getAuthenticatedPage(context: BrowserContext): Promise<Page> {
  const page = await context.newPage();
  await page.goto('/inventory.html');
  return page;
}
