import { customer } from '../../src/data/customer';
import { products } from '../../src/data/products';
import { users } from '../../src/data/users';
import { expect, test } from '../../src/fixtures';
import { taxInCents } from '../../src/utils/money';
import { SLOW_PAGE_LOAD_TIMEOUT } from '../../src/utils/timeouts';

const product = products.backpack;

test('performance_glitch_user buys a product starting from its detail page', async ({
  loginPage,
  inventoryPage,
  productDetailPage,
  header,
  cartPage,
  checkoutInfoPage,
  checkoutOverviewPage,
  checkoutCompletePage,
}) => {
  let name = '';
  let priceInCents = 0;

  await test.step('Log in', async () => {
    await loginPage.goto();
    await loginPage.login(users.performanceGlitch.username, users.performanceGlitch.password);
    await expect(inventoryPage.inventoryList).toBeVisible({ timeout: SLOW_PAGE_LOAD_TIMEOUT });
  });

  await test.step('Open the product detail page and read name and price', async () => {
    await inventoryPage.openProduct(product);
    // Wait for an element that only exists on the detail page; "inventory-item-name"
    // also exists on the inventory page, so it can't signal that navigation finished.
    await expect(productDetailPage.backToProductsButton).toBeVisible();
    await expect(productDetailPage.name).toHaveText(product.name);
    name = await productDetailPage.readName();
    priceInCents = await productDetailPage.readPriceInCents();
  });

  await test.step('Add to cart from the detail page', async () => {
    await productDetailPage.addToCart();
    await expect(header.cartBadge).toHaveText('1');
    await expect(productDetailPage.removeButton).toBeVisible();
    await expect(productDetailPage.addToCartButton).toBeHidden();
  });

  await test.step('Go back to products and check the cart state is preserved', async () => {
    await productDetailPage.backToProducts();
    await expect(inventoryPage.inventoryList).toBeVisible({ timeout: SLOW_PAGE_LOAD_TIMEOUT });
    await expect(inventoryPage.removeButton(product)).toBeVisible({ timeout: SLOW_PAGE_LOAD_TIMEOUT });
  });

  await test.step('Open the cart and check the item', async () => {
    await header.openCart();
    await expect(cartPage.items).toHaveCount(1);
    await expect(cartPage.itemName()).toHaveText(name);
    await expect(cartPage.itemPrice()).toHaveText(`$${(priceInCents / 100).toFixed(2)}`);
  });

  await test.step('Checkout and fill in customer information', async () => {
    await cartPage.checkout();
    await checkoutInfoPage.fillAndContinue(customer);
  });

  await test.step('Overview shows the right item and totals', async () => {
    await expect(checkoutOverviewPage.itemName()).toHaveText(name);
    await expect(checkoutOverviewPage.itemPrice()).toHaveText(`$${(priceInCents / 100).toFixed(2)}`);

    const summary = await checkoutOverviewPage.readSummaryInCents();
    expect(summary.itemTotal).toBe(priceInCents);
    expect(summary.tax).toBe(taxInCents(summary.itemTotal));
    expect(summary.total).toBe(summary.itemTotal + summary.tax);
  });

  await test.step('Finish the order', async () => {
    await checkoutOverviewPage.finish();
    await expect(checkoutCompletePage.header).toHaveText('Thank you for your order!');
    await expect(header.cartBadge).toBeHidden();
  });
});
