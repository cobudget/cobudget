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

const IndexPage = ({ currentUser, bodyContent, headContent }) => {
  // const orgIds = currentUser?.orgMemberships?.map(
  //   (orgMember) => orgMember.organization.id
  // );
  console.log({ bodyContent, headContent });

  return (
    <>
      <Head>{parseHtml(headContent)}</Head>
      {parseHtml(bodyContent, parseOptions)}
    </>
  );

  return (
    <div className="page w-full">
      <div className="py-10">
        {false ? (
          <div className="flex justify-center items-center flex-col ">
            <h2 className="mb-4 text-lg font-medium">Your groups</h2>
            <ul className="max-w-xs bg-white rounded-md shadow divide-y-default divide-gray-200">
              {currentUser?.orgMemberships?.map((orgMember) => {
                return (
                  <li key={orgMember.id} className={liStyle}>
                    <Link href={`/${orgMember.organization.slug}`}>
                      <a>{orgMember.organization.name}</a>
                    </Link>
                  </li>
                );
              })}
              {currentUser?.collectionMemberships
                ?.filter(
                  (collMember) =>
                    !orgIds.includes(collMember.collection.organization?.id)
                )
                .map((collMember) => {
                  if (collMember.collection.organization)
                    return (
                      <li key={collMember.id} className={liStyle}>
                        <Link
                          href={`/${collMember.collection.organization.slug}`}
                        >
                          <a>{collMember.collection.organization.name}</a>
                        </Link>
                      </li>
                    );
                  return (
                    <li key={collMember.id} className={liStyle}>
                      <Link href={`/c/${collMember.collection.slug}`}>
                        <a>{collMember.collection.title}</a>
                      </Link>
                    </li>
                  );
                })}
              <li className={liStyle}>
                <Button size="large" nextJsLink href="/new-collection">
                  Create collection
                </Button>
              </li>
            </ul>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl mb-2 font-medium">Cobudget v2</h1>
          </div>
        )}
      </div>
    </div>
  );
};

// export default function Home(props) {
//   return <div dangerouslySetInnerHTML={{ __html: props.bodyContent }} />
// }

export async function getStaticProps(ctx) {
  // Import modules in here that aren't needed in the component
  const cheerio = await import(`cheerio`);
  const axios = (await import(`axios`)).default;

  // Fetch HTML
  let res = await axios("https://cobudget.webflow.io").catch((err) => {
    console.error(err);
  });

  const html = res.data;

  console.log({ res });

  // Parse HTML with Cheerio
  const $ = cheerio.load(html);
  const bodyContent = $(`body`).html();
  const headContent = $(`head`).html();
  console.log({ bodyContent });
  console.log("hey");
  // Send HTML to component via props
  return {
    props: {
      bodyContent,
      headContent,
    },
  };
}

export default IndexPage;
