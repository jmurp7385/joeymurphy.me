import ExperienceDescription from '../classes/ExperienceDescription';
import Job from '../classes/Job';

export const experiences = [
  new Job({
    name: 'Echo Global Logistics',
    title: "Software Developer",
    start: 'June 2018',
    about: [
      new ExperienceDescription(
        '@echo/ui NPM Package',
        [
          'Developed a reusable component library using React for use throughout development of Echo\'s new TMS',
          'Developed a docs/showcase page using Storybook hosted on an S3 Bucket',
          'Developed with accessibility in mind',
          'Developed mobile first',
        ]
      ),
      new ExperienceDescription(
        'Tracking Board',
        [
          'Developed a load tracking board for carrier sales reps to manage their loads with',
          'Responsive desing'
        ]
      )
    ]
  }
  ),
  new Job({
    name: 'Feeding America',
    title: 'Software Development Intern',
    start: 'May 2017',
    end: 'Aug 2017'
  }),
  new Job({
    name: 'UGO Convenience Delivery',
    title: 'Software Consultant',
    start: 'November 2016',
    end: 'Apr 2018',
  }),
  new Job({
    name: 'The NINE',
    title: 'Developer',
    start: 'April 2017',
    end: 'March 2018',
  })
]

export default experiences
