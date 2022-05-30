import createDiscourseConnectUrl from "utils/createDiscourseConnectUrl";
import Button from "components/Button";
import { CheckIcon } from "components/Icons";
import { useEffect, useState } from "react";

export default ({ currentGroup, currentUser }) => {
  if (!currentUser?.currentGroupMember) return null;
  if (!currentGroup.discourseUrl)
    return <div>Your group has not set up custom discourse integration.</div>;

  const [discourseConnectUrl, setUrl] = useState("");

  useEffect(() => {
    setUrl(createDiscourseConnectUrl(currentGroup));
  }, [currentGroup]);

  return (
    <div className="page max-w-screen-sm mt-10">
      <h1 className="text-xl font-medium mb-4 flex items-center">
        {currentUser.currentGroupMember.hasDiscourseApiKey && (
          <CheckIcon className="h-6 w-6 mr-2" />
        )}
        {!currentUser.currentGroupMember.hasDiscourseApiKey
          ? "Connect to Discourse"
          : `You have connected your Discourse account "${currentUser.currentGroupMember.discourseUsername}"`}
      </h1>
      <p className="mb-4 text-gray-800">
        {!currentUser.currentGroupMember.hasDiscourseApiKey
          ? "Click the button below to connect your existing account on your groups Discourse or to create a new one."
          : "Click the button below to re-connect, if your api key has expired or you have changed username on Discourse."}
      </p>

      {discourseConnectUrl && (
        <Button
          href={discourseConnectUrl}
          variant={
            currentUser.currentGroupMember.hasDiscourseApiKey
              ? "secondary"
              : "primary"
          }
        >
          {!currentUser.currentGroupMember.hasDiscourseApiKey
            ? "Connect to Discourse"
            : "Re-connect to Discourse"}
        </Button>
      )}
    </div>
  );
};
