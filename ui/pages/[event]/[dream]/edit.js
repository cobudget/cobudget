import { useQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import Head from "next/head";

import EditOrCreateDreamForm from "../../../components/EditOrCreateDreamForm";

import { DREAM_QUERY } from ".";

export default ({ event }) => {
  if (!event) return null;
  const router = useRouter();

  const { data: { dream } = { dream: null } } = useQuery(DREAM_QUERY, {
    variables: { slug: router.query.dream, eventId: event.id },
  });

  return (
    <>
      <Head>
        <title>
          {dream.title} | {event.title}
        </title>
      </Head>
      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
        <h1 className="text-3xl">Edit dream</h1>
        {dream && <EditOrCreateDreamForm dream={dream} event={event} editing />}
      </div>
    </>
  );
};
