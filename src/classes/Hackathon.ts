import Experience from './Experience';

export default class Hackathon extends Experience {
  school: string = '';
  date: string = '';
  constructor(obj?: any) {
    super(obj);
    if (obj) {
      if (obj.hasOwnProperty('school')) {
        this.school = obj.school;
      }
    }
  }
}
