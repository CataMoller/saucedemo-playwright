import { customer } from '../../src/data/customer';
import { products } from '../../src/data/products';
import { users } from '../../src/data/users';
import { expect, test } from '../../src/fixtures';
import { taxInCents } from '../../src/utils/money';

// This combination showed "Item total: $59.980000000000004" in a manual session.
const cart = [products.bikeLight, products.fleeceJacket];

test.describe('Checkout overview totals', () => {
  let expectedItemTotal: number;

  test.beforeEach(async ({ loginPage, inventoryPage, header, cartPage, checkoutInfoPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await expect(inventoryPage.inventoryList).toBeVisible();

    const prices = await Promise.all(cart.map((product) => inventoryPage.priceInCents(product)));
    expectedItemTotal = prices.reduce((sum, price) => sum + price, 0);

    for (const product of cart) {
      await inventoryPage.addToCart(product);
    }
    await header.openCart();
    await cartPage.checkout();
    await checkoutInfoPage.fillAndContinue(customer);
  });

  test('calculates item total, tax and total correctly', async ({ checkoutOverviewPage }) => {
    await expect(checkoutOverviewPage.items).toHaveCount(cart.length);

    const summary = await checkoutOverviewPage.readSummaryInCents();
    expect(summary.itemTotal).toBe(expectedItemTotal);
    expect(summary.tax).toBe(taxInCents(expectedItemTotal));
    expect(summary.total).toBe(summary.itemTotal + summary.tax);
  });

  test('displays all amounts with exactly two decimals', async ({ checkoutOverviewPage }) => {
    test.fail();
    test.info().annotations.push({
      type: 'known-bug',
      description:
        'Item total is rendered with a floating point error (e.g. "Item total: $59.980000000000004"). ' +
        'This test is expected to fail; when the bug is fixed it will start failing as "unexpectedly passed" — remove test.fail() then.',
    });

    const amount = /^\$\d+\.\d{2}$/;
    for (const label of [
      checkoutOverviewPage.itemTotalLabel,
      checkoutOverviewPage.taxLabel,
      checkoutOverviewPage.totalLabel,
    ]) {
      const text = await label.innerText();
      expect(text.replace(/^[^$]*/, '')).toMatch(amount);
    }
  });
});
