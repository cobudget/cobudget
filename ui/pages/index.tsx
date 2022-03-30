import Link from "next/link";
import Button from "components/Button";
import Head from "next/head";

import parseHtml, { domToReact } from "html-react-parser";
import get from "lodash/get";
import { gql, ssrExchange, useQuery } from "urql";
import { initUrqlClient } from "next-urql";
import { client as createClientConfig } from "graphql/client";
import GroupPage, { ROUNDS_QUERY } from "../components/Group";

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

const IndexPage = ({ currentUser, landingPage, currentGroup }) => {
  if (landingPage) {
    return (
      <>
        <Head>{parseHtml(landingPage.headContent)}</Head>
        {parseHtml(landingPage.bodyContent, parseOptions)}
      </>
    );
  }

  return <GroupPage currentUser={currentUser} currentGroup={currentGroup} />;
};

export async function getStaticProps(ctx) {
  if (process.env.LANDING_PAGE_URL) {
    // Import modules in here that aren't needed in the component
    const cheerio = await import(`cheerio`);
    const axios = (await import(`axios`)).default;

    // Fetch HTML
    const res: any = await axios(process.env.LANDING_PAGE_URL).catch((err) => {
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
  } else if (process.env.SINGLE_GROUP_MODE == "true") {
    const ssrCache = ssrExchange({ isClient: false });
    const client = initUrqlClient(createClientConfig(ssrCache), false);

    // This query is used to populate the cache for the query
    // used on this page.
    await client.query(ROUNDS_QUERY, { groupSlug: "c" }).toPromise();

    return {
      props: {
        // urqlState is a keyword here so withUrqlClient can pick it up.
        urqlState: ssrCache.extractData(),
      },
      revalidate: 60,
    };
    // get root group and get that yooo.
  }

  return {
    props: {},
  };
}

export default IndexPage;
