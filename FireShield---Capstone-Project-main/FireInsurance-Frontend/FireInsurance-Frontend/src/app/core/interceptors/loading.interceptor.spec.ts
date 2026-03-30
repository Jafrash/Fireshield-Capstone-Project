import 'zone.js';
import 'zone.js/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { afterEach as vitestAfterEach } from 'vitest';
vitestAfterEach(() => { TestBed.resetTestingModule(); });

import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';

describe('loadingInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let mockLoadingService: any;

  beforeEach(() => {
    mockLoadingService = {
      show: vi.fn(),
      hide: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
        { provide: LoadingService, useValue: mockLoadingService }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should show loading when request starts and hide when completes', () => {
    httpClient.get('/api/test').subscribe();

    expect(mockLoadingService.show).toHaveBeenCalled();

    const req = httpTestingController.expectOne('/api/test');
    req.flush({});

    expect(mockLoadingService.hide).toHaveBeenCalled();
  });

  it('should hide loading even if request fails', () => {
    httpClient.get('/api/error').subscribe({
      error: () => {}
    });

    const req = httpTestingController.expectOne('/api/error');
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(mockLoadingService.hide).toHaveBeenCalled();
  });

  it('should handle skipLoading header correctly', () => {
    httpClient.get('/api/silent', {
      headers: { skipLoading: 'true' }
    }).subscribe();

    expect(mockLoadingService.show).not.toHaveBeenCalled();

    const req = httpTestingController.expectOne('/api/silent');
    req.flush({});

    expect(mockLoadingService.hide).not.toHaveBeenCalled();
  });
});
