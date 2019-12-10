import CreateDream from "../components/CreateDream";
import Card from "../components/styled/Card";
export default ({ currentUser, event }) => {
  return (
    <>
      <Card>
        <div>
          <h1>Create dream</h1>
          <CreateDream event={event} />
        </div>
      </Card>
    </>
  );
};
