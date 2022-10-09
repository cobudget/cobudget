import Link from "next/link";
import Head from "next/head";

import parseHtml, { domToReact } from "html-react-parser";
import get from "lodash/get";

import GroupPage from "../components/Group";
import { getWebflowProps } from "utils/webflow";

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
        <Head>{parseHtml(landingPage.headContent, parseOptions)}</Head>
        {parseHtml(landingPage.bodyContent, parseOptions)}
      </>
    );
  }

  return <GroupPage currentUser={currentUser} />;
};

export const getStaticProps = getWebflowProps("");

export default IndexPage;
