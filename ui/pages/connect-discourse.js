import { useRouter } from "next/router";
import createDiscourseConnectUrl from "utils/createDiscourseConnectUrl";

export default ({ currentOrgMember, currentOrg }) => {
  const router = useRouter();
  if (!currentOrgMember) return null;
  if (!currentOrg.discourse)
    return (
      <div>Your organization has not set up custom discourse integration.</div>
    );

  // TODO: Add more hand holding, instruct user to create account etc.

  return (
    <div>
      <h1>
        {currentOrgMember.hasDiscourseApiKey
          ? "You have successfully set up an API key"
          : "Connect your account to your organizations Discourse account"}
      </h1>

      {typeof window !== "undefined" && (
        <div>
          <a
            className="bg-blue rounded text-white p-2"
            href={createDiscourseConnectUrl(currentOrg)}
          >
            Connect to Discourse
          </a>
        </div>
      )}
    </div>
  );
};
