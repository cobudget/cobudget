import { useRouter } from "next/router";
import createDiscourseConnectUrl from "utils/createDiscourseConnectUrl";
import Button from "components/Button";
import { CheckIcon } from "components/Icons";

export default ({ currentOrgMember, currentOrg }) => {
  const router = useRouter();
  if (!currentOrgMember) return null;
  if (!currentOrg.discourseUrl)
    return (
      <div>Your organization has not set up custom discourse integration.</div>
    );

  return (
    <div className="max-w-screen-sm mt-10">
      <h1 className="text-xl font-medium mb-4 flex items-center">
        {currentOrgMember.hasDiscourseApiKey && (
          <CheckIcon className="h-6 w-6 mr-2" />
        )}
        {!currentOrgMember.hasDiscourseApiKey
          ? "Connect to Discourse"
          : `You have connected your Discourse account "${currentOrgMember.discourseUsername}"`}
      </h1>
      <p className="mb-4 text-gray-800">
        {!currentOrgMember.hasDiscourseApiKey
          ? "Click the button below to connect your existing account on your organizations Discourse or to create a new one."
          : "Click the button below to re-connect, if your api key has expired or you have changed username on Discourse."}
      </p>

      {typeof window !== "undefined" && (
        <div>
          <Button
            href={createDiscourseConnectUrl(currentOrg)}
            variant={
              currentOrgMember.hasDiscourseApiKey ? "secondary" : "primary"
            }
          >
            {!currentOrgMember.hasDiscourseApiKey
              ? "Connect to Discourse"
              : "Re-connect to Discourse"}
          </Button>
        </div>
      )}
    </div>
  );
};
