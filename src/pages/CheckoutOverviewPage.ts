import { type Locator, type Page } from '@playwright/test';
import { parseToCents } from '../utils/money';

export class CheckoutOverviewPage {
  readonly items: Locator;
  readonly itemTotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    this.items = page.getByTestId('inventory-item');
    this.itemTotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
  }

  itemName(index = 0): Locator {
    return this.items.nth(index).getByTestId('inventory-item-name');
  }

  itemPrice(index = 0): Locator {
    return this.items.nth(index).getByTestId('inventory-item-price');
  }

  /** Item total, tax and total as displayed, parsed to integer cents. */
  async readSummaryInCents(): Promise<{ itemTotal: number; tax: number; total: number }> {
    const [itemTotal, tax, total] = await Promise.all(
      [this.itemTotalLabel, this.taxLabel, this.totalLabel].map(async (label) => parseToCents(await label.innerText())),
    );
    return { itemTotal, tax, total };
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
