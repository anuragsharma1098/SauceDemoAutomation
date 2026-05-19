import { test, expect, Page } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { VALID_CREDENTIALS } from '../test-data/login.data';
import { SINGLE_PRODUCT, MULTI_PRODUCTS, PRODUCTS } from '../test-data/products.data';

/**
 * Shared login helper — avoids duplicating login steps across tests.
 */
async function loginAndNavigate(page: Page): Promise<{
  inventoryPage: InventoryPage;
  cartPage: CartPage;
}> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(VALID_CREDENTIALS.username, VALID_CREDENTIALS.password);
  await expect(page).toHaveURL(/.*inventory\.html/);

  return {
    inventoryPage: new InventoryPage(page),
    cartPage: new CartPage(page),
  };
}

test.describe('Cart Functionality', () => {
  // ─── Add to Cart ─────────────────────────────────────────────────────────────

  test.describe('Add to Cart', () => {
    test(
      'should add a single product to cart and update badge count',
      { tag: ['@smoke', '@regression', '@cart'] },
      async ({ page }) => {
        const { inventoryPage } = await loginAndNavigate(page);

        await allure.step('Verify cart badge is not visible initially', async () => {
          await expect(inventoryPage.cartBadge).not.toBeVisible();
        });

        await allure.step(`Add "${SINGLE_PRODUCT.name}" to cart`, async () => {
          await inventoryPage.addProductToCart(SINGLE_PRODUCT.name);
        });

        await allure.step('Verify cart badge shows count of 1', async () => {
          await expect(inventoryPage.cartBadge).toBeVisible();
          await expect(inventoryPage.cartBadge).toHaveText('1');
        });
      },
    );

    test(
      'should add multiple products and reflect correct badge count',
      { tag: ['@regression', '@cart'] },
      async ({ page }) => {
        const { inventoryPage } = await loginAndNavigate(page);

        for (const product of MULTI_PRODUCTS) {
          await allure.step(`Add "${product.name}" to cart`, async () => {
            await inventoryPage.addProductToCart(product.name);
          });
        }

        await allure.step(`Verify badge shows count of ${MULTI_PRODUCTS.length}`, async () => {
          await expect(inventoryPage.cartBadge).toHaveText(String(MULTI_PRODUCTS.length));
        });
      },
    );

    test(
      'should change Add to Cart button to Remove after adding product',
      { tag: ['@regression', '@cart'] },
      async ({ page }) => {
        const { inventoryPage } = await loginAndNavigate(page);

        await allure.step(`Add "${SINGLE_PRODUCT.name}" to cart`, async () => {
          await inventoryPage.addProductToCart(SINGLE_PRODUCT.name);
        });

        await allure.step('Verify button text changes to "Remove"', async () => {
          const buttonText = await inventoryPage.getAddButtonTextForProduct(SINGLE_PRODUCT.name);
          expect(buttonText.toLowerCase()).toContain('remove');
        });
      },
    );
  });

  // ─── Cart Page Validation ─────────────────────────────────────────────────────

  test.describe('Cart Page Validation', () => {
    test(
      'should display correct product name in cart',
      { tag: ['@smoke', '@regression', '@cart'] },
      async ({ page }) => {
        const { inventoryPage, cartPage } = await loginAndNavigate(page);

        await allure.step(`Add "${SINGLE_PRODUCT.name}" to cart`, async () => {
          await inventoryPage.addProductToCart(SINGLE_PRODUCT.name);
          await inventoryPage.goToCart();
        });

        await allure.step('Verify cart page is loaded', async () => {
          await expect(page).toHaveURL(/.*cart\.html/);
          const isLoaded = await cartPage.isLoaded();
          expect(isLoaded).toBe(true);
        });

        await allure.step('Verify product name in cart', async () => {
          const names = await cartPage.getProductNames();
          expect(names).toContain(SINGLE_PRODUCT.name);
        });
      },
    );

    test(
      'should display correct product price in cart',
      { tag: ['@regression', '@cart'] },
      async ({ page }) => {
        const { inventoryPage, cartPage } = await loginAndNavigate(page);

        await allure.step(`Add "${SINGLE_PRODUCT.name}" to cart`, async () => {
          await inventoryPage.addProductToCart(SINGLE_PRODUCT.name);
          await inventoryPage.goToCart();
        });

        await allure.step('Verify product price in cart', async () => {
          const prices = await cartPage.getProductPrices();
          expect(prices).toContain(SINGLE_PRODUCT.price);
        });
      },
    );

    test(
      'should display all added products in cart',
      { tag: ['@regression', '@cart'] },
      async ({ page }) => {
        const { inventoryPage, cartPage } = await loginAndNavigate(page);

        await allure.step('Add multiple products to cart', async () => {
          for (const product of MULTI_PRODUCTS) {
            await inventoryPage.addProductToCart(product.name);
          }
          await inventoryPage.goToCart();
        });

        await allure.step('Verify all products appear in cart', async () => {
          // toHaveCount retries until the DOM settles — safe after navigation
          await expect(cartPage.cartItems).toHaveCount(MULTI_PRODUCTS.length);

          const names = await cartPage.getProductNames();
          for (const product of MULTI_PRODUCTS) {
            expect(names).toContain(product.name);
          }
        });
      },
    );

    test(
      'should show empty cart page when no items added',
      { tag: ['@regression', '@cart'] },
      async ({ page }) => {
        const { inventoryPage, cartPage } = await loginAndNavigate(page);

        await allure.step('Navigate to cart without adding any items', async () => {
          await inventoryPage.goToCart();
        });

        await allure.step('Verify cart is empty', async () => {
          await expect(cartPage.cartItems).toHaveCount(0);
        });
      },
    );
  });

  // ─── Remove from Cart ─────────────────────────────────────────────────────────

  test.describe('Remove from Cart', () => {
    test(
      'should remove product from cart page and update item count',
      { tag: ['@smoke', '@regression', '@cart'] },
      async ({ page }) => {
        const { inventoryPage, cartPage } = await loginAndNavigate(page);

        await allure.step('Add product and navigate to cart', async () => {
          await inventoryPage.addProductToCart(SINGLE_PRODUCT.name);
          await inventoryPage.goToCart();
        });

        await allure.step('Verify product is in cart', async () => {
          // toHaveCount retries until DOM is stable after navigation
          await expect(cartPage.cartItems).toHaveCount(1);
          const isInCart = await cartPage.isProductInCart(SINGLE_PRODUCT.name);
          expect(isInCart).toBe(true);
        });

        await allure.step(`Remove "${SINGLE_PRODUCT.name}" from cart`, async () => {
          // removeProductByName waits for the item to detach before returning
          await cartPage.removeProductByName(SINGLE_PRODUCT.name);
        });

        await allure.step('Verify cart is now empty', async () => {
          // toHaveCount retries — DOM-safe after remove
          await expect(cartPage.cartItems).toHaveCount(0);
        });
      },
    );

    test(
      'should update cart badge after removing product',
      { tag: ['@regression', '@cart'] },
      async ({ page }) => {
        const { inventoryPage, cartPage } = await loginAndNavigate(page);

        await allure.step('Add two products to cart', async () => {
          await inventoryPage.addProductToCart(PRODUCTS.backpack.name);
          await inventoryPage.addProductToCart(PRODUCTS.bikeLight.name);
          await expect(inventoryPage.cartBadge).toHaveText('2');
        });

        await allure.step('Navigate to cart and remove one product', async () => {
          await inventoryPage.goToCart();
          await expect(cartPage.cartItems).toHaveCount(2);
          await cartPage.removeProductByName(PRODUCTS.backpack.name);
        });

        await allure.step('Verify badge count decremented to 1', async () => {
          await expect(inventoryPage.cartBadge).toHaveText('1');
        });

        await allure.step('Verify only one item remains in cart', async () => {
          await expect(cartPage.cartItems).toHaveCount(1);
        });
      },
    );

    test(
      'should remove product from inventory page directly',
      { tag: ['@regression', '@cart'] },
      async ({ page }) => {
        const { inventoryPage } = await loginAndNavigate(page);

        await allure.step('Add product to cart', async () => {
          await inventoryPage.addProductToCart(SINGLE_PRODUCT.name);
          await expect(inventoryPage.cartBadge).toHaveText('1');
        });

        await allure.step('Remove product from inventory page', async () => {
          await inventoryPage.removeProductFromCart(SINGLE_PRODUCT.name);
        });

        await allure.step('Verify cart badge disappears', async () => {
          await expect(inventoryPage.cartBadge).not.toBeVisible();
        });

        await allure.step('Verify button reverts to "Add to cart"', async () => {
          const buttonText = await inventoryPage.getAddButtonTextForProduct(SINGLE_PRODUCT.name);
          expect(buttonText.toLowerCase()).toContain('add to cart');
        });
      },
    );

    test(
      'should remove all items from cart and badge disappears',
      { tag: ['@regression', '@cart'] },
      async ({ page }) => {
        const { inventoryPage, cartPage } = await loginAndNavigate(page);

        await allure.step('Add multiple products', async () => {
          for (const product of MULTI_PRODUCTS) {
            await inventoryPage.addProductToCart(product.name);
          }
          await inventoryPage.goToCart();
          // Wait for all items to be present before starting removals
          await expect(cartPage.cartItems).toHaveCount(MULTI_PRODUCTS.length);
        });

        await allure.step('Remove all products from cart', async () => {
          // removeProductByName waits for each item to detach before the loop continues
          for (const product of MULTI_PRODUCTS) {
            await cartPage.removeProductByName(product.name);
          }
        });

        await allure.step('Verify cart is empty and badge is gone', async () => {
          await expect(cartPage.cartItems).toHaveCount(0);
          await expect(inventoryPage.cartBadge).not.toBeVisible();
        });
      },
    );

    test(
      'should continue shopping from cart page back to inventory',
      { tag: ['@regression', '@cart'] },
      async ({ page }) => {
        const { inventoryPage, cartPage } = await loginAndNavigate(page);

        await allure.step('Add product and go to cart', async () => {
          await inventoryPage.addProductToCart(SINGLE_PRODUCT.name);
          await inventoryPage.goToCart();
        });

        await allure.step('Click "Continue Shopping"', async () => {
          await cartPage.continueShopping();
        });

        await allure.step('Verify navigation back to inventory page', async () => {
          await expect(page).toHaveURL(/.*inventory\.html/);
          const isLoaded = await inventoryPage.isLoaded();
          expect(isLoaded).toBe(true);
        });
      },
    );
  });
});
