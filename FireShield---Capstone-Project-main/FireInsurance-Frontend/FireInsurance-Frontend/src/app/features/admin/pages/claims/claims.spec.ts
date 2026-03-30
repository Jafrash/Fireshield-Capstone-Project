import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClaimsComponent } from './claims';
import { AdminService } from '../../../../features/admin/services/admin.service';
import { DocumentService } from '../../../../core/services/document.service';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getTestBed } from '@angular/core/testing';

afterEach(() => { getTestBed().resetTestingModule(); });

import { provideRouter } from '@angular/router';

describe('ClaimsComponent (Robust Spec)', () => {
  let component: ClaimsComponent;
  let fixture: ComponentFixture<ClaimsComponent>;
  let mockAdminService: any;
  let mockDocumentService: any;

  beforeEach(async () => {
    mockAdminService = {
      getAllClaims: vi.fn().mockReturnValue(of([])),
      getAllUnderwriters: vi.fn().mockReturnValue(of([])),
      getAllSiuInvestigators: vi.fn().mockReturnValue(of([]))
    };
    mockDocumentService = {
      getDocumentsForEntity: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [ClaimsComponent],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
        { provide: DocumentService, useValue: mockDocumentService },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create the claims component', () => { expect(component).toBeTruthy(); });
  it('2. should initialize claims array', () => { expect(component.claims()).toEqual([]); });
  it('3. should initialize filtered claims', () => { expect(component.filteredClaims()).toEqual([]); });
  it('4. should have search functionality', () => { expect(component.searchClaims).toBeDefined(); });
  it('5. should have update status functionality', () => { expect(component.updateClaimStatus).toBeDefined(); });
  it('6. should call getAllClaims on init', () => { expect(mockAdminService.getAllClaims).toHaveBeenCalled(); });
  it('7. should display no analysis initially', () => { expect(component.fraudAnalysis()).toBeNull(); });
  it('8. should default modal state to closed', () => { expect(component.showFraudAnalysisModal()).toBe(false); });
  it('9. should allow searching with empty term', () => { 
    component.searchClaims('');
    expect(component.filteredClaims()).toEqual([]);
  });
});
