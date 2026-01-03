import { GetServerSideProps } from "next";
import NewGroup from "../components/Group/NewGroup";
import prisma from "server/prisma";
import Link from "next/link";
import Button from "components/Button";
import { FormattedMessage } from "react-intl";

interface CreateGroupPageProps {
  currentUser: any;
  organizationCreationDisabled?: boolean;
}

const CreateGroupPage = ({
  currentUser,
  organizationCreationDisabled,
}: CreateGroupPageProps) => {
  if (organizationCreationDisabled) {
    return (
      <div className="page">
        <div className="mx-auto max-w-md mt-10">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-semibold mb-4">
              <FormattedMessage defaultMessage="Organization Creation Disabled" />
            </h1>
            <p className="text-gray-600 mb-6">
              <FormattedMessage defaultMessage="Creating new organizations is currently disabled on this instance. Please contact an administrator if you need to create a new organization." />
            </p>
            <Link href="/new-round">
              <Button>
                <FormattedMessage defaultMessage="Create a Round Instead" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <NewGroup currentUser={currentUser} />;
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Enable edge caching (60s cache, 5min stale-while-revalidate)
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300"
  );

  try {
    const settings = await prisma.instanceSettings.findUnique({
      where: { id: "singleton" },
    });

    // If settings exist and allowOrganizationCreation is explicitly false
    if (settings && settings.allowOrganizationCreation === false) {
      return {
        props: {
          organizationCreationDisabled: true,
        },
      };
    }
  } catch (error) {
    console.error("Error checking instance settings:", error);
    // If there's an error, allow access (fail open for backwards compatibility)
  }

  return {
    props: {},
  };
};

export default CreateGroupPage;
