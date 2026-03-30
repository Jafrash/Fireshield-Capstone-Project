import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login';
import { AuthService } from '../../../../core/services';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getTestBed } from '@angular/core/testing';

afterEach(() => { getTestBed().resetTestingModule(); });

import { provideRouter } from '@angular/router';

describe('LoginComponent (Robust Spec)', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: { login: vi.fn(), redirectToDashboard: vi.fn() } },
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    component.ngAfterViewInit = vi.fn();
    fixture.detectChanges();
  });

  it('1. should create the login component', () => { expect(component).toBeTruthy(); });
  it('2. should initialize login form', () => { expect(component.loginForm).toBeDefined(); });
  it('3. should have empty username initially', () => { expect(component.loginForm.get('username')?.value).toBe(''); });
  it('4. should have empty password initially', () => { expect(component.loginForm.get('password')?.value).toBe(''); });
  it('5. should render with submitting state false', () => { expect(component.isSubmitting()).toBe(false); });
  it('6. should start with password hidden', () => { expect(component.showPassword()).toBe(false); });
  it('7. should mark form invalid when empty', () => { expect(component.loginForm.valid).toBe(false); });
  it('8. should validate username entry', () => {
    component.loginForm.patchValue({ username: 'testuser' });
    expect(component.loginForm.get('username')?.valid).toBe(true);
  });
  it('9. should validate password entry', () => {
    component.loginForm.patchValue({ password: 'password123' });
    expect(component.loginForm.get('password')?.valid).toBe(true);
  });
  it('10. should have form valid when all fields filled', () => {
    component.loginForm.patchValue({ username: 'testuser123', password: 'password123' });
    expect(component.loginForm.valid).toBe(true);
  });
});
