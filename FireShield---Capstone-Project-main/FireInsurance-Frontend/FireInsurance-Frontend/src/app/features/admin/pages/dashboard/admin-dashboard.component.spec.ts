import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminService } from '../../services/admin.service';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getTestBed } from '@angular/core/testing';

afterEach(() => { getTestBed().resetTestingModule(); });

import { provideRouter } from '@angular/router';

describe('AdminDashboardComponent (Robust Spec)', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let mockAdminService: any;

  beforeEach(async () => {
    mockAdminService = {
      getAllCustomers: vi.fn().mockReturnValue(of([])),
      getAllPolicies: vi.fn().mockReturnValue(of([])),
      getAllClaims: vi.fn().mockReturnValue(of([])),
      getAllSubscriptions: vi.fn().mockReturnValue(of([])),
      getAllUnderwriters: vi.fn().mockReturnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create the dashboard component', () => { expect(component).toBeTruthy(); });
  it('2. should initialize with default values', () => { expect(component.isLoading()).toBe(false); });
  it('3. should have dashboardCards signal', () => { expect(component.dashboardCards).toBeDefined(); });
  it('4. should have analyticsCards signal', () => { expect(component.analyticsCards).toBeDefined(); });
  it('5. should have recentClaims signal', () => { expect(component.recentClaims).toBeDefined(); });
  it('6. should call getAllCustomers on init', () => { expect(mockAdminService.getAllCustomers).toHaveBeenCalled(); });
  it('7. should call getAllPolicies on init', () => { expect(mockAdminService.getAllPolicies).toHaveBeenCalled(); });
  it('8. should call getAllClaims on init', () => { expect(mockAdminService.getAllClaims).toHaveBeenCalled(); });
  it('9. should call getAllSubscriptions on init', () => { expect(mockAdminService.getAllSubscriptions).toHaveBeenCalled(); });
});
