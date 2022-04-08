import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitComponentTron } from './submit.component';

describe('SubmitComponent', () => {
  let component: SubmitComponentTron;
  let fixture: ComponentFixture<SubmitComponentTron>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubmitComponentTron ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitComponentTron);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
