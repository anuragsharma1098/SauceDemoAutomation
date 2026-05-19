import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly pageTitle: Locator;
  // SauceDemo cart items use the CSS class .cart_item
  readonly cartItems: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('[data-test="title"]');
    this.cartItems = page.locator('.cart_item');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  async isLoaded(): Promise<boolean> {
    await this.pageTitle.waitFor({ state: 'visible' });
    return (await this.pageTitle.textContent()) === 'Your Cart';
  }

  /**
   * Returns the current cart item count.
   * NOTE: use expect(cartPage.cartItems).toHaveCount(n) in assertions
   * instead of this method when you need auto-retry after a DOM change.
   */
  async getCartItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async getProductNames(): Promise<string[]> {
    return this.page
      .locator('[data-test="inventory-item-name"]')
      .allTextContents();
  }

  async getProductPrices(): Promise<string[]> {
    return this.page
      .locator('[data-test="inventory-item-price"]')
      .allTextContents();
  }

  /**
   * Removes a product by name and waits for the item to be removed from the DOM
   * before returning — safe for sequential remove loops.
   */
  async removeProductByName(productName: string): Promise<void> {
    const item = this.page.locator('.cart_item', {
      has: this.page.locator('[data-test="inventory-item-name"]', { hasText: productName }),
    });
    // Wait for item to be present before trying to remove it
    await item.waitFor({ state: 'visible' });
    const removeButton = item.locator('[data-test^="remove-"]');
    await removeButton.click();
    // Wait for the item to be fully removed from DOM before continuing
    await item.waitFor({ state: 'detached' });
  }

  async isProductInCart(productName: string): Promise<boolean> {
    const names = await this.getProductNames();
    return names.includes(productName);
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }
}
