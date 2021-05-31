import Realities from "components/Realities";

const RealitiesPage = ({ currentOrgMember, currentUser }) => {
  return (
    <Realities currentOrgMember={currentOrgMember} currentUser={currentUser} />
  );
};

export default RealitiesPage;
