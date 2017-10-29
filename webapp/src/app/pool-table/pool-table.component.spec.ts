import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PoolTableComponent } from './pool-table.component';

describe('PoolTableComponent', () => {
  let component: PoolTableComponent;
  let fixture: ComponentFixture<PoolTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PoolTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoolTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
