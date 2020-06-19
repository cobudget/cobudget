import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";
import { useState, useEffect } from "react";
import { Tooltip } from "react-tippy";
import gql from "graphql-tag";
import IconButton from "../../IconButton";
import { EditIcon } from "../../Icons";
import TextField from "../../TextField";
import HiddenTextField from "../../HiddenTextField";
import SelectInput from "../../SelectInput";
import Button from "../../Button";

const EDIT_CUSTOM_FIELD_MUTATION = gql`
  mutation EditCustomField($dreamId: ID!, $customField: CustomFieldValueInput!) {
    editDreamCustomField(dreamId: $dreamId, customField: $customField) {
      id
      customFields {
        fieldId
        value
      }
    }
  }
`;

export default ({ defaultCustomField, customField, dreamId, canEdit}) => {
  const defaultValue = customField ? customField.value : null;
  const [editing, setEditing] = useState(false);
  const { handleSubmit, register, errors } = useForm();
  const [editCustomFieldMutation, { loading }] = useMutation(EDIT_CUSTOM_FIELD_MUTATION, {
    variables: { dreamId },
  });
  const fieldName = "customField";
  
  if(editing) {
    return (
      <form
        key={defaultCustomField.id}
        onSubmit={handleSubmit((variables) =>
          {
          return editCustomFieldMutation({ variables })
            .then(() => setEditing(false))
            .catch((err) => alert(err.message))
          }
        )}
      >
        <div className={`flex flex-col sm:flex-row my-2`}>
          <div className="mr-2 my-2 sm:my-0 flex-grow">
            { defaultCustomField.name }
            <br />
            { defaultCustomField.description }
          </div>
          <HiddenTextField
            name={`${fieldName}.fieldId`}
            defaultValue={defaultCustomField.id}
            inputRef={register()}
          />
          <div className="mr-2 my-2 sm:my-0 flex-grow">
            { defaultCustomField.type === 'TEXT' || defaultCustomField.type === 'MULTILINE_TEXT' ? (
              <TextField
                placeholder="Value"
                name={`${fieldName}.value`}
                defaultValue={defaultValue}
                multiline = {defaultCustomField.type == 'MULTILINE_TEXT'}
                rows={4}
                inputRef={register({
                  required: defaultCustomField.isRequired ? "Required" : null,
                })}
              />
            ) : (defaultCustomField.type === 'BOOLEAN')? (
              <SelectInput
                  name={`${fieldName}.value`}
                  defaultValue={defaultValue}
                  inputRef={register}
                  fullWidth
                >
                  <option value={''}></option>
                  <option value={true}>Yes</option>
                  <option value={false}>No</option>
              </SelectInput>
            ): null
            }
          </div>
        </div>
        <div className="flex justify-end mb-4">
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
    )
  }

  if (customField) {
    return (
      <div className="flex flex-col items-start justify-between group relative">
        <div className="py-2" key={customField.fieldId}>
          <h2 className="text-xl font-medium">{defaultCustomField.name}</h2>
          <span dangerouslySetInnerHTML={{__html: renderBooleanOrValue(customField.value)}} />
        </div>
        { canEdit && (
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
  } else if(canEdit) {
    return(
      <button
        onClick={() => setEditing(true)}
        className="block w-full h-16 text-gray-600 font-semibold rounded-lg border-3 border-dashed focus:outline-none focus:bg-gray-100 hover:bg-gray-100 mb-2"
      > + Add {defaultCustomField.name}
      </button>
    )
  }

  return null;
  
}

const renderBooleanOrValue = (value) => {
  if(value === "true" || value === "false") {
    return value ? "Yes" : "No";
  }
  else {
    return value.split('\n').join('<br/>');
  }
}
