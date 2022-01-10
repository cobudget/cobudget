import { useQuery, gql } from "urql";
import SubMenu from "../../../../components/SubMenu";
import Overview from "../../../../components/Bucket/Overview";
import Funders from "components/Bucket/Funders";

import { BUCKET_QUERY } from ".";

const DreamPage = ({ collection, currentUser, currentOrg, router }) => {
  const [{ data, fetching: loading, error }] = useQuery({
    query: BUCKET_QUERY,
    variables: { id: router.query.bucket },
  });

  const { bucket } = data ?? { bucket: null };

  return (
    <>
      <Overview
        router={router}
        currentUser={currentUser}
        currentOrg={currentOrg}
        collection={collection}
      />

      <SubMenu bucket={bucket} currentUser={currentUser} />

      <Funders
        router={router}
        collection={collection}
        currentUser={currentUser}
      />
    </>
  );
};

export default DreamPage;
