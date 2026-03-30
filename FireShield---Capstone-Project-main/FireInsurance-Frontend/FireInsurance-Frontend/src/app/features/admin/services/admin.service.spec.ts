import 'zone.js';
import 'zone.js/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { afterEach as vitestAfterEach } from 'vitest';
vitestAfterEach(() => { getTestBed().resetTestingModule(); });

import { getTestBed, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AdminService, Surveyor } from './admin.service';
import { environment } from '../../../../environments/environment';

describe('AdminService', () => {
  let service: AdminService;
  let httpTestingController: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AdminService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all claims', () => {
    service.getAllClaims().subscribe();
    const req = httpTestingController.expectOne(`${baseUrl}/claims`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get all policies', () => {
    service.getAllPolicies().subscribe();
    const req = httpTestingController.expectOne(`${baseUrl}/policies`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get all customers', () => {
    service.getAllCustomers().subscribe();
    const req = httpTestingController.expectOne(`${baseUrl}/customers`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get all subscriptions', () => {
    service.getAllSubscriptions().subscribe();
    const req = httpTestingController.expectOne(`${baseUrl}/subscriptions`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get all underwriters', () => {
    service.getAllUnderwriters().subscribe();
    const req = httpTestingController.expectOne(`${baseUrl}/admin/underwriters`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get all surveyors', () => {
    service.getAllSurveyors().subscribe();
    const req = httpTestingController.expectOne(`${baseUrl}/surveyors`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get all inspections', () => {
    service.getAllInspections().subscribe();
    const req = httpTestingController.expectOne(`${baseUrl}/inspections`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get dashboard stats', () => {
    service.getDashboardStats().subscribe();
    const req = httpTestingController.expectOne(`${baseUrl}/admin/dashboard/stats`);
    expect(req.request.method).toBe('GET');
    req.flush({ totalCustomers: 10, totalClaims: 5, activePolicies: 3 });
  });

  it('should assign underwriter to claim', () => {
    service.assignUnderwriterToClaim(1, 2).subscribe();
    const req = httpTestingController.expectOne(`${baseUrl}/admin/assign-underwriter/claim`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ targetId: 1, underwriterId: 2 });
    req.flush('Success');
  });

  it('should assign SIU to claim', () => {
    service.assignSiuToClaim(1, 3).subscribe();
    const req = httpTestingController.expectOne(`${baseUrl}/admin/assign-siu`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ claimId: 1, investigatorId: 3 });
    req.flush('Success');
  });

  it('should get fraud analysis', () => {
    service.getFraudAnalysis(1).subscribe();
    const req = httpTestingController.expectOne(`${baseUrl}/fraud/analysis/1`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
