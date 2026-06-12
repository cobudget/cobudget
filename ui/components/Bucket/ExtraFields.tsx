import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { gql, useMutation } from "urql";
import Tooltip from "@tippyjs/react";

import Button from "components/Button";
import IconButton from "components/IconButton";
import { EditIcon } from "components/Icons";

const DEFAULT_PRIORITY_AREA_OPTIONS = [
  "arts_culture",
  "built_environment",
  "green_economy",
  "connected_to_nature",
  "secure_homes_lives",
  "community",
  "education_opportunities",
  "thriving_town_centre",
  "other",
];

const DEFAULT_SOURCE_FUNDING_OPTIONS = [
  "own_funds",
  "grant",
  "social_investment",
  "donations",
  "crowdfunding",
  "other",
];

const PRIORITY_AREA_LABELS: Record<string, string> = {
  arts_culture: "Arts and Culture",
  built_environment: "Beautiful Built Environment",
  green_economy: "Green Economy",
  connected_to_nature: "Connected to Nature",
  secure_homes_lives: "Secure Homes & Lives",
  community: "Community",
  education_opportunities: "Education & Opportunities",
  thriving_town_centre: "Thriving Town Centre",
  other: "Other",
};

const SOURCE_FUNDING_LABELS: Record<string, string> = {
  own_funds: "Own funds",
  grant: "Grant",
  social_investment: "Social investment",
  donations: "Donations",
  crowdfunding: "Crowdfunding",
  other: "Other",
};

const EDIT_PRIORITY_AREA = gql`
  mutation EditBucketPriorityArea($bucketId: ID!, $priorityArea: String) {
    editBucket(bucketId: $bucketId, priorityArea: $priorityArea) {
      id
      priorityArea
    }
  }
`;

const EDIT_SOURCE_FUNDING = gql`
  mutation EditBucketSourceFunding($bucketId: ID!, $sourceFunding: String) {
    editBucket(bucketId: $bucketId, sourceFunding: $sourceFunding) {
      id
      sourceFunding
    }
  }
`;

function parseOptions(envVar: string | undefined, defaults: string[]): string[] {
  if (!envVar) return defaults;
  return envVar.split(",").map((s) => s.trim()).filter(Boolean);
}

const BucketExtraFields = ({
  bucket,
  canEdit,
}: {
  bucket: any;
  canEdit: boolean;
}) => {
  const intl = useIntl();

  const [editingPriorityArea, setEditingPriorityArea] = useState(false);
  const [editingSourceFunding, setEditingSourceFunding] = useState(false);

  const [priorityAreaValue, setPriorityAreaValue] = useState(
    bucket.priorityArea ?? ""
  );
  const [sourceFundingValue, setSourceFundingValue] = useState(
    bucket.sourceFunding ?? ""
  );

  const [{ fetching: savingPriorityArea }, savePriorityArea] =
    useMutation(EDIT_PRIORITY_AREA);
  const [{ fetching: savingSourceFunding }, saveSourceFunding] =
    useMutation(EDIT_SOURCE_FUNDING);

  const priorityAreaOptions = parseOptions(
    process.env.NEXT_PUBLIC_BUCKET_PRIORITY_AREA_OPTIONS,
    DEFAULT_PRIORITY_AREA_OPTIONS
  );
  const sourceFundingOptions = parseOptions(
    process.env.NEXT_PUBLIC_BUCKET_SOURCE_FUNDING_OPTIONS,
    DEFAULT_SOURCE_FUNDING_OPTIONS
  );

  const showPriorityArea = bucket.priorityArea || canEdit;
  const showSourceFunding = bucket.sourceFunding || canEdit;

  if (!showPriorityArea && !showSourceFunding) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-4">
      {showPriorityArea && (
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">
            <FormattedMessage defaultMessage="Priority area" />
          </div>
          {editingPriorityArea ? (
            <div>
              <select
                className="border rounded px-2 py-1 text-sm w-full mb-2"
                value={priorityAreaValue}
                onChange={(e) => setPriorityAreaValue(e.target.value)}
                autoFocus
              >
                <option value="">—</option>
                {priorityAreaOptions.map((key) => (
                  <option key={key} value={key}>
                    {PRIORITY_AREA_LABELS[key] ?? key}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button
                  size="small"
                  loading={savingPriorityArea}
                  onClick={() =>
                    savePriorityArea({
                      bucketId: bucket.id,
                      priorityArea: priorityAreaValue || null,
                    }).then(({ error }) => {
                      if (error) alert(error.message);
                      else setEditingPriorityArea(false);
                    })
                  }
                >
                  <FormattedMessage defaultMessage="Save" />
                </Button>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => {
                    setPriorityAreaValue(bucket.priorityArea ?? "");
                    setEditingPriorityArea(false);
                  }}
                >
                  <FormattedMessage defaultMessage="Cancel" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-gray-800">
                {bucket.priorityArea ? (
                  PRIORITY_AREA_LABELS[bucket.priorityArea] ??
                  bucket.priorityArea
                ) : (
                  <span className="text-gray-400 italic">
                    <FormattedMessage defaultMessage="Not set" />
                  </span>
                )}
              </span>
              {canEdit && (
                <Tooltip
                  content={intl.formatMessage({
                    defaultMessage: "Edit priority area",
                  })}
                  placement="bottom"
                  arrow={false}
                >
                  <IconButton onClick={() => setEditingPriorityArea(true)}>
                    <EditIcon className="h-4 w-4" />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      )}

      {showSourceFunding && (
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">
            <FormattedMessage defaultMessage="Source of additional funding" />
          </div>
          {editingSourceFunding ? (
            <div>
              <select
                className="border rounded px-2 py-1 text-sm w-full mb-2"
                value={sourceFundingValue}
                onChange={(e) => setSourceFundingValue(e.target.value)}
                autoFocus
              >
                <option value="">—</option>
                {sourceFundingOptions.map((key) => (
                  <option key={key} value={key}>
                    {SOURCE_FUNDING_LABELS[key] ?? key}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button
                  size="small"
                  loading={savingSourceFunding}
                  onClick={() =>
                    saveSourceFunding({
                      bucketId: bucket.id,
                      sourceFunding: sourceFundingValue || null,
                    }).then(({ error }) => {
                      if (error) alert(error.message);
                      else setEditingSourceFunding(false);
                    })
                  }
                >
                  <FormattedMessage defaultMessage="Save" />
                </Button>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => {
                    setSourceFundingValue(bucket.sourceFunding ?? "");
                    setEditingSourceFunding(false);
                  }}
                >
                  <FormattedMessage defaultMessage="Cancel" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-gray-800">
                {bucket.sourceFunding ? (
                  SOURCE_FUNDING_LABELS[bucket.sourceFunding] ??
                  bucket.sourceFunding
                ) : (
                  <span className="text-gray-400 italic">
                    <FormattedMessage defaultMessage="Not set" />
                  </span>
                )}
              </span>
              {canEdit && (
                <Tooltip
                  content={intl.formatMessage({
                    defaultMessage: "Edit source of funding",
                  })}
                  placement="bottom"
                  arrow={false}
                >
                  <IconButton onClick={() => setEditingSourceFunding(true)}>
                    <EditIcon className="h-4 w-4" />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default BucketExtraFields;
