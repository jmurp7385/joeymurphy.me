import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PhotographyRoutingModule } from '@photography/photography-routing.module';
import { MaterialModule } from '@material/material.module';
import { PhotoGalleryComponent } from '@photography/photo-gallery/photo-gallery.component';

@NgModule({
  imports: [
    CommonModule,
    PhotographyRoutingModule,
    MaterialModule
  ],
  declarations: [PhotoGalleryComponent]
})
export class PhotographyModule { }
