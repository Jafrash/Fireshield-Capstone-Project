import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect } from 'vitest';
import { authGuard } from './auth.guard';

describe('Auth Guard Basics', () => {
  it('1. should be defined', () => { expect(authGuard).toBeDefined(); });
  it('2. should be a function', () => { expect(typeof authGuard).toBe('function'); });
  it('3. should accept route and state args', () => { expect(authGuard.length).toBe(2); });
});
