import React from "react";
import CustomFields from "./EventCustomFields";
export default { title: 'Custom Fields' };

export const empty = () => {
  const event = {
    id: 1,
  };
  return(
  <>
    <CustomFields
      event={event}
      customFields={[]}
    />
  </>
  )
};

export const withExistingFields = () => {
  const event = {
    id: 1,
    customFields: [{
      name: 'Name',
      id: '12355',
      description: 'Description',
      type: 'TEXT',
      isRequired: false
    }]
  };
  return(
  <>
    <CustomFields
      event={event}
      customFields={event.customFields}
    />
  </>
  )
};

