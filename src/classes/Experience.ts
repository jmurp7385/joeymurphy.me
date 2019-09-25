export default class Experience {
  name: string = '';
  description: string = '';
  technologies: string[] = [];
  constructor(obj?: any) {
    if (obj) {
      if (obj.hasOwnProperty('name')) {
        this.name = obj.name;
      }
      if (obj.hasOwnProperty('description')) {
        this.description = obj.description;
      }
      if (obj.hasOwnProperty('technologies')) {
        this.technologies = obj.technologies;
      }
    }
  }
}
