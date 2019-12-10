import CreateEvent from "../components/CreateEvent";
import Card from "../components/styled/Card";
export default ({ event, hostInfo }) => {
  if (event) return <div>redirect to root?</div>;

  return (
    <Card>
      <h1>Create event</h1>
      <CreateEvent hostInfo={hostInfo} />
    </Card>
  );
};
