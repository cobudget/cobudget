import { useQuery, gql } from "urql";
import Head from "next/head";
import { useEffect, useRef } from "react";

import Bucket from "../../../../components/Bucket";
import HappySpinner from "../../../../components/HappySpinner";
import SubMenu from "../../../../components/SubMenu";
import PageHero from "../../../../components/PageHero";
import Sidebar from "../../../../components/Bucket/Sidebar";
import { isMemberOfDream } from "utils/helpers";
import Overview from "../../../../components/Bucket/Overview";
import Comments from "components/Bucket/Comments";

import { BUCKET_QUERY } from ".";

const BucketComments = ({ collection, currentUser, currentOrg, router }) => {
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

      <Comments
        bucket={bucket}
        router={router}
        collection={collection}
        currentUser={currentUser}
        currentOrg={currentOrg}
      />
    </>
  );
};

export default BucketComments;
