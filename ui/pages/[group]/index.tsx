import GroupPage from "../../components/Group";

const IndexPage = ({ currentUser }) => {
  return <GroupPage currentUser={currentUser} />;
};

// Enable edge caching for group pages
export const getServerSideProps = async ({ res }) => {
  // Cache at edge for 60s, serve stale for 5min while revalidating
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300"
  );
  return { props: {} };
};

export default IndexPage;
