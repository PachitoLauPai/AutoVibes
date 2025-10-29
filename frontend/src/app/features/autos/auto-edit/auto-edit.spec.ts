import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoEdit } from './auto-edit';

describe('AutoEdit', () => {
  let component: AutoEdit;
  let fixture: ComponentFixture<AutoEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
