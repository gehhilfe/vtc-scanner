import { TestBed, inject } from '@angular/core/testing';

import { PoolService } from './pool.service';

describe('PoolService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PoolService]
    });
  });

  it('should be created', inject([PoolService], (service: PoolService) => {
    expect(service).toBeTruthy();
  }));
});
