import GetSitemapLinks from "sitemap-links";

import { getWebflowProps } from "utils/webflow";

import Page from "../index";

export const getStaticProps = getWebflowProps("/resources");

export async function getStaticPaths() {
  // Fetch links from Webflow sitemap
  if (process.env.LANDING_PAGE_URL) {
    const sitemapLink = process.env.LANDING_PAGE_URL + `/sitemap.xml`;
    const links = await GetSitemapLinks(sitemapLink).catch((err) => {
      console.error(err);
    });

    // add root /resources page
    const paths = [{ params: { path: undefined } }];

    // Extract paths from absolute links
    for (const link of links) {
      const url = new URL(link);

      const path = url.pathname.replace(`/`, ``).split(`/`);
      if (!path.length || !path[0]) continue;

      // add /blog/ pages to /resources
      if (path[0] === "blog") {
        const puth = path[1];

        paths.push({
          params: { path: [puth] },
        });
      }
    }

    return {
      paths: paths,
      fallback: "blocking",
    };
  }
  return {
    paths: [],
    fallback: false,
  };
}

export default Page;
