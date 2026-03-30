import 'zone.js';
import 'zone.js/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { afterEach as vitestAfterEach } from 'vitest';
vitestAfterEach(() => { getTestBed().resetTestingModule(); });

import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { UnauthorizedComponent } from './unauthorized';
import { AuthService } from '../../../../core/services';
import { Router } from '@angular/router';

describe('UnauthorizedComponent', () => {
  let component: UnauthorizedComponent;
  let fixture: ComponentFixture<UnauthorizedComponent>;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = {
      redirectToDashboard: vi.fn(),
      logout: vi.fn()
    };
    mockRouter = { navigate: vi.fn(), navigateByUrl: vi.fn(), parseUrl: vi.fn(), createUrlTree: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [UnauthorizedComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnauthorizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call redirectToDashboard on goToDashboard', () => {
    component.goToDashboard();
    expect(mockAuthService.redirectToDashboard).toHaveBeenCalled();
  });

  it('should call logout on logout', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
