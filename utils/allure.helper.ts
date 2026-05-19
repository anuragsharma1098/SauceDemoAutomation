import { test } from '@playwright/test';

export const allureStep = (stepName: string, fn: () => Promise<void>): Promise<void> => {
  return test.step(stepName, fn);
};

export const Tags = {
  SMOKE: '@smoke',
  REGRESSION: '@regression',
  LOGIN: '@login',
  CART: '@cart',
};
