/**
 * performance_glitch_user blocks the browser main thread for ~5 s (median
 * 5029 ms over 3 runs, vs 12 ms for standard_user) after: login, changing the
 * sort option and clicking "Back to products". The delay is client-side, not
 * network. Playwright's default expect timeout is 5000 ms, so assertions that
 * follow those actions need more headroom. Pass this ONLY to those assertions;
 * the global timeouts stay at their defaults.
 */
export const SLOW_PAGE_LOAD_TIMEOUT = 15_000;
