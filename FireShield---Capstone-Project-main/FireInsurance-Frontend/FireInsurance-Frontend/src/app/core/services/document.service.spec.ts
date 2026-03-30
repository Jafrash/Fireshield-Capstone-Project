import 'zone.js';
import 'zone.js/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { afterEach as vitestAfterEach } from 'vitest';
vitestAfterEach(() => { getTestBed().resetTestingModule(); });
import { getTestBed } from '@angular/core/testing';

import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DocumentService } from './document.service';

describe('DocumentService', () => {
  let service: DocumentService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DocumentService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(DocumentService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get missing documents', () => {
    service.getMissingDocuments(10).subscribe();
    const req = httpTestingController.expectOne('http://localhost:8080/api/documents/missing/10');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should get uploaded documents', () => {
    service.getUploadedDocuments(10).subscribe();
    const req = httpTestingController.expectOne('http://localhost:8080/api/documents/uploaded/10');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should update document validation', () => {
    service.updateDocumentValidation(10, 5, { status: 'VALID' }).subscribe();
    const req = httpTestingController.expectOne('http://localhost:8080/api/documents/subscription/10/document/5/validate');
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('should add issue log', () => {
    service.addIssueLog(10, 5, 'Blurry document').subscribe();
    const req = httpTestingController.expectOne('http://localhost:8080/api/documents/subscription/10/document/5/issue');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});
