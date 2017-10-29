import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPoolFormComponent } from './add-pool-form.component';

describe('AddPoolFormComponent', () => {
  let component: AddPoolFormComponent;
  let fixture: ComponentFixture<AddPoolFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPoolFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPoolFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
