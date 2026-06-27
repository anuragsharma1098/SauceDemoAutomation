import { test, expect, Page } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { VALID_CREDENTIALS } from '../test-data/login.data';
import { SINGLE_PRODUCT } from '../test-data/products.data';

async function loginAndPrepareCart(page: Page): Promise<{
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
}> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(VALID_CREDENTIALS.username, VALID_CREDENTIALS.password);
  await expect(page).toHaveURL(/.*inventory\.html/);

  const inventoryPage = new InventoryPage(page);
  await inventoryPage.addProductToCart(SINGLE_PRODUCT.name);
  await inventoryPage.goToCart();

  const cartPage = new CartPage(page);
  await expect(page).toHaveURL(/.*cart\.html/);
  await expect(cartPage.cartItems).toHaveCount(1);

  await cartPage.checkout();

  return {
    inventoryPage,
    cartPage,
    checkoutPage: new CheckoutPage(page),
  };
}

test.describe('Checkout Functionality', () => {
  test(
    'should complete checkout flow with valid customer information',
    { tag: ['@smoke', '@regression', '@checkout'] },
    async ({ page }) => {
      const { checkoutPage } = await loginAndPrepareCart(page);

      await allure.step('Fill checkout information', async () => {
        await checkoutPage.fillCustomerInfo('John', 'Doe', '12345');
        await checkoutPage.continueCheckout();
      });

      await allure.step('Verify checkout overview page is displayed', async () => {
        await expect(page).toHaveURL(/.*checkout-step-two\.html/);
        await expect(checkoutPage.pageTitle).toHaveText('Checkout: Overview');
      });

      await allure.step('Finish checkout and verify order completion', async () => {
        await checkoutPage.finishCheckout();
        await expect(page).toHaveURL(/.*checkout-complete\.html/);
        await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
      });
    }
  );

  test(
    'should prevent checkout when required customer details are missing',
    { tag: ['@regression', '@checkout'] },
    async ({ page }) => {
      const { checkoutPage } = await loginAndPrepareCart(page);

      await allure.step(
        'Attempt to continue checkout without entering required fields',
        async () => {
          await checkoutPage.continueCheckout();
        }
      );

      await allure.step(
        'Verify validation error is displayed and user remains on step one',
        async () => {
          await expect(checkoutPage.errorMessage).toBeVisible();
          await expect(page).toHaveURL(/.*checkout-step-one\.html/);
          await expect(checkoutPage.pageTitle).toHaveText('Checkout: Your Information');
        }
      );
    }
  );
});
