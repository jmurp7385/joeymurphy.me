import './Experience.scss';

import React from 'react';

import experiences from '../../data/experience';

function Experience() {
  const midPoint = Math.floor(experiences.length / 2)
  return (
    <section className='experience-root'>
      {experiences.map((experience, i) =>
        <article key={i} className={`experience-job ${i === midPoint ? 'mid' : ''}`}>
          <h3>
            {experience.name}
          </h3>
          <p>
            {experience.start}-{experience.end ? experience.end : 'present'}
          </p>
          {experience.about.map(experience =>
            <h4 key={experience.title}>{experience.title}
              <ul>
                {experience.bullets.map(bullet =>
                  <li>{bullet}</li>
                )}
              </ul>

            </h4>
          )}

        </article>

      )}
    </section>
  )
}

export default Experience
