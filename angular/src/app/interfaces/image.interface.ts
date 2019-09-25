export interface IGalleryImage {
  href: string;
  height: number;
  width: number;
}

export class GalleryImage implements IGalleryImage {
  constructor(
    public href: string,
    public height: number,
    public width: number,
  ) { }
}
