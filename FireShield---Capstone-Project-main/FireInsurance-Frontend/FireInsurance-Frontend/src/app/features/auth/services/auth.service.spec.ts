import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getTestBed, TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';

afterEach(() => { getTestBed().resetTestingModule(); });

describe('AuthService (Robust Spec)', () => {
  let service: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: { navigate: vi.fn(), navigateByUrl: vi.fn() } }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('1. should create the auth service instance', () => { expect(service).toBeTruthy(); });
  it('2. should have login method', () => { expect(typeof service.login).toBe('function'); });
  it('3. should have registerCustomer method', () => { expect(typeof service.registerCustomer).toBe('function'); });
  it('4. should have logout method', () => { expect(typeof service.logout).toBe('function'); });

  it('6. should have resetCustomerPassword method', () => { expect(typeof service.resetCustomerPassword).toBe('function'); });
});
