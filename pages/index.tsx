import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { NextSeo } from 'next-seo';
import Footer from '../components/Footer';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { OpenGraph } from 'next-seo/lib/types';

const SEO: OpenGraph = {
  title: 'Joey Murphy',
  description: 'Homepage of Joey Murphy',
  url: 'https://joeymurphy.me',
  profile: { firstName: 'Joey', lastName: 'Murphy' },
};

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <link rel='icon' href='/favicon-16x16.png' />
      </Head>
      <NextSeo
        title={SEO.title}
        description={SEO.description}
        openGraph={{
          ...SEO,
        }}
      />
      <main className={styles.main}>
        <h1 className={styles.title}>Joey Murphy</h1>
        <p className={styles.description}>
          <a href='https://github.com/jmurp7385'>Software Engineer</a>
          &nbsp;&&nbsp;
          <a href='https://www.joeymurphy.photography/'>Photographer</a>
        </p>
        <div className={styles.row}>
          <Icon
            icon='uil:books'
            width='24'
            height='24'
          />
          <p className={styles.description} style={{ marginTop: 0, marginBottom: 0 }}>
            <Link href='/reading-lists'>&nbsp;See what I have been reading!&nbsp;</Link>
          </p>
          <Icon
            icon='uil:books'
            width='24'
            height='24'
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
