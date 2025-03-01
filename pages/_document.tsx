import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(context: DocumentContext) {
    const initialProperties = await Document.getInitialProps(context);
    return { ...initialProperties };
  }

  render() {
    return (
      <Html lang={'en'}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
