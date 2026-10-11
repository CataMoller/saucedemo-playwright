import { type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly items: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.items = page.getByTestId('inventory-item');
    this.checkoutButton = page.getByTestId('checkout');
  }

  itemName(index = 0): Locator {
    return this.items.nth(index).getByTestId('inventory-item-name');
  }

  itemPrice(index = 0): Locator {
    return this.items.nth(index).getByTestId('inventory-item-price');
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
