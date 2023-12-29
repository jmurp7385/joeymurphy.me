import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { NextSeo } from 'next-seo';
import Footer from '../components/Footer';
import Link from 'next/link';

const SEO = {
  title: 'Joey Murphy',
  description: 'Homepage of Joey Murphy',
  url: 'https://joeymurphy.me',
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
          url: SEO.url,
          title: SEO.title,
          description: SEO.description,
        }}
      />
      <main className={styles.main}>
        <h1 className={styles.title}>Joey Murphy</h1>
        <p className={styles.description}>
          <a href='https://github.com/jmurp7385'>Software Engineer</a>
          &nbsp;&&nbsp;
          <a href='https://www.instagram.com/joeymurphy.photography/'>
            Photographer
          </a>
        </p>
        <p className={styles.description} style={{ marginTop: 0 }}>
          <Link href='/reading-lists'>See what I have been reading!</Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
