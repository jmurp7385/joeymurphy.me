import Head from "next/head";
import styles from "../styles/Home.module.css";

import { Icon } from "@iconify/react";
// import instagramIcon from "@iconify-icons/logos/instagram-icon";
// import linkedinIcon from "@iconify-icons/logos/linkedin";
// import githubIcon from "@iconify-icons/logos/github-icon";
import instagramIcon from '@iconify-icons/cib/instagram'
import githubIcon from '@iconify-icons/cib/github'
import linkedinIcon from '@iconify-icons/cib/linkedin'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Joey Murphy</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Joey Murphy</h1>

        <p className={styles.description}>
          <a href='https://github.com/jmurp7385'>Software Engineer</a>
          &nbsp;&&nbsp;
          <a href='https://www.instagram.com/joeymurphy.photography/'>
            Photographer
          </a>
        </p>
      </main>

      <footer className={styles.footer}>
        <a
          href='https://github.com/jmurp7385'
          className={styles.socialMediaIconLink}
        >
          <Icon icon={githubIcon} />
        </a>
        <a
          className={styles.socialMediaIconLink}
          href='https://www.linkedin.com/in/joeymurphy/'
        >
          <Icon icon={linkedinIcon}></Icon>
        </a>
        <a
          href='https://www.instagram.com/joeymurphy.photography/'
          className={styles.socialMediaIconLink}
        >
          <Icon icon={instagramIcon} />
        </a>
      </footer>
    </div>
  );
}
