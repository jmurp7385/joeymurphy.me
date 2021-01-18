import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import { NextSeo } from "next-seo";
import { Icon } from "@iconify/react";
import instagramIcon from "@iconify-icons/cib/instagram";
import githubIcon from "@iconify-icons/cib/github";
import linkedinIcon from "@iconify-icons/cib/linkedin";

export default function Library() {
  return (
    <div className={styles.container}>
      <Head>
        <link rel='icon' href='/favicon-16x16.png' />
      </Head>
      <NextSeo
        title={"Library"}
        description={"Joey's Library & Stats"}
        openGraph={{
          url: "https://www.joeymurphy.me",
          title: "Joey's Libary",
          description: "Library of Joey Murphy",
        }}
      />

      <main className={styles.main}>

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
