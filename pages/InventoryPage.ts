import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly pageTitle: Locator;
  readonly cartBadge: Locator;
  readonly cartIcon: Locator;
  readonly menuButton: Locator;
  readonly inventoryItems: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('[data-test="title"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartIcon = page.locator('[data-test="shopping-cart-link"]');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
  }

  async isLoaded(): Promise<boolean> {
    await this.pageTitle.waitFor({ state: 'visible' });
    return (await this.pageTitle.textContent()) === 'Products';
  }

  /**
   * Finds the inventory item by exact product name match (via data-test="inventory-item-name")
   * to avoid ambiguous matches when names share a common prefix (e.g. "Sauce Labs ...").
   */
  private getItemByName(productName: string): Locator {
    return this.page.locator('[data-test="inventory-item"]', {
      has: this.page.locator('[data-test="inventory-item-name"]', { hasText: productName }),
    });
  }

  async addProductToCart(productName: string): Promise<void> {
    const addButton = this.getItemByName(productName).locator('[data-test^="add-to-cart-"]');
    await addButton.click();
  }

  async removeProductFromCart(productName: string): Promise<void> {
    const removeButton = this.getItemByName(productName).locator('[data-test^="remove-"]');
    await removeButton.click();
  }

  async getAddButtonTextForProduct(productName: string): Promise<string> {
    const button = this.getItemByName(productName).locator('button');
    return (await button.textContent()) || '';
  }

  async getCartBadgeCount(): Promise<number> {
    const isVisible = await this.cartBadge.isVisible();
    if (!isVisible) return 0;
    const text = await this.cartBadge.textContent();
    return parseInt(text || '0', 10);
  }

  async goToCart(): Promise<void> {
    await this.cartIcon.click();
  }

  async getInventoryItemCount(): Promise<number> {
    return this.inventoryItems.count();
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.page.locator('[data-test="logout-sidebar-link"]').click();
  }
}
