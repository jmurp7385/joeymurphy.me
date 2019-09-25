import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ExperienceRoutingModule } from '@experience/experience-routing.module';
import { JobsComponent } from '@experience/jobs/jobs.component';
import { MagicMirrorConsoleComponent } from '@experience/magic-mirror-console/magic-mirror-console.component';
import { MainComponent } from '@experience/main/main.component';
import { MedsendComponent } from '@experience/medsend/medsend.component';
import { MinigameMadnessComponent } from '@experience/minigame-madness/minigame-madness.component';
import { ProjectsComponent } from '@experience/projects/projects.component';
import { RunaComponent } from '@experience/runa/runa.component';
import { SociomotionComponent } from '@experience/sociomotion/sociomotion.component';
import { SpaceSimulatorComponent } from '@experience/space-simulator/space-simulator.component';
import { SyncrusComponent } from '@experience/syncrus/syncrus.component';
import { MaterialModule } from '@material/material.module';

@NgModule({
  imports: [
    CommonModule,
    ExperienceRoutingModule,
    MaterialModule,
  ],
  declarations: [
    SyncrusComponent,
    RunaComponent,
    MinigameMadnessComponent,
    JobsComponent,
    MainComponent,
    SociomotionComponent,
    SpaceSimulatorComponent,
    MagicMirrorConsoleComponent,
    MedsendComponent,
    ProjectsComponent
  ]
})
export class ExperienceModule { }
