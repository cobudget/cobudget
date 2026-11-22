import { useState } from "react";
import { useMutation, gql } from "urql";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers";

import { Checkbox, Modal } from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import TextField from "components/TextField";
import Button from "components/Button";
import { SelectField } from "components/SelectInput";
import { FormattedMessage, useIntl } from "react-intl";
import Tooltip from "@tippyjs/react";
import {
  MAX_IMPORT_KEY_LENGTH,
  generateImportKey,
  validateImportKey,
} from "utils/fieldKey";

const ADD_CUSTOM_FIELD_MUTATION = gql`
  mutation AddCustomField($roundId: ID!, $customField: CustomFieldInput!) {
    addCustomField(roundId: $roundId, customField: $customField) {
      id
      customFields {
        id
        name
        description
        type
        limit
        options
        isRequired
        importKey
        isUniqueIdentifier
        position
        createdAt
      }
    }
  }
`;

const EDIT_CUSTOM_FIELD_MUTATION = gql`
  mutation EditCustomField(
    $roundId: ID!
    $fieldId: ID!
    $customField: CustomFieldInput!
  ) {
    editCustomField(
      roundId: $roundId
      fieldId: $fieldId
      customField: $customField
    ) {
      id
      customFields {
        id
        name
        description
        type
        limit
        options
        isRequired
        importKey
        isUniqueIdentifier
        position
        createdAt
      }
    }
  }
`;

const schema = yup.object().shape({
  customField: yup.object().shape({
    name: yup.string().required("Required"),
    description: yup.string().required("Required"),
    type: yup
      .mixed()
      .oneOf(["TEXT", "MULTILINE_TEXT", "BOOLEAN", "ENUM", "FILE"])
      .required(),
    limit: yup
      .number()
      .transform((cv) => (isNaN(cv) ? undefined : cv))
      .nullable(),
    isRequired: yup.bool().required(),
  }),
});

// Import key: empty on create = generated from the name by the server.
const keyError = (key, others) => {
  const k = (key ?? "").trim();
  if (!k) return null;
  const invalid = validateImportKey(k);
  if (invalid) return invalid;
  const clash = others.find((f) => f.importKey === k);
  return clash ? `Already used by the field "${clash.name}".` : null;
};

export default function AddOrEditCustomField({
  round,
  handleClose,
  customField = {
    name: "",
    description: "",
    type: "TEXT",
    limit: null,
    options: [],
    isRequired: false,
    importKey: null,
    isUniqueIdentifier: false,
  },
}) {
  const editing = Boolean(customField.id);
  const [typeInputValue, setTypeInputValue] = useState(customField.type);

  const [{ fetching: loading }, addOrEditCustomField] = useMutation(
    editing ? EDIT_CUSTOM_FIELD_MUTATION : ADD_CUSTOM_FIELD_MUTATION
  );

  const { control, handleSubmit, register, errors, watch } = useForm({
    resolver: yupResolver(schema),
  });

  // Requires to manage seperetly due to Material UI Checkbox
  const [isRequired, setIsRequired] = useState(customField.isRequired || false);
  const [limit, setLimit] = useState(Number(customField.limit) || null);
  const [optionsInput, setOptionsInput] = useState(
    (customField.options ?? []).join(", ")
  );
  const [isUniqueIdentifier, setIsUniqueIdentifier] = useState(
    customField.isUniqueIdentifier || false
  );
  const [importKey, setImportKey] = useState(customField.importKey ?? "");
  const otherFields = (round.customFields ?? []).filter(
    (f) => f.id !== customField.id
  );
  const currentUnique = otherFields.find((f) => f.isUniqueIdentifier);
  // New field: the column key follows the name as it is typed, until the admin
  // edits the key by hand. Existing field: the key is stable (a rename keeps it).
  const [keyEdited, setKeyEdited] = useState(false);
  const nameValue = watch("customField.name") ?? customField.name ?? "";
  const suggestedKey = nameValue.trim()
    ? generateImportKey(
        nameValue,
        otherFields.map((f) => f.importKey)
      )
    : "";
  const keyValue = editing || keyEdited ? importKey : suggestedKey;
  const importKeyError = keyError(keyValue, otherFields);
  const intl = useIntl();

  return (
    <Modal
      open={true}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-sm">
        <h1 className="text-lg font-semibold mb-2">
          <FormattedMessage
            defaultMessage="{action} for item"
            values={{
              action: editing ? "Editing" : "Add",
            }}
          />
        </h1>
        <form
          onSubmit={handleSubmit((variables) => {
            if (importKeyError) return;
            variables.customField.isRequired = isRequired;
            variables.customField.importKey = keyValue.trim() || null;
            variables.customField.isUniqueIdentifier =
              typeInputValue === "TEXT" && isUniqueIdentifier;
            variables.customField.options =
              typeInputValue === "ENUM" || typeInputValue === "TEXT"
                ? optionsInput.split(",").map((s) => s.trim()).filter(Boolean)
                : [];
            return addOrEditCustomField({
              ...variables,
              roundId: round.id,
              ...(editing && { fieldId: customField.id }),
            })
              .then(() => handleClose())
              .catch((err) => alert(err.message));
          })}
        >
          <div className="grid gap-4">
            <TextField
              placeholder={intl.formatMessage({ defaultMessage: "Name" })}
              name={"customField.name"}
              defaultValue={customField.name}
              inputRef={register}
              error={errors.customField?.name}
              helperText={errors.customField?.name?.message}
              color={round.color}
              testid="customfield-name-input"
            />
            <TextField
              placeholder={intl.formatMessage({
                defaultMessage: "Description",
              })}
              name={"customField.description"}
              defaultValue={customField.description}
              inputRef={register}
              error={errors.customField?.description}
              helperText={errors.customField?.description?.message}
              color={round.color}
              testid="customfield-description-input"
            />
            <div className="flex">
              <span data-testid="customfield-type-select">
                <SelectField
                  name={"customField.type"}
                  defaultValue={customField.type}
                  inputRef={register}
                  className="mr-4"
                  color={round.color}
                  inputProps={{
                    value: typeInputValue,
                    onChange: (e) => setTypeInputValue(e.target.value),
                  }}
                >
                  <option value="TEXT">
                    {intl.formatMessage({ defaultMessage: "Short Text" })}
                  </option>
                  <option value="MULTILINE_TEXT">
                    {intl.formatMessage({ defaultMessage: "Long Text" })}
                  </option>
                  <option value="BOOLEAN">
                    {intl.formatMessage({ defaultMessage: "Yes/No" })}
                  </option>
                  <option value="ENUM">
                    {intl.formatMessage({ defaultMessage: "Select (dropdown)" })}
                  </option>
                </SelectField>
              </span>
              {typeInputValue == "TEXT" ||
              typeInputValue == "MULTILINE_TEXT" ? (
                <TextField
                  placeholder={intl.formatMessage({
                    defaultMessage: "Character limit",
                  })}
                  name={"customField.limit"}
                  defaultValue={customField.limit}
                  inputRef={register}
                  error={errors.customField?.limit}
                  helperText={errors.customField?.limit?.message}
                  color={round.color}
                  inputProps={{
                    type: "number",
                    min: "1",
                    value: limit,
                    onChange: (e) => setLimit(e.target.value),
                  }}
                  testid="customfield-limit-input"
                />
              ) : null}
            </div>
            {typeInputValue === "ENUM" && (
              <TextField
                placeholder={intl.formatMessage({
                  defaultMessage: "Options (comma-separated)",
                })}
                color={round.color}
                inputProps={{
                  value: optionsInput,
                  onChange: (e) => setOptionsInput(e.target.value),
                }}
              />
            )}
            {typeInputValue === "TEXT" && (
              <TextField
                placeholder={intl.formatMessage({
                  defaultMessage: "Autocomplete suggestions (optional, comma-separated)",
                })}
                color={round.color}
                inputProps={{
                  value: optionsInput,
                  onChange: (e) => setOptionsInput(e.target.value),
                }}
              />
            )}
            <div className="flex">
              <Controller
                as={
                  <FormControlLabel
                    label={intl.formatMessage({
                      defaultMessage: "Is Required",
                    })}
                    control={
                      <Checkbox
                        onChange={(e) => {
                          setIsRequired(e.target.checked);
                        }}
                        checked={isRequired}
                      />
                    }
                  />
                }
                name={"customField.isRequired"}
                defaultValue={customField.isRequired}
                control={control}
                inputRef={register}
              />
            </div>
            <div>
              <TextField
                label={intl.formatMessage({
                  defaultMessage: "CSV import column",
                })}
                placeholder={intl.formatMessage({
                  defaultMessage: "Generated from the name",
                })}
                color={round.color}
                error={Boolean(importKeyError)}
                helperText={
                  importKeyError ??
                  intl.formatMessage(
                    {
                      defaultMessage:
                        "Column name in the import file. Max {max} characters.",
                    },
                    { max: MAX_IMPORT_KEY_LENGTH }
                  )
                }
                inputProps={{
                  value: keyValue,
                  onChange: (e) => {
                    setKeyEdited(true);
                    setImportKey(e.target.value);
                  },
                }}
                testid="customfield-importkey-input"
              />
              {typeInputValue === "TEXT" && (
                <div className="mt-2">
                  {/* A disabled checkbox gets no mouse/touch events, so the
                      tooltip hangs on the wrapper: hover on desktop, tap on
                      touch screens. */}
                  <Tooltip
                    content={intl.formatMessage(
                      {
                        defaultMessage:
                          '"{name}" is already the unique identifier of this round.',
                      },
                      { name: currentUnique?.name }
                    )}
                    placement="bottom-start"
                    arrow={false}
                    disabled={!currentUnique}
                  >
                    <span className="inline-block">
                      <FormControlLabel
                        label={intl.formatMessage({
                          defaultMessage: "Unique entry identifier",
                        })}
                        control={
                          <Checkbox
                            onChange={(e) =>
                              setIsUniqueIdentifier(e.target.checked)
                            }
                            checked={isUniqueIdentifier}
                            disabled={Boolean(currentUnique)}
                            data-testid="customfield-unique-checkbox"
                          />
                        }
                      />
                    </span>
                  </Tooltip>
                  <p className="text-sm text-gray-600">
                    <FormattedMessage defaultMessage="Each imported entry needs a different value here; it also becomes a tag." />
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end items-center">
            <div className="flex">
              <Button
                variant="secondary"
                color={round.color}
                onClick={handleClose}
                className="mr-2"
              >
                <FormattedMessage defaultMessage="Cancel" />
              </Button>
              <Button
                type="submit"
                loading={loading}
                color={round.color}
                testid="submit-custom-field-button"
              >
                <FormattedMessage defaultMessage="Save" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
