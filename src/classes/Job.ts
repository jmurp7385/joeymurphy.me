import Experience from './Experience';
import ExperienceDescription from './ExperienceDescription';

export default class Job extends Experience {
  projectName: string = '';
  title: string = '';
  start: string = '';
  end: string = '';
  about: ExperienceDescription[] = [];

  constructor(obj: any | Job) {
    super(obj);
    if (obj) {
      if (obj.hasOwnProperty('projectName')) {
        this.projectName = obj.projectName;
      }
      if (obj.hasOwnProperty('title')) {
        this.title = obj.title;
      }
      if (obj.hasOwnProperty('start')) {
        this.start = obj.start;
      }
      if (obj.hasOwnProperty('start')) {
        this.end = obj.end
      }
      if (obj.hasOwnProperty('about')) {
        this.about = obj.about
      }
    }
  }
}
