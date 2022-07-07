import NewGroup from "../components/Group/NewGroup";

const CreateGroupPage = ({ currentUser }) => {
  return (
    <>
      <NewGroup currentUser={currentUser} />
    </>
  );
};

export default CreateGroupPage;
