'use client';

import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { NextSeo } from 'next-seo';
import Footer from '../components/Footer';
import SiteswapAnimation from '../components/juggling/SiteswapAnimation';

const SEO = {
  title: 'Siteswap',
  description: 'Animate juggling siteswaps',
  url: 'https://joeymurphy.me/siteswap',
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
        <SiteswapAnimation />
      </main>
      <Footer />
    </div>
  );
}
