import React from "react";
import Document from "next/document";
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
        styles: (
          <React.Fragment key="styles">
            {emotionStyleTags}
            {styledComponentSheet.getStyleElement()}
            {initialProps.styles}
          </React.Fragment>
        ),
      };
    } finally {
      styledComponentSheet.seal();
    }
  }
}
