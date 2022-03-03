import { useQuery, gql } from "urql";
import { useRouter } from "next/router";

import BucketCustomField from "./BucketCustomField";

const CUSTOM_FIELDS_QUERY = gql`
  query CustomFields($orgSlug: String!, $roundSlug: String!) {
    round(orgSlug: $orgSlug, roundSlug: $roundSlug) {
      id
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
}) => {
  const router = useRouter();
  const [{ data }] = useQuery({
    query: CUSTOM_FIELDS_QUERY,
    variables: {
      orgSlug: router.query.org,
      roundSlug: router.query.round,
    },
  });

  if (!data) {
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
            />
          );
        })}
    </div>
  );
};

export default BucketCustomFields;
