import 'zone.js';
import 'zone.js/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { afterEach as vitestAfterEach } from 'vitest';
vitestAfterEach(() => { getTestBed().resetTestingModule(); });
import { getTestBed } from '@angular/core/testing';

import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
