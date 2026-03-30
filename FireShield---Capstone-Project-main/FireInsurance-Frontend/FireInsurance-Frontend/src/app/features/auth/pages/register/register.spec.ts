import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register';
import { AuthService } from '../../services/auth.service';
import { Router, provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getTestBed } from '@angular/core/testing';

afterEach(() => { getTestBed().resetTestingModule(); });

describe('RegisterComponent (Robust Spec)', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: { registerCustomer: vi.fn() } },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create the register component', () => { expect(component).toBeTruthy(); });
  it('2. should initialize register form', () => { expect(component.registerForm).toBeDefined(); });
  it('3. should start with submitting as false', () => { expect(component.isSubmitting()).toBe(false); });
  it('4. should default showPassword to false', () => { expect(component.showPassword()).toBe(false); });

  it('6. should be fully invalid initially', () => { expect(component.registerForm.valid).toBe(false); });
  it('7. should not show error message initially', () => { expect(component.errorMessage()).toBe(''); });
  it('8. should include username control', () => { expect(component.registerForm.contains('username')).toBe(true); });
  it('9. should include firstName control', () => { expect(component.registerForm.contains('firstName')).toBe(true); });
  it('10. should include lastName control', () => { expect(component.registerForm.contains('lastName')).toBe(true); });
});
