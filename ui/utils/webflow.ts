import get from "lodash/get";

export const getWebflowProps = (basePath) => {
  return async function getStaticProps(ctx) {
    if (process.env.LANDING_PAGE_URL) {
      // Import modules in here that aren't needed in the component
      const cheerio = await import(`cheerio`);
      const axios = (await import(`axios`)).default;

      // Use path to determine additional Webflow path
      let url = get(ctx, `params.path`, []);
      url = url.join(`/`);
      if (url.charAt(0) !== `/`) {
        url = `/${url}`;
      }
      const fetchUrl = process.env.LANDING_PAGE_URL + basePath + url;

      // Fetch HTML
      const res: any = await axios(fetchUrl).catch((err) => {
        console.error(err);
      });

      const html = res.data;

      // Parse HTML with Cheerio
      const $ = cheerio.load(html);
      const bodyContent = $(`body`).html();
      const headContent = $(`head`).html();

      // Send HTML to component via props
      return {
        props: {
          landingPage: { bodyContent, headContent },
        },
      };
    }

    return {
      props: {},
    };
  };
};
