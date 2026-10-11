/** Parses a price such as "$29.99" or "Item total: $59.98" into integer cents. */
export function parseToCents(text: string): number {
  const match = text.match(/\$(\d+)(?:\.(\d+))?/);
  if (!match) {
    throw new Error(`No price found in "${text}"`);
  }
  const [, dollars, fraction = ''] = match;
  // Pad/truncate the fraction to 2 digits so "59.980000000000004" -> 5998.
  const cents = fraction.padEnd(2, '0').slice(0, 2);
  return Number(dollars) * 100 + Number(cents);
}

/** 8% sales tax in cents, rounded to the nearest cent, computed with integers only. */
export function taxInCents(itemTotalCents: number): number {
  return Math.round((itemTotalCents * 8) / 100);
}
