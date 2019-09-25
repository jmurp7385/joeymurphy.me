import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MedsendComponent } from './medsend.component';

describe('MedsendComponent', () => {
  let component: MedsendComponent;
  let fixture: ComponentFixture<MedsendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MedsendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedsendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
