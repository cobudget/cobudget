import EditOrganization from "components/Org/EditOrganization";
import { useRouter } from "next/router";

const CreateOrganizationPage = ({ currentUser }) => {
  const router = useRouter();
  if (!currentUser) {
    if (typeof window !== "undefined") router.push("/api/login");
    return (
      <h1 className="flex-grow flex justify-center items-center text-xl">
        Redirecting to login/signup...
      </h1>
    );
  }
  return <EditOrganization currentUser={currentUser} />;
};

export default CreateOrganizationPage;
