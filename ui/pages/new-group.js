import EditGroup from "../components/Group/EditGroup";

const CreateGroupPage = ({ currentUser }) => {
  if (!currentUser) {
    if (typeof window !== "undefined") window.location.assign("/login"); //TODO: fix redirect after the fact
    return (
      <h1 className="page flex-grow flex justify-center items-center text-xl">
        Redirecting to login/signup...
      </h1>
    );
  }
  return (
    <div className="page">
      <EditGroup currentUser={currentUser} />
    </div>
  );
};

export default CreateGroupPage;
