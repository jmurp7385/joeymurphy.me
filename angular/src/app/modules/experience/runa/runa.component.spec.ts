import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RunaComponent } from './runa.component';

describe('RunaComponent', () => {
  let component: RunaComponent;
  let fixture: ComponentFixture<RunaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RunaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
