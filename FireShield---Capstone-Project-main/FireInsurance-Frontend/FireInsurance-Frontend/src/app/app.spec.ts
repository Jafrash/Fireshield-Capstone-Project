import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getTestBed, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

afterEach(() => { getTestBed().resetTestingModule(); });

describe('App Root', () => {
  let fixture: any;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ 
      imports: [App],
      providers: [provideRouter([])] 
    }).compileComponents();
    fixture = TestBed.createComponent(App);
  });
  it('1. should create the app', () => { expect(fixture.componentInstance).toBeTruthy(); });
  it('2. should successfully instance root component', () => { expect(fixture).toBeDefined(); });
});
