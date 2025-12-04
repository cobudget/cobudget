import Document, { Html, Head, Main, NextScript } from "next/document";
import { ServerStyleSheet as StyledComponentSheet } from "styled-components";
import createEmotionServer from "@emotion/server/create-instance";
import createEmotionCache from "../lib/createEmotionCache";

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const styledComponentSheet = new StyledComponentSheet();
    const originalRenderPage = ctx.renderPage;

    // Handle Emotion (MUI v5 uses Emotion)
    const cache = createEmotionCache();
    const { extractCriticalToChunks } = createEmotionServer(cache);

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            styledComponentSheet.collectStyles(
              <App emotionCache={cache} {...props} />
            ),
        });

      const initialProps = await Document.getInitialProps(ctx);

      // Emotion styles extraction
      const emotionStyles = extractCriticalToChunks(initialProps.html);
      const emotionStyleTags = emotionStyles.styles.map((style) => (
        <style
          data-emotion={`${style.key} ${style.ids.join(" ")}`}
          key={style.key}
          dangerouslySetInnerHTML={{ __html: style.css }}
        />
      ));

      return {
        ...initialProps,
        styles: [
          ...emotionStyleTags,
          styledComponentSheet.getStyleElement(),
          ...initialProps.styles,
        ],
      };
    } finally {
      styledComponentSheet.seal();
    }
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
