import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";

import EditCustomField from "./EditCustomField";

const CUSTOM_FIELDS_QUERY = gql`
  query CustomFields($slug: String!) {
    event(slug: $slug) {
      id
      customFields {
        id,
        name,
        description,
        type,
        isRequired,
        isShownOnFrontPage,
      }
    }
  }
`;

export default ({ customFields, canEdit, dreamId }) => {
  const router = useRouter();
  const { data } = useQuery(CUSTOM_FIELDS_QUERY, {
    variables: { slug: router.query.event },
  });  
  
  if (!data) {
    return (<></>);
  }

  const { customFields:defaultCustomFields } = data.event;
  
  { return defaultCustomFields.map((defaultCustomField, index) => {
    const customField = customFields.filter(field => field.fieldId == defaultCustomField.id);
    return (
      <EditCustomField
        defaultCustomField={defaultCustomField}
        customField={customField && customField.length > 0 ? customField[0]: null}
        dreamId={dreamId}
        canEdit={canEdit}
      />
    );
  })
  }
}
