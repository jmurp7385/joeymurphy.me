import Head from "next/head";
import styles from "../styles/Home.module.css";
import { NextSeo } from "next-seo";
import { Icon } from "@iconify/react";
import instagramIcon from "@iconify-icons/cib/instagram";
import githubIcon from "@iconify-icons/cib/github";
import linkedinIcon from "@iconify-icons/cib/linkedin";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <link rel='icon' href='/favicon-16x16.png' />
      </Head>
      <NextSeo
        title={"Joey Murphy"}
        description={"Homepage of Joey Murphy"}
        openGraph={{
          url: "https://www.joeymurphy.me",
          title: "Joey Murphy",
          description: "Homepage of Joey Murphy",
        }}
      />

      <main className={styles.main}>
        <h1 className={styles.title}>Joey Murphy</h1>

        <p className={styles.description}>
          <a href='https://github.com/jmurp7385'>Software Engineer</a>
          &nbsp;&&nbsp;
          <a href='https://www.instagram.com/joeymurphy.photography/' >
            Photographer
          </a>
        </p>
      </main>

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
      </footer>
    </div>
  );
}
