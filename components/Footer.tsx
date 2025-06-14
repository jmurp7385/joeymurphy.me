import { Icon } from '@iconify/react';
import instagramIcon from '@iconify-icons/cib/instagram';
import youtubeIcon from '@iconify-icons/cib/youtube';
import githubIcon from '@iconify-icons/cib/github';
import linkedinIcon from '@iconify-icons/cib/linkedin';
import styles from '../styles/Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <a
        href='https://github.com/jmurp7385'
        className={styles.socialMediaIconLink}
        aria-label={'Github'}
      >
        <Icon icon={githubIcon} />
      </a>
      <a
        className={styles.socialMediaIconLink}
        href='https://www.linkedin.com/in/joeymurphy/'
        aria-label={'Linkedin'}
      >
        <Icon icon={linkedinIcon}></Icon>
      </a>
      <a
        href='https://www.instagram.com/joeymurphy.photography/'
        className={styles.socialMediaIconLink}
        aria-label={'Instagram'}
      >
        <Icon icon={instagramIcon} />
      </a>
      <a
        href='https://www.youtube.com/@joeygmurphy'
        className={styles.socialMediaIconLink}
        aria-label={'YouTube'}
      >
        <Icon icon={youtubeIcon} />
      </a>
    </footer>
  );
}

export default Footer;
