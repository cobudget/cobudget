import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import { useState } from "react";
import { Tooltip } from "react-tippy";
import ReactMarkdown from "react-markdown";
import IconButton from "../../IconButton";
import { EditIcon } from "../../Icons";
import TextField from "../../TextField";
import HiddenTextField from "../../HiddenTextField";
import SelectInput from "../../SelectInput";
import Button from "../../Button";

const EDIT_DREAM_CUSTOM_FIELD_MUTATION = gql`
  mutation EditDreamCustomField(
    $dreamId: ID!
    $customField: CustomFieldValueInput!
  ) {
    editDreamCustomField(dreamId: $dreamId, customField: $customField) {
      id
      customFields {
        id
        value
        customField {
          id
          name
          type
          limit
          description
          position
          isRequired
          createdAt
        }
      }
    }
  }
`;

const DreamCustomField = ({
  defaultCustomField,
  customField,
  eventId,
  dreamId,
  canEdit,
}) => {
  const defaultValue = customField ? customField.value : null;
  const [editing, setEditing] = useState(false);
  const { handleSubmit, register } = useForm();
  const [inputValue, setInputValue] = useState(defaultValue ?? "");
  const [{ fetching: loading }, editCustomFieldMutation] = useMutation(
    EDIT_DREAM_CUSTOM_FIELD_MUTATION
  );
  const fieldName = "customField";

  if (editing) {
    return (
      <form
        onSubmit={handleSubmit((variables) => {
          return editCustomFieldMutation({ dreamId, ...variables })
            .then(() => setEditing(false))
            .catch((err) => alert(err.message));
        })}
      >
        <div className="">
          <h3 className="my-2 font-medium text-xl">
            {defaultCustomField.name}
          </h3>
          <p className="my-2 text-gray-700">{defaultCustomField.description}</p>
          <HiddenTextField
            name={`${fieldName}.fieldId`}
            defaultValue={defaultCustomField.id}
            inputRef={register()}
          />
          <HiddenTextField
            name={`${fieldName}.eventId`}
            defaultValue={eventId}
            inputRef={register()}
          />
          <div className="my-2">
            {defaultCustomField.type === "TEXT" ||
            defaultCustomField.type === "MULTILINE_TEXT" ? (
              <TextField
                placeholder={defaultCustomField.name}
                name={`${fieldName}.value`}
                defaultValue={defaultValue}
                autoFocus
                multiline={defaultCustomField.type == "MULTILINE_TEXT"}
                rows={10}
                inputRef={register({
                  required: defaultCustomField.isRequired ? "Required" : null,
                })}
                inputProps={{
                  maxLength: defaultCustomField.limit,
                  value: inputValue,
                  onChange: (e) => setInputValue(e.target.value),
                }}
              />
            ) : defaultCustomField.type === "BOOLEAN" ? (
              <SelectInput
                name={`${fieldName}.value`}
                defaultValue={defaultValue}
                inputRef={register}
                fullWidth
                autoFocus
              >
                <option value={""}></option>
                <option value={true}>Yes</option>
                <option value={false}>No</option>
              </SelectInput>
            ) : null}
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600 font-medium pl-4">
            {defaultCustomField.limit
              ? String(defaultCustomField.limit - inputValue.length) +
                " characters remaining."
              : ""}
            <br></br>
            <span>
              {" "}
              <a
                href="https://www.markdownguide.org/cheat-sheet/"
                target="_/blank"
                className="hover:text-gray-800 border-b hover:border-gray-800"
              >
                Markdown formatting
              </a>{" "}
              allowed.
            </span>
          </div>
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
    );
  }

  if (customField && customField.value) {
    return (
      <div className="flex flex-col items-start justify-between relative">
        <div className="py-2" key={customField.fieldId}>
          <h2 className="text-xl font-medium">{defaultCustomField.name}</h2>
          {customField.customField.type == "MULTILINE_TEXT" ||
          customField.customField.type == "TEXT" ? (
            <ReactMarkdown
              source={customField.value}
              className="markdown"
              renderers={{
                link: (props) => (
                  <a href={props.href} target="_blank" rel="noreferrer">
                    {props.children}
                  </a>
                ),
                code: (props) => (
                  <code className="whitespace-pre-wrap" {...props}>
                    {props.value}
                  </code>
                ),
              }}
            />
          ) : (
            <span
              dangerouslySetInnerHTML={{
                __html: renderBooleanOrValue(customField.value),
              }}
            />
          )}
        </div>

        {canEdit && (
          <div className="absolute top-0 right-0">
            <Tooltip title="Edit questions" position="bottom" size="small">
              <IconButton onClick={() => setEditing(true)}>
                <EditIcon className="h-6 w-6" />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </div>
    );
  } else if (canEdit) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="w-full h-16 block text-gray-600 font-semibold rounded-lg border-3 border-dashed focus:outline-none focus:bg-gray-100 hover:bg-gray-100 mb-4"
      >
        + {defaultCustomField.name}
      </button>
    );
  }

  return null;
};

const renderBooleanOrValue = (value) => {
  if (value === "true") return "Yes";
  if (value === "false") return "No";
  return value.split("\n").join("<br/>");
};

export default DreamCustomField;
