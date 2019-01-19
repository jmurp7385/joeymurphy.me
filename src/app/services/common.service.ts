import { Injectable } from '@angular/core';

import { GalleryImage } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

  getImages() {
    const images = [];
    for (let i = 1; i < 24; i++) {
      images.push(new GalleryImage('../../assets/images/compressed/image_' + i + '.jpg', Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)));
    }
    return images;
  }
}
