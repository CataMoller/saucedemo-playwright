import { type Locator, type Page } from '@playwright/test';
import { type Product } from '../data/products';
import { parseToCents } from '../utils/money';

export class InventoryPage {
  readonly inventoryList: Locator;

  constructor(private readonly page: Page) {
    this.inventoryList = page.getByTestId('inventory-list');
  }

  private item(product: Product): Locator {
    return this.page
      .getByTestId('inventory-item')
      .filter({ has: this.page.getByTestId('inventory-item-name').filter({ hasText: product.name }) });
  }

  addToCartButton(product: Product): Locator {
    return this.page.getByTestId(`add-to-cart-${product.slug}`);
  }

  removeButton(product: Product): Locator {
    return this.page.getByTestId(`remove-${product.slug}`);
  }

  async priceInCents(product: Product): Promise<number> {
    const text = await this.item(product).getByTestId('inventory-item-price').innerText();
    return parseToCents(text);
  }

  async addToCart(product: Product): Promise<void> {
    await this.addToCartButton(product).click();
  }

  async openProduct(product: Product): Promise<void> {
    await this.page.getByTestId('inventory-item-name').filter({ hasText: product.name }).click();
  }
}
