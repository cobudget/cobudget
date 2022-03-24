import Link from "next/link";
import Button from "components/Button";
import Head from "next/head";

import parseHtml, { domToReact } from "html-react-parser";
import get from "lodash/get";

const liStyle =
  "px-3 py-2 hover:bg-gray-200 hover:text-gray-900 text-gray-700 truncate";

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
      <Link href={href}>
        <a {...props}>
          {!!node.children &&
            !!node.children.length &&
            domToReact(node.children, parseOptions)}
        </a>
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
        <Head>{parseHtml(landingPage.headContent)}</Head>
        {parseHtml(landingPage.bodyContent, parseOptions)}
      </>
    );
  }
  return <div>hey</div>;
};

export async function getStaticProps(ctx) {
  let landingPage = null;
  if (process.env.LANDING_PAGE_URL) {
    // Import modules in here that aren't needed in the component
    const cheerio = await import(`cheerio`);
    const axios = (await import(`axios`)).default;

    // Fetch HTML
    let res: any = await axios(process.env.LANDING_PAGE_URL).catch((err) => {
      console.error(err);
    });

    const html = res.data;

    // Parse HTML with Cheerio
    const $ = cheerio.load(html);
    const bodyContent = $(`body`).html();
    const headContent = $(`head`).html();

    landingPage = { bodyContent, headContent };
  }

  // Send HTML to component via props
  return {
    props: {
      landingPage,
    },
  };
}

export default IndexPage;
