import Link from "next/link";
import React from "react";
import { FormattedMessage } from "react-intl";
import Button from "./Button";

function BucketLimitOver({ isAdmin, hide }) {
  return (
    <div className="z-50 top-0 left-0 fixed w-screen h-screen bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 w-10/12 md:w-1/2">
        <p className="text-xl font-semibold">
          <FormattedMessage defaultMessage="Bucket Limit Over" />
        </p>
        <p className="my-4">
          {isAdmin ? (
            <FormattedMessage
              defaultMessage={
                "Free buckets limit is over. Upgrade this round or move this round to a paid group to continue."
              }
            />
          ) : (
            <FormattedMessage
              defaultMessage={
                "Free buckets limit is over. Ask the round admin to upgrade this round."
              }
            />
          )}
        </p>
        <div>
          <span className="cursor-pointer underline" onClick={hide}>
            <FormattedMessage defaultMessage={"Upgrade Later"} />
          </span>
          {isAdmin && (
            <span className="float-right">
              <Link href="/new-group">
                <Button>
                  <FormattedMessage defaultMessage="Create Paid Group" />
                </Button>
              </Link>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default BucketLimitOver;
