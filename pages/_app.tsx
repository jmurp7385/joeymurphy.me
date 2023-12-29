import { FunctionComponent } from 'react'
import { Analytics } from '@vercel/analytics/react';
import '../styles/globals.css'

function MyApp({ Component, pageProps }: {Component: FunctionComponent, pageProps: Record<string, unknown>}) {
  return <>
  <Component {...pageProps} />
  <Analytics />
  </>
}

export default MyApp
