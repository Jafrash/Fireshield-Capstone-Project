import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect } from 'vitest';
import { loggedInGuard } from './logged-in.guard';

describe('Logged In Guard Basics', () => {
  it('1. should be defined', () => { expect(loggedInGuard).toBeDefined(); });
  it('2. should be a callable function', () => { expect(typeof loggedInGuard).toBe('function'); });
  it('3. should expect correct arguments', () => { expect(loggedInGuard.length).toBe(2); });
});
