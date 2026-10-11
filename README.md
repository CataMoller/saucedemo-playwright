# saucedemo-playwright

## Overview

End-to-end test automation for [saucedemo.com](https://www.saucedemo.com) built with Playwright and TypeScript. It contains two scenarios: a mandatory purchase flow started from a product detail page (run as `performance_glitch_user`), and a bonus regression test that protects the money calculation on the checkout overview.

## Tech stack and why

- **[@playwright/test](https://playwright.dev) + TypeScript**: one dependency provides the runner, assertions with auto-retry, tracing, and multi-browser support. TypeScript catches typos in page objects and test data at compile time.
- **Node.js LTS** and nothing else: no extra test frameworks or helper libraries were needed.

## Prerequisites

- Node.js LTS (20 or newer) and npm
- Internet access (the tests run against the public site)

## Setup

```bash
npm ci
npx playwright install            # all browsers; or: npx playwright install chromium
```

Credentials default to the public demo values, so no setup is required. To override them, set environment variables:

| Variable | Default |
| --- | --- |
| `SAUCE_PASSWORD` | `secret_sauce` |
| `SAUCE_STANDARD_USER` | `standard_user` |
| `SAUCE_PERFORMANCE_USER` | `performance_glitch_user` |

## How to run

```bash
npm test             # chromium only, headless
npm run test:headed  # chromium, visible browser
npm run test:all     # chromium, firefox and webkit
npm run typecheck    # tsc --noEmit
npm run report       # open the HTML report (playwright-report/)
```

Run a single file: `npx playwright test tests/checkout/order-totals.spec.ts --project=chromium`.

**Viewing a trace.** Traces are recorded on the first retry (retries: 1 on CI, 0 locally), so they are produced for tests that fail on CI and are attached to the HTML report. To force one locally: `npx playwright test --trace on`, then open the report and click the trace on the test, or run `npx playwright show-trace test-results/<test-folder>/trace.zip`. On CI, download the `playwright-report` artifact and run `npx playwright show-report <folder>`.

## Project structure

```
playwright.config.ts            Config: baseURL, data-test id attribute, reporters, projects
src/pages/                      Page objects (Login, Inventory, ProductDetail, Cart,
                                CheckoutInfo, CheckoutOverview, CheckoutComplete) + HeaderComponent
src/fixtures/index.ts           Custom `test` that injects the page objects
src/data/                       Users (env-overridable), customer info, products
src/utils/money.ts              Price parsing to integer cents, tax calculation
src/utils/timeouts.ts           SLOW_PAGE_LOAD_TIMEOUT and the data behind it
tests/checkout/                 Spec files
docs/sample-run.txt             Console output of a clean `npm test`
.github/workflows/playwright.yml  CI
```

## Test scenarios

### `purchase-from-product-detail.spec.ts` (mandatory)

As `performance_glitch_user`: log in, open the Sauce Labs Backpack detail page, add it to the cart there, go back to the product list, and verify the cart state is preserved. Then check that the cart holds exactly that item with the same name and price, fill in the checkout information, verify the overview (item name/price, item total, 8% tax rounded to cents, total) and finish the order. The confirmation message must show and the cart badge must disappear. Each stage is a `test.step()`.

### `order-totals.spec.ts` (bonus)

As `standard_user`, add Sauce Labs Bike Light and Sauce Labs Fleece Jacket, then go to the overview.

- **calculates item total, tax and total correctly**: parses the displayed values to cents and asserts item total = sum of the inventory prices, tax = 8% rounded, total = item total + tax. Passes.
- **displays all amounts with exactly two decimals**: asserts item total, tax and total match `/^\$\d+\.\d{2}$/`. This is a **known bug** (marked `test.fail()` plus a `known-bug` annotation): this combination displays `Item total: $59.980000000000004`. It was re-verified while building this project and still reproduces, so the original combination is unchanged.

**Why this bonus test:** it turns an exploratory finding into an automated regression on the highest-risk logic, money. The numbers are right but the display is not, and the test records exactly that. When the bug is fixed, `test.fail()` makes the test report an unexpected pass, which alerts us to remove the marker.

## Design decisions

- **`data-test` locators.** `testIdAttribute` is set to `data-test`, so locators use `page.getByTestId()`. They are stable against copy and layout changes. Role/text locators are used only where no test id exists (filtering a product by its name).
- **Page objects + fixtures.** Selectors and interactions live in `src/pages/`; specs read as a business flow. A custom fixture injects the page objects, so tests never construct them by hand. Assertions stay in the specs.
- **Slow-action timeout instead of sleeps or a global timeout.** In an earlier exploratory session, the browser main thread of `performance_glitch_user` was blocked for about 5 seconds (median 5029 ms over 3 runs, versus 12 ms for `standard_user`) after login, after changing the sort option, and after clicking "Back to products". The delay is client-side, not network. Playwright's default expect timeout is 5000 ms, so default assertions after those actions would be flaky. `SLOW_PAGE_LOAD_TIMEOUT` (15 s) is passed explicitly only to the assertions that follow those actions. Global timeouts keep the Playwright defaults, so every other failure is reported quickly, and there are no `waitForTimeout` calls or forced clicks.
- **Money in integer cents.** Displayed amounts are parsed to cents and compared as integers, so floating point error never causes (or hides) a failure. Tax is computed with integer arithmetic.
- **`test.fail()` for the known bug.** The failing behaviour stays documented and executable. The suite is green while the bug exists and signals when it is fixed.
- **Waiting for navigation.** After opening the detail page the test waits for an element that exists only there (`back-to-products`), because `inventory-item-name` also exists on the inventory page and would match the wrong page during navigation.

## Known limitations

- The mandatory scenario validates the happy path and passes despite other known defects of the site (it does not try to detect them).
- Tests depend on a public external site; downtime, slowness or changes to the site can fail them.
- Chromium is the default project. `npm run test:all` was run once with all three browsers and every test behaved identically (no browser-specific failures at the time of writing).
- Each test runs in a fresh browser context, so state is isolated even though the site stores the cart in localStorage.

## Sample run

See [docs/sample-run.txt](docs/sample-run.txt).

## AI usage

TODO: completed by the author
