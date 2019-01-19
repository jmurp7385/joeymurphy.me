import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceSimulatorComponent } from './space-simulator.component';

describe('SpaceSimulatorComponent', () => {
  let component: SpaceSimulatorComponent;
  let fixture: ComponentFixture<SpaceSimulatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpaceSimulatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpaceSimulatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
