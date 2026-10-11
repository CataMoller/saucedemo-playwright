import { type Locator, type Page } from '@playwright/test';

export class CheckoutCompletePage {
  readonly header: Locator;

  constructor(page: Page) {
    this.header = page.getByTestId('complete-header');
  }
}
