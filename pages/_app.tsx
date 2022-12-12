import { FunctionComponent } from 'react'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: {Component: FunctionComponent, pageProps: Record<string, unknown>}) {
  return <Component {...pageProps} />
}

export default MyApp
