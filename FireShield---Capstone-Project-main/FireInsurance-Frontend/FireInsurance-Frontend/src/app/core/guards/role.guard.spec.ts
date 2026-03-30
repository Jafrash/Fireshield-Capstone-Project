import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect } from 'vitest';
import { roleGuard } from './role.guard';

describe('Role Guard Basics', () => {
  it('1. should exist', () => { expect(roleGuard).toBeDefined(); });
  it('2. should be implemented as a function', () => { expect(typeof roleGuard).toBe('function'); });
  it('3. should check parameters length', () => { expect(roleGuard.length).toBe(2); });
});
