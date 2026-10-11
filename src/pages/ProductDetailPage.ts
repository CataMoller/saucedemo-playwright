import { type Locator, type Page } from '@playwright/test';
import { parseToCents } from '../utils/money';

export class ProductDetailPage {
  readonly name: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backToProductsButton: Locator;

  constructor(page: Page) {
    this.name = page.getByTestId('inventory-item-name');
    this.price = page.getByTestId('inventory-item-price');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.removeButton = page.getByTestId('remove');
    this.backToProductsButton = page.getByTestId('back-to-products');
  }

  async readName(): Promise<string> {
    return (await this.name.innerText()).trim();
  }

  async readPriceInCents(): Promise<number> {
    return parseToCents(await this.price.innerText());
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async backToProducts(): Promise<void> {
    await this.backToProductsButton.click();
  }
}
