import 'zone.js';
import 'zone.js/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { afterEach as vitestAfterEach } from 'vitest';
vitestAfterEach(() => { TestBed.resetTestingModule(); });

import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors, HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { TokenService } from '../services';
import { Router } from '@angular/router';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let mockTokenService: any;
  let mockRouter: any;

  beforeEach(() => {
    mockTokenService = {
      getToken: vi.fn(),
      isTokenExpired: vi.fn(),
      clearAuth: vi.fn()
    };
    mockRouter = { navigate: vi.fn(), navigateByUrl: vi.fn(), parseUrl: vi.fn(), createUrlTree: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: TokenService, useValue: mockTokenService },
        { provide: Router, useValue: mockRouter }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should add Authorization header for regular requests', () => {
    mockTokenService.getToken.mockReturnValue('test-token');
    mockTokenService.isTokenExpired.mockReturnValue(false);

    httpClient.post('/api/data', {}).subscribe();

    const req = httpTestingController.expectOne('/api/data');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
  });

  it('should NOT add Content-Type header for FormData requests', () => {
    mockTokenService.getToken.mockReturnValue('test-token');
    mockTokenService.isTokenExpired.mockReturnValue(false);

    const formData = new FormData();
    formData.append('file', new Blob([''], { type: 'text/plain' }));

    httpClient.post('/api/upload', formData).subscribe();

    const req = httpTestingController.expectOne('/api/upload');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    expect(req.request.headers.has('Content-Type')).toBe(false);
  });

  it('should skip auth for login and register endpoints', () => {
    httpClient.post('/auth/login', {}).subscribe();
    const req1 = httpTestingController.expectOne('/auth/login');
    expect(req1.request.headers.has('Authorization')).toBe(false);

    httpClient.post('/auth/register', {}).subscribe();
    const req2 = httpTestingController.expectOne('/auth/register');
    expect(req2.request.headers.has('Authorization')).toBe(false);
  });

  it('should redirect to login if token is expired', () => {
    mockTokenService.getToken.mockReturnValue('expired-token');
    mockTokenService.isTokenExpired.mockReturnValue(true);

    httpClient.get('/api/data').subscribe({
      error: (err) => expect(err.message).toBe('Token expired')
    });

    expect(mockTokenService.clearAuth).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login'], expect.any(Object));
    httpTestingController.expectNone('/api/data');
  });

  it('should handle 401 error and redirect to login if request was authenticated', () => {
    mockTokenService.getToken.mockReturnValue('valid-token');
    mockTokenService.isTokenExpired.mockReturnValue(false);

    httpClient.get('/api/data').subscribe({
      error: (err) => expect(err.status).toBe(401)
    });

    const req = httpTestingController.expectOne('/api/data');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(mockTokenService.clearAuth).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login'], expect.any(Object));
  });
});
