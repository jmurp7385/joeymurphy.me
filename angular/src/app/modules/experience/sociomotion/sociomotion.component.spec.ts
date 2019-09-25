import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SociomotionComponent } from './sociomotion.component';

describe('SociomotionComponent', () => {
  let component: SociomotionComponent;
  let fixture: ComponentFixture<SociomotionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SociomotionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SociomotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
