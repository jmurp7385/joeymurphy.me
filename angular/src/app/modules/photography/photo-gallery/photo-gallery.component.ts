import { Component, OnInit } from '@angular/core';

import { GalleryImage } from '../../../interfaces';
import { CommonService } from '../../../services';

@Component({
  selector: 'app-photo-gallery',
  templateUrl: './photo-gallery.component.html',
  styleUrls: ['./photo-gallery.component.scss']
})
export class PhotoGalleryComponent implements OnInit {
  public dimensions = [];
  public images: GalleryImage[];
  constructor(private _commonService: CommonService) { }

  ngOnInit() {
    this.images = this._commonService.getImages();
    this.dimensions = this.getDimensionList(this.images.length, 4);
  }

  getDimensionList(length, limit) {
    const dimensions = [];
    for (let index = 0; index < length; index++) {
      dimensions.push([Math.floor(Math.random() * limit) + 1, Math.floor(Math.random() * limit) + 1]);
    }
    return dimensions;
  }

}
