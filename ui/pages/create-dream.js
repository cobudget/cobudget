import { Box } from "@material-ui/core";
import Card from "../components/styled/Card";
import EditOrCreateDreamForm from "../components/EditOrCreateDreamForm";

export default ({ event }) => {
  if (!event) return null;

  return (
    <Card>
      <Box p={3}>
        <h1>Create dream</h1>
        <EditOrCreateDreamForm event={event} />
      </Box>
    </Card>
  );
};
