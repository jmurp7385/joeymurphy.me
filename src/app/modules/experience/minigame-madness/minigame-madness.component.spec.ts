import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MinigameMadnessComponent } from './minigame-madness.component';

describe('MiniGameMadnessComponent', () => {
  let component: MinigameMadnessComponent;
  let fixture: ComponentFixture<MinigameMadnessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MinigameMadnessComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MinigameMadnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
