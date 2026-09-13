import { describe, expect, it } from 'vitest';
import { computeBasename } from './basename';

describe('computeBasename', () => {
  it('strips the trailing slash from the Vite base url', () => {
    expect(computeBasename('/Portfolio/')).toBe('/Portfolio');
    expect(computeBasename('/')).toBe('/');
  });

  it('strips repeated trailing slashes', () => {
    expect(computeBasename('/Portfolio//')).toBe('/Portfolio');
  });

  it('falls back to / for an empty value', () => {
    expect(computeBasename('')).toBe('/');
    expect(computeBasename(undefined)).toBe('/');
  });
});
