import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import CreateDream from "../../components/CreateDream";

export default ({ currentUser }) => {
  const router = useRouter();
  const { event: eventSlug } = router.query;

  return (
    <Layout currentUser={currentUser} eventSlug={eventSlug}>
      <h1>Create dream!</h1>
      <CreateDream eventSlug={eventSlug} />
    </Layout>
  );
};
