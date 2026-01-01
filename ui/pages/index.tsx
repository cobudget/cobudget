import Link from "next/link";
import Head from "next/head";

import parseHtml, { domToReact } from "html-react-parser";
import get from "lodash/get";

import GroupPage from "../components/Group";
import { webflowCss } from "utils/webflow";
import prisma from "server/prisma";

// Determines if URL is internal or external
function isUrlInternal(link) {
  if (
    !link ||
    link.indexOf(`https:`) === 0 ||
    link.indexOf(`#`) === 0 ||
    link.indexOf(`http`) === 0 ||
    link.indexOf(`://`) === 0
  ) {
    return false;
  }
  return true;
}
// Replaces DOM nodes with React components
function replace(node) {
  const attribs = node.attribs || {};

  // Replace links with Next links
  if (node.name === `a` && isUrlInternal(attribs.href)) {
    const { href, ...props } = attribs;
    if (props.class) {
      props.className = props.class;
      delete props.class;
    }
    return (
      <Link href={href} {...props}>
        {!!node.children &&
          !!node.children.length &&
          domToReact(node.children, parseOptions)}
      </Link>
    );
  }

  // Make Google Fonts scripts work
  if (node.name === `script`) {
    let content = get(node, `children.0.data`, ``);
    if (content && content.trim().indexOf(`WebFont.load(`) === 0) {
      content = `setTimeout(function(){${content}}, 1)`;
      return (
        <script
          {...attribs}
          dangerouslySetInnerHTML={{ __html: content }}
        ></script>
      );
    }
  }
}

const parseOptions = { replace };

const IndexPage = ({ currentUser, landingPage }) => {
  if (landingPage) {
    return (
      <>
        <Head>{parseHtml(landingPage.headContent, parseOptions)}</Head>
        {parseHtml(landingPage.bodyContent, parseOptions)}
        <style jsx>{webflowCss}</style>
      </>
    );
  }

  return <GroupPage currentUser={currentUser} />;
};

export const getServerSideProps = async (ctx) => {
  // Check for landing group setting
  try {
    const settings = await prisma.instanceSettings.findUnique({
      where: { id: "singleton" },
      include: { landingGroup: true },
    });

    if (settings?.landingGroup?.slug) {
      return {
        redirect: {
          destination: `/${settings.landingGroup.slug}`,
          permanent: false,
        },
      };
    }
  } catch (error) {
    // If table doesn't exist yet or other error, continue with default behavior
    console.error("Error checking instance settings:", error);
  }

  // Fall back to Webflow landing page or GroupPage
  if (process.env.LANDING_PAGE_URL) {
    const cheerio = await import(`cheerio`);
    const axios = (await import(`axios`)).default;

    let url = get(ctx, `params.path`, []);
    url = url.join(`/`);
    if (url.charAt(0) !== `/`) {
      url = `/${url}`;
    }
    const fetchUrl = process.env.LANDING_PAGE_URL + url;

    try {
      const res: any = await axios(fetchUrl);
      const html = res.data;

      const $ = cheerio.load(html);
      const bodyContent = $(`body`).html();
      const headContent = $(`head`).html();

      return {
        props: {
          landingPage: { bodyContent, headContent },
        },
      };
    } catch (err) {
      console.error("Error fetching Webflow page:", err);
    }
  }

  return {
    props: {},
  };
};

export default IndexPage;
