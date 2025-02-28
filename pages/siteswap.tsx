'use client';

import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { NextSeo } from 'next-seo';
import Footer from '../components/Footer';
import SiteswapAnimation from '../components/juggling/SiteswapAnimation';
import SiteswapSpaceTimeGraph from '../components/juggling/SiteswapSpaceTimegGraph';

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
        {/* <SiteswapSpaceTimeGraph /> */}
        <SiteswapAnimation />
      </main>
      <Footer />
    </div>
  );
}
