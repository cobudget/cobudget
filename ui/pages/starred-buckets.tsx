import StarredBuckets from "components/StarredBuckets";
import Head from "next/head";

function StarredBucketsPage() {
  return (
    <>
      <Head>
        <title>Favorite Buckets</title>
      </Head>
      <main>
        <StarredBuckets />
      </main>
    </>
  );
}

export default StarredBucketsPage;
