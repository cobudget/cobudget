import { useQuery, gql } from "@apollo/client";
import { useRouter } from "next/router";

import DreamCustomField from "./DreamCustomField";

const CUSTOM_FIELDS_QUERY = gql`
  query CustomFields($slug: String!) {
    event(slug: $slug) {
      id
      customFields {
        id
        name
        description
        type
        limit
        isRequired
        position
        isShownOnFrontPage
      }
    }
  }
`;

const DreamCustomFields = ({ customFields, canEdit, eventId, dreamId }) => {
  const router = useRouter();
  const { data } = useQuery(CUSTOM_FIELDS_QUERY, {
    variables: { slug: router.query.event },
  });

  if (!data) {
    return <></>;
  }

  // TODO: can use the custom fields already fetched in the event query in _app
  const { customFields: defaultCustomFields } = data.event;

  return [...defaultCustomFields]
    .sort((a, b) => a.position - b.position)
    .map((defaultCustomField) => {
      const customField = customFields.filter(
        (field) => field.customField?.id == defaultCustomField.id
      );
      return (
        <DreamCustomField
          key={defaultCustomField.id}
          defaultCustomField={defaultCustomField}
          customField={
            customField && customField.length > 0 ? customField[0] : null
          }
          eventId={eventId}
          dreamId={dreamId}
          canEdit={canEdit}
        />
      );
    });
};

export default DreamCustomFields;
