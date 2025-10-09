import { NextSeo } from 'next-seo';
import Head from 'next/head';
import SiteswapAnimation from '../components/juggling/SiteswapAnimation';

const SEO = {
  title: 'React Siteswap Animator',
  description:
    'A high-performance juggling animator for standard, synchronous, and multiplex siteswaps, built with React.',
  url: 'https://joeymurphy.me/siteswap',
};

/**
 * A React page that hosts the SiteswapAnimation component.
 */
export default function SiteswapPage() {
  return (
    <>
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
      <SiteswapAnimation />
    </>
  );
}
