import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password';
import { AuthService } from '../../services/auth.service';
import { Router, provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

afterEach(() => { getTestBed().resetTestingModule(); });

describe('ForgotPasswordComponent (Robust Spec)', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: { resetCustomerPassword: vi.fn() } },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create the component', () => { expect(component).toBeTruthy(); });
  it('2. should initialize form', () => { expect(component.forgotPasswordForm).toBeDefined(); });
  it('3. should start not submitting', () => { expect(component.isSubmitting()).toBe(false); });
  it('4. should have empty error message', () => { expect(component.errorMessage()).toBe(''); });
  it('5. should mark form as invalid initially', () => { expect(component.forgotPasswordForm.valid).toBe(false); });
  it('6. should have username field', () => { expect(component.forgotPasswordForm.contains('username')).toBe(true); });
  it('7. should default showPasswords to false', () => { expect(component.showNewPassword()).toBe(false); });
  it('8. should default newPassword value to empty', () => { expect(component.forgotPasswordForm.get('newPassword')?.value).toBe(''); });
  it('9. should validate email conditionally', () => { 
    component.forgotPasswordForm.patchValue({ email: 'invalid_email' });
    // It's still false valid because other fields aren't filled, which fulfills our expectation
    expect(component.forgotPasswordForm.get('email')?.valid).toBe(false);
  });
});
