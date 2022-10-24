import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import { useEffect, useMemo, useState } from "react";
import Tooltip from "@tippyjs/react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers";
import Markdown from "../../Markdown";
import IconButton from "../../IconButton";
import { EditIcon } from "../../Icons";
import TextField from "../../TextField";
import HiddenTextField from "../../HiddenTextField";
import SelectInput from "../../SelectInput";
import Button from "../../Button";
import { FormattedMessage, useIntl } from "react-intl";

const EDIT_BUCKET_CUSTOM_FIELD_MUTATION = gql`
  mutation EditBucketCustomField(
    $bucketId: ID!
    $customField: CustomFieldValueInput!
  ) {
    editBucketCustomField(bucketId: $bucketId, customField: $customField) {
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

const BucketCustomField = ({
  defaultCustomField,
  customField,
  roundId,
  bucketId,
  canEdit,
}) => {
  const defaultValue = customField ? customField.value : null;
  const [editing, setEditing] = useState(false);
  const intl = useIntl();

  const schema = useMemo(() => {
    const maxValue = yup
      .string()
      .max(defaultCustomField.limit ?? Infinity, "Too long");

    return yup.object().shape({
      customField: yup.object().shape({
        value: defaultCustomField.isRequired
          ? maxValue.required("Required")
          : maxValue,
      }),
    });
  }, [defaultCustomField]);

  const { handleSubmit, register, setValue, watch, errors } = useForm({
    resolver: yupResolver(schema),
  });
  const inputValue = watch("customField.value", defaultValue ?? "");

  const [{ fetching: loading }, editCustomFieldMutation] = useMutation(
    EDIT_BUCKET_CUSTOM_FIELD_MUTATION
  );

  useEffect(() => {
    if (defaultCustomField.type !== "BOOLEAN") {
      register({
        name: "customField.value",
      });
    }
  }, [register, defaultCustomField.type]);

  if (editing) {
    return (
      <form
        onSubmit={handleSubmit((variables) => {
          return editCustomFieldMutation({
            bucketId,
            ...variables,
          })
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
            name="customField.fieldId"
            defaultValue={defaultCustomField.id}
            inputRef={register()}
          />
          <HiddenTextField
            name="customField.roundId"
            defaultValue={roundId}
            inputRef={register()}
          />
          <div className="my-2">
            {defaultCustomField.type === "TEXT" ||
            defaultCustomField.type === "MULTILINE_TEXT" ? (
              <TextField
                placeholder={defaultCustomField.name}
                defaultValue={defaultValue}
                autoFocus
                multiline={defaultCustomField.type == "MULTILINE_TEXT"}
                rows={7}
                error={errors.customField?.value}
                helperText={errors.customField?.value?.message}
                inputProps={{
                  onChange: (e) =>
                    setValue("customField.value", e.target.value),
                }}
                wysiwyg
              />
            ) : defaultCustomField.type === "BOOLEAN" ? (
              <SelectInput
                name="customField.value"
                defaultValue={defaultValue}
                inputRef={register}
                fullWidth
              >
                <option value={""}></option>
                <option value={"true"}>
                  {intl.formatMessage({ defaultMessage: "Yes" })}
                </option>
                <option value={"false"}>
                  {intl.formatMessage({ defaultMessage: "No" })}
                </option>
              </SelectInput>
            ) : null}
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600 font-medium pl-4">
            {defaultCustomField.limit
              ? intl.formatMessage(
                  { defaultMessage: "{count} characters remaining." },
                  {
                    count: String(defaultCustomField.limit - inputValue.length),
                  }
                )
              : ""}
            <br></br>
            <span>
              {" "}
              <FormattedMessage
                defaultMessage="<a>Markdown formatting</a> allowed."
                values={{
                  a: (msg) => (
                    <a
                      href="https://www.markdownguide.org/cheat-sheet/"
                      target="_/blank"
                      className="hover:text-gray-800 border-b hover:border-gray-800"
                    >
                      {msg}
                    </a>
                  ),
                }}
              />
            </span>
          </div>
          <div className="flex">
            <Button
              className="mr-2"
              variant="secondary"
              onClick={() => setEditing(false)}
            >
              <FormattedMessage defaultMessage="Cancel" />
            </Button>

            <Button loading={loading} type="submit">
              <FormattedMessage defaultMessage="Save" />
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
            <Markdown source={customField.value} />
          ) : (
            <span
              dangerouslySetInnerHTML={{
                __html: renderBooleanOrValue(customField.value, intl),
              }}
            />
          )}
        </div>

        {canEdit && (
          <div className="absolute top-0 right-0">
            <Tooltip content="Edit field" placement="bottom" arrow={false}>
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
        className="w-full h-24 block text-gray-600 font-semibold rounded-lg border-3 border-dashed focus:outline-none focus:bg-gray-100 hover:bg-gray-100 mb-4"
      >
        + {defaultCustomField.name}
      </button>
    );
  }

  return null;
};

const renderBooleanOrValue = (value, intl) => {
  if (value === "true") return intl.formatMessage({ defaultMessage: "Yes" });
  if (value === "false") return intl.formatMessage({ defaultMessage: "No" });
  return value.split("\n").join("<br/>");
};

export default BucketCustomField;
