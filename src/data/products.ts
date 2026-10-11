export const products = {
  backpack: { name: 'Sauce Labs Backpack', slug: 'sauce-labs-backpack' },
  bikeLight: { name: 'Sauce Labs Bike Light', slug: 'sauce-labs-bike-light' },
  fleeceJacket: { name: 'Sauce Labs Fleece Jacket', slug: 'sauce-labs-fleece-jacket' },
} as const;

export type Product = (typeof products)[keyof typeof products];
