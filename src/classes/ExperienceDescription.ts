export default class ExperienceDescription {
  title: string = '';
  bullets: string[] = []

  constructor(title: string, bullets: string[]) {
    this.title = title;
    this.bullets = bullets
  }
}
