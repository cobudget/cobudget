import GroupPage from "../../components/Group";

const IndexPage = ({ currentGroup, currentUser }) => {
  return <GroupPage currentUser={currentUser} currentGroup={currentGroup} />;
};

export default IndexPage;
