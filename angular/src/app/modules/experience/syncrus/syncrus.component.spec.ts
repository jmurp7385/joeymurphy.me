import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncrusComponent } from './syncrus.component';

describe('SyncrusComponent', () => {
  let component: SyncrusComponent;
  let fixture: ComponentFixture<SyncrusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SyncrusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncrusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
