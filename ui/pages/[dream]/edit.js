import { useQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";

import EditOrCreateDream from "../../components/EditOrCreateDream";
import Card from "../../components/styled/Card";

import { DREAM_QUERY } from "./";

export default ({ event }) => {
  const router = useRouter();

  const { data: { dream } = { dream: null } } = useQuery(DREAM_QUERY, {
    variables: { slug: router.query.dream, eventId: event.id }
  });

  return (
    <Card>
      <h1>Edit dream</h1>
      {dream && <EditOrCreateDream dream={dream} event={event} editing />}
    </Card>
  );
};
