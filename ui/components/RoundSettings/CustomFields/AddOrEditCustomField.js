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
        isRequired
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
        isRequired
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

export default function AddOrEditCustomField({
  round,
  handleClose,
  customField = {
    name: "",
    description: "",
    type: "TEXT",
    limit: null,
    isRequired: false,
  },
}) {
  const editing = Boolean(customField.id);
  const [typeInputValue, setTypeInputValue] = useState(customField.type);

  const [{ fetching: loading }, addOrEditCustomField] = useMutation(
    editing ? EDIT_CUSTOM_FIELD_MUTATION : ADD_CUSTOM_FIELD_MUTATION
  );

  const { control, handleSubmit, register, errors } = useForm({
    resolver: yupResolver(schema),
  });

  // Requires to manage seperetly due to Material UI Checkbox
  const [isRequired, setIsRequired] = useState(customField.isRequired || false);
  const [limit, setLimit] = useState(Number(customField.limit) || null);
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
            variables.customField.isRequired = isRequired;
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
            />
            <div className="flex">
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
                  {intl.formatMessage({defaultMessage: "Short Text"})}
                </option>
                <option value="MULTILINE_TEXT">
                  {intl.formatMessage({defaultMessage: "Long Text"})}
                </option>
                <option value="BOOLEAN">
                  {intl.formatMessage({defaultMessage: "Yes/No"})}
                </option>
              </SelectField>
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
                />
              ) : null}
            </div>
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
              <Button type="submit" loading={loading} color={round.color}>
                <FormattedMessage defaultMessage="Save" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
