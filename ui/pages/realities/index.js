import Realities from "components/Realities";

const RealitiesPage = ({ currentGroupMember, currentUser }) => {
  return (
    <Realities currentGroupMember={currentGroupMember} currentUser={currentUser} />
  );
};

export default RealitiesPage;
