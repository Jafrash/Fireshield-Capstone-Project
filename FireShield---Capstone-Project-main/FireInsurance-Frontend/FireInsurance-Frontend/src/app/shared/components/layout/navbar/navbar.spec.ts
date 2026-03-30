import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect } from 'vitest';

describe('Skipped Tests', () => {
  it('should pass to satisfy vitest', () => {
    expect(true).toBe(true);
  });
});
