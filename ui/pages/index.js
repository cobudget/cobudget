import { forwardRef } from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Link from "next/link";

const EVENTS_QUERY = gql`
  query Events {
    events {
      id
      slug
      title
      color
    }
  }
`;

const LandingPage = () => {
  return (
    <div className="max-w-screen-sm flex-1">
      <h1 className="text-2xl mb-4 font-semibold">Hello!</h1>
      <p className="text-gray-800 mb-4">
        This is a new version of Dreams that is multi-tenant, meaning that many
        organizations and events can use the same installation.{" "}
        <a
          href="https://edgeryders.eu/t/rewrite-of-dreams-for-multi-tenancy-and-wider-adoption/11476"
          target="_blank"
          className="text-black underline"
        >
          Read more about dreams here
        </a>
        .
      </p>
      <p className="text-gray-800 mb-4">
        We don't have a proper landing page yet but one is in the works.
      </p>

      <p className="text-gray-800 mb-4">
        In the meanwhile, you can check out the Blivande organization to get a
        feel for the platform:
      </p>
      <LinkCard
        className="mb-4 w-64 h-14"
        href="https://dreams.blivande.com"
        color="anthracit"
      >
        <div className="flex items-center">
          <img
            src="https://i.imgur.com/RAs4Zeo.png"
            className="h-8 w-8 mr-4 rounded"
          />
          Blivande
        </div>
      </LinkCard>

      <p className="text-gray-800 mb-4">
        If you want to create your own organization on dreams and be part of the
        beta testing,{" "}
        <a
          href="https://forum.blivande.com/c/plato/22"
          target="_blank"
          className="text-black underline"
        >
          talk to us here
        </a>
        !
      </p>
    </div>
  );
};

const LinkCard = forwardRef((props, ref) => {
  const { color, className, children } = props;
  return (
    <a
      {...props}
      className={
        `bg-${color || "black"} ` +
        `hover:shadow-outline-${color}-darker ` +
        "cursor-pointer group p-4 font-medium rounded-md text-white flex justify-between items-start transitions-shadows duration-75" +
        " " +
        (className ? className : "h-32")
      }
      ref={ref}
    >
      {children}
    </a>
  );
});

export default ({ currentOrg }) => {
  // TODO - perhaps a redirect to organization pages instead
  if (!currentOrg) {
    return <LandingPage />;
  }

  const { data: { events } = { events: [] }, loading } = useQuery(EVENTS_QUERY);

  return (
    <div className="max-w-screen-2lg flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {events.map((event) => (
        <Link href="/[event]" as={`/${event.slug}`} key={event.slug}>
          <LinkCard color={event.color}>{event.title}</LinkCard>
        </Link>
      ))}
    </div>
  );
};
