import { TestBed } from '@angular/core/testing';

import { HoroscopeApiService } from './horoscope-api.service';

describe('HoroscopeApiService', () => {
  let service: HoroscopeApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HoroscopeApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
