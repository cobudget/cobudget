import Card from "../components/styled/Card";
import EditOrCreateDream from "../components/EditOrCreateDream";
export default ({ event }) => {
  return (
    <Card>
      <h1>Create dream</h1>
      <EditOrCreateDream event={event} />
    </Card>
  );
};
