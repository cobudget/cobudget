import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Tooltip } from "react-tippy";
import { useQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";

import TextField from "../../TextField";
import Button from "../../Button";
import IconButton from "../../IconButton";
import { EditIcon } from "../../Icons";

const CUSTOM_FIELDS_QUERY = gql`
  query CustomFields($slug: STRING!) {
    event(slug: $slug) {
      customFields {
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
  mutation EditCustomFields($dreamId: ID!, $customFields: [CustomFieldInput]) {
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
  const { customFields:defaultCustomFields } = data.event;

  const [editCustomFields, { loading }] = useMutation(EDIT_CUSTOM_FIELDS_MUTATION, {
    variables: { dreamId },
  });
  const { handleSubmit, register, errors } = useForm();
  const [editing, setEditing] = useState(false);
  
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
            return (
              <div className={`flex flex-col sm:flex-row my-2`} key={fieldName}>
                <div className="mr-2 my-2 sm:my-0 flex-grow">
                  { defaultCustomField.name }
                  { defaultCustomField.description }
                  
                </div>
                <div className="mr-2 my-2 sm:my-0 flex-grow">
                  <TextField
                    placeholder="Value"
                    name={`${fieldName}.value`}
                    defaultValue={customFields.value}
                    inputRef={register({
                      required: defaultCustomField.isRequired ? "Required" : null,
                    })}
                  />
                </div>
            </div>
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

  return (
    <div className="flex items-start justify-between group relative">
      <h1 className="mb-2 text-4xl font-medium">Here we should show existing customFields</h1>
      {canEdit && (
        <div className="absolute top-0 right-0 invisible group-hover:visible">
          <Tooltip title="Edit custom fields" position="bottom" size="small">
            <IconButton onClick={() => setEditing(true)}>
              <EditIcon className="h-6 w-6" />
            </IconButton>
          </Tooltip>
        </div>
      )}
    </div>
  )
};
