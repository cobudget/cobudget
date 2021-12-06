import SubMenu from "components/SubMenu";
import Contributions from "../../../components/Contributions";

const ContributionsPage = ({ collection, currentUser }) => {
  const isAdmin =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentOrgMember?.isAdmin;
  if (!isAdmin || !collection) return null;
  return (
    <div className="">
      <SubMenu currentUser={currentUser} collection={collection} />
      <Contributions collection={collection} />
    </div>
  );
};

export default ContributionsPage;
