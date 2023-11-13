import { useQuery, gql } from "urql";
import { useRouter } from "next/router";

import BucketCustomField from "./BucketCustomField";

const CUSTOM_FIELDS_QUERY = gql`
  query CustomFields($groupSlug: String!, $roundSlug: String!) {
    round(groupSlug: $groupSlug, roundSlug: $roundSlug) {
      id
      membersLimit {
        consumedPercentage
        currentCount
        limit
      }
      customFields {
        id
        name
        description
        type
        limit
        isRequired
        position
      }
    }
  }
`;

const BucketCustomFields = ({
  customFields,
  canEdit,
  roundId,
  bucketId,
  isEditingAllowed,
}) => {
  const router = useRouter();
  const [{ data }] = useQuery({
    query: CUSTOM_FIELDS_QUERY,
    variables: {
      groupSlug: router.query.group,
      roundSlug: router.query.round,
    },
  });

  if (!data || !data.round) {
    return null;
  }

  // TODO: can use the custom fields already fetched in the event query in _app
  const { customFields: defaultCustomFields } = data.round;

  return (
    <div>
      {[...defaultCustomFields]
        .sort((a, b) => a.position - b.position)
        .map((defaultCustomField) => {
          const customField = customFields.filter(
            (field) => field.customField?.id == defaultCustomField.id
          );
          return (
            <BucketCustomField
              key={defaultCustomField.id}
              defaultCustomField={defaultCustomField}
              customField={
                customField && customField.length > 0 ? customField[0] : null
              }
              roundId={roundId}
              bucketId={bucketId}
              canEdit={canEdit}
              isEditingAllowed={isEditingAllowed}
            />
          );
        })}
    </div>
  );
};

export default BucketCustomFields;
