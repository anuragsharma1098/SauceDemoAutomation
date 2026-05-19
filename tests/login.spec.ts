import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import {
  VALID_CREDENTIALS,
  INVALID_CREDENTIALS_CASES,
  EMPTY_FIELD_CASES,
  LOCKED_USER,
} from '../test-data/login.data';

test.describe('Login Functionality', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // ─── Positive Scenarios ──────────────────────────────────────────────────────

  test.describe('Positive Scenarios', () => {
    test(
      'should login successfully with valid credentials',
      {
        tag: ['@smoke', '@regression', '@login'],
        annotation: { type: 'feature', description: 'Login' },
      },
      async ({ page }) => {
        await allure.step('Navigate to login page', async () => {
          await expect(page).toHaveURL('/');
          await expect(page).toHaveTitle('Swag Labs');
        });

        await allure.step('Enter valid credentials and submit', async () => {
          await loginPage.login(VALID_CREDENTIALS.username, VALID_CREDENTIALS.password);
        });

        await allure.step('Verify successful navigation to inventory page', async () => {
          await expect(page).toHaveURL(/.*inventory\.html/);
          const inventoryPage = new InventoryPage(page);
          await expect(inventoryPage.pageTitle).toBeVisible();
          await expect(inventoryPage.pageTitle).toHaveText('Products');
        });
      },
    );

    test(
      'should display login logo on the login page',
      { tag: ['@regression', '@login'] },
      async () => {
        await allure.step('Verify logo is visible', async () => {
          await expect(loginPage.loginLogo).toBeVisible();
          await expect(loginPage.loginLogo).toHaveText('Swag Labs');
        });
      },
    );

    test(
      'should show login form elements correctly',
      { tag: ['@regression', '@login'] },
      async () => {
        await allure.step('Verify username input is visible', async () => {
          await expect(loginPage.usernameInput).toBeVisible();
        });
        await allure.step('Verify password input is visible', async () => {
          await expect(loginPage.passwordInput).toBeVisible();
        });
        await allure.step('Verify login button is visible', async () => {
          await expect(loginPage.loginButton).toBeVisible();
          await expect(loginPage.loginButton).toHaveValue('Login');
        });
      },
    );

    test(
      'should allow logout after successful login',
      { tag: ['@regression', '@login'] },
      async ({ page }) => {
        await allure.step('Login with valid credentials', async () => {
          await loginPage.login(VALID_CREDENTIALS.username, VALID_CREDENTIALS.password);
          await expect(page).toHaveURL(/.*inventory\.html/);
        });

        await allure.step('Logout via burger menu', async () => {
          const inventoryPage = new InventoryPage(page);
          await inventoryPage.logout();
        });

        await allure.step('Verify redirect to login page after logout', async () => {
          await expect(page).toHaveURL('/');
          await expect(loginPage.loginButton).toBeVisible();
        });
      },
    );
  });

  // ─── Negative Scenarios ──────────────────────────────────────────────────────

  test.describe('Negative Scenarios - Invalid Credentials', () => {
    for (const { description, username, password, expectedError } of INVALID_CREDENTIALS_CASES) {
      test(
        `should show error for ${description}`,
        { tag: ['@regression', '@login'] },
        async () => {
          await allure.step(`Enter credentials: ${description}`, async () => {
            await loginPage.login(username, password);
          });

          await allure.step('Verify error message is displayed', async () => {
            await expect(loginPage.errorMessage).toBeVisible();
          });

          await allure.step('Verify correct error message text', async () => {
            const errorText = await loginPage.getErrorMessage();
            expect(errorText).toContain(expectedError);
          });

          await allure.step('Verify error icon is visible on input fields', async () => {
            await expect(loginPage.usernameInput).toHaveClass(/error/);
            await expect(loginPage.passwordInput).toHaveClass(/error/);
          });
        },
      );
    }
  });

  test.describe('Negative Scenarios - Empty Fields', () => {
    for (const { description, username, password, expectedError } of EMPTY_FIELD_CASES) {
      test(
        `should show validation error for ${description}`,
        { tag: ['@regression', '@login'] },
        async () => {
          await allure.step(`Submit form with ${description}`, async () => {
            await loginPage.login(username, password);
          });

          await allure.step('Verify error message is shown', async () => {
            await expect(loginPage.errorMessage).toBeVisible();
            const errorText = await loginPage.getErrorMessage();
            expect(errorText).toContain(expectedError);
          });
        },
      );
    }
  });

  // ─── Edge Cases ──────────────────────────────────────────────────────────────

  test.describe('Edge Cases', () => {
    test(
      'should not login with locked out user',
      { tag: ['@regression', '@login'] },
      async ({ page }) => {
        await allure.step('Attempt login with locked out user', async () => {
          await loginPage.login(LOCKED_USER.username, LOCKED_USER.password);
        });

        await allure.step('Verify locked out error is shown', async () => {
          await expect(loginPage.errorMessage).toBeVisible();
          const errorText = await loginPage.getErrorMessage();
          expect(errorText).toContain(LOCKED_USER.expectedError);
        });

        await allure.step('Verify user stays on login page', async () => {
          await expect(page).toHaveURL('/');
        });
      },
    );

    test(
      'should dismiss error message when X button is clicked',
      { tag: ['@regression', '@login'] },
      async () => {
        await allure.step('Trigger a login error', async () => {
          await loginPage.login('bad_user', 'bad_pass');
          await expect(loginPage.errorMessage).toBeVisible();
        });

        await allure.step('Click the X button to dismiss error', async () => {
          await loginPage.dismissError();
        });

        await allure.step('Verify error message is no longer visible', async () => {
          await expect(loginPage.errorMessage).not.toBeVisible();
        });
      },
    );

    test(
      'should not be accessible after logout (session invalidation)',
      { tag: ['@regression', '@login'] },
      async ({ page }) => {
        await allure.step('Login successfully', async () => {
          await loginPage.login(VALID_CREDENTIALS.username, VALID_CREDENTIALS.password);
          await expect(page).toHaveURL(/.*inventory\.html/);
        });

        await allure.step('Logout', async () => {
          const inventoryPage = new InventoryPage(page);
          await inventoryPage.logout();
          await expect(page).toHaveURL('/');
        });

        await allure.step('Attempt to navigate back to inventory directly', async () => {
          await page.goto('/inventory.html');
          // Should be redirected back to login
          await expect(page).toHaveURL('/');
        });
      },
    );

    test(
      'should handle whitespace-only credentials',
      { tag: ['@regression', '@login'] },
      async () => {
        await allure.step('Submit with whitespace username and password', async () => {
          await loginPage.login('   ', '   ');
        });

        await allure.step('Verify error message is displayed', async () => {
          await expect(loginPage.errorMessage).toBeVisible();
        });
      },
    );

    test(
      'should handle SQL injection attempt gracefully',
      { tag: ['@regression', '@login'] },
      async ({ page }) => {
        await allure.step("Submit SQL injection payload as credentials", async () => {
          await loginPage.login("' OR '1'='1", "' OR '1'='1");
        });

        await allure.step('Verify app does not crash and stays on login page', async () => {
          await expect(page).toHaveURL('/');
          await expect(loginPage.errorMessage).toBeVisible();
        });
      },
    );

    test(
      'should handle very long input strings',
      { tag: ['@regression', '@login'] },
      async ({ page }) => {
        const longString = 'a'.repeat(500);

        await allure.step('Submit with very long credentials', async () => {
          await loginPage.login(longString, longString);
        });

        await allure.step('Verify app handles gracefully', async () => {
          await expect(page).toHaveURL('/');
          await expect(loginPage.errorMessage).toBeVisible();
        });
      },
    );
  });
});
