import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Tooltip } from "react-tippy";
import { useQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";

import EditCustomField from './EditCustomField';
import Button from "../../Button";
import IconButton from "../../IconButton";
import { EditIcon } from "../../Icons";

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

const EDIT_CUSTOM_FIELDS_MUTATION = gql`
  mutation EditCustomFields($dreamId: ID!, $customFields: [CustomFieldValueInput]) {
    editDream(dreamId: $dreamId, customFields: $customFields) {
      id
      customFields {
        fieldId
        value
      }
    }
  }
`;

export default ({ customFields, canEdit, dreamId }) => {
  const router = useRouter();
  const { data } = useQuery(CUSTOM_FIELDS_QUERY, {
    variables: { slug: router.query.event },
  });
  const { handleSubmit, register, errors } = useForm();
  const [editing, setEditing] = useState(false);

  const [editCustomFields, { loading }] = useMutation(EDIT_CUSTOM_FIELDS_MUTATION, {
    variables: { dreamId },
  });
  if (!data) {
    return (<></>);
  }

  const { customFields:defaultCustomFields } = data.event;
  
  if (editing) {
    return (
      <>
        <form
          onSubmit={handleSubmit((variables) =>
            editCustomFields({ variables })
              .then(() => setEditing(false))
              .catch((err) => alert(err.message))
          )}
        >
          { defaultCustomFields.map((defaultCustomField, index) => {
            const fieldName = `customFields[${index}]`;
            const customField = customFields.filter(field => field.fieldId == defaultCustomField.id);
            const defaultValue = customField && customField.length > 0 ? customField[0].value : null;
            
            return (
              <EditCustomField
                defaultCustomField={defaultCustomField} 
                fieldName={fieldName}
                defaultValue={defaultValue}
                register={register} />
            )
          })
          }
          <div className="flex justify-end  mb-4">
            <div className="flex">
              <Button
                className="mr-2"
                variant="secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>

              <Button loading={loading} type="submit">
                Save
              </Button>
            </div>
          </div>
        </form>
      </>
    );
  }

  { return (customFields && customFields.length > 0) ?
    (
    <div className="flex flex-col items-start justify-between group relative">
      { customFields.map((customField, index) => {
        const defaultCustomField = defaultCustomFields.filter(field => field.id === customField.fieldId);
        if(customField.value && defaultCustomField && defaultCustomField.length > 0) {
          return  ( 
          <div className="py-2" key={customField.fieldId}>
            <h2 className="text-xl font-medium">{defaultCustomField[0].name}</h2>
            <p>{customField.value}</p>
          </div>
        )
        }
      })
      }
      {
      canEdit && (
        <div className="absolute top-0 right-0 invisible group-hover:visible">
          <Tooltip title="Edit custom fields" position="bottom" size="small">
            <IconButton onClick={() => setEditing(true)}>
              <EditIcon className="h-6 w-6" />
            </IconButton>
          </Tooltip>
        </div>
      )
    }
    </div>
  ) : canEdit? (
    <button
      onClick={() => setEditing(true)}
      className="h-24 w-full  text-gray-600  font-semibold rounded-lg border-3 focus:outline-none border-dashed hover:bg-gray-100 mb-4"
    >
      + Add Custom Fields
    </button>
  ) : null
  }
};
