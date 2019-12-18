import { useQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import { Box } from "@material-ui/core";

import EditOrCreateDreamForm from "../../components/EditOrCreateDreamForm";
import Card from "../../components/styled/Card";

import { DREAM_QUERY } from "./";

export default ({ event }) => {
  const router = useRouter();

  const { data: { dream } = { dream: null } } = useQuery(DREAM_QUERY, {
    variables: { slug: router.query.dream, eventId: event.id }
  });

  return (
    <Card>
      <Box p={3}>
        <h1>Edit dream</h1>
        {dream && <EditOrCreateDreamForm dream={dream} event={event} editing />}
      </Box>
    </Card>
  );
};
