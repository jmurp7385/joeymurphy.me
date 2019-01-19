import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '@material/material.module';
import { NavigationComponent } from '@shared/navigation/navigation.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule
  ],
  declarations: [NavigationComponent],
  exports: [NavigationComponent]
})
export class SharedModule { }
