export interface Product {
  name: string;
  price: string;
}

export const PRODUCTS: Record<string, Product> = {
  backpack: {
    name: 'Sauce Labs Backpack',
    price: '$29.99',
  },
  bikeLight: {
    name: 'Sauce Labs Bike Light',
    price: '$9.99',
  },
  boltTShirt: {
    name: 'Sauce Labs Bolt T-Shirt',
    price: '$15.99',
  },
  fleeceJacket: {
    name: 'Sauce Labs Fleece Jacket',
    price: '$49.99',
  },
  onesie: {
    name: 'Sauce Labs Onesie',
    price: '$7.99',
  },
};

export const SINGLE_PRODUCT = PRODUCTS.backpack;
export const MULTI_PRODUCTS = [PRODUCTS.backpack, PRODUCTS.bikeLight, PRODUCTS.boltTShirt];
