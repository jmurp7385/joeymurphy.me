import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MagicMirrorConsoleComponent } from './magic-mirror-console.component';

describe('MagicMirrorConsoleComponent', () => {
  let component: MagicMirrorConsoleComponent;
  let fixture: ComponentFixture<MagicMirrorConsoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MagicMirrorConsoleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MagicMirrorConsoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
