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

const ADD_CUSTOM_FIELD_MUTATION = gql`
  mutation AddCustomField($collectionId: ID!, $customField: CustomFieldInput!) {
    addCustomField(collectionId: $collectionId, customField: $customField) {
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
    $collectionId: ID!
    $fieldId: ID!
    $customField: CustomFieldInput!
  ) {
    editCustomField(
      collectionId: $collectionId
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

export default ({
  event,
  handleClose,
  customField = {
    name: "",
    description: "",
    type: "TEXT",
    limit: null,
    isRequired: false,
  },
}) => {
  const editing = Boolean(customField.id);
  const [typeInputValue, setTypeInputValue] = useState("TEXT");

  const [{ fetching: loading }, addOrEditCustomField] = useMutation(
    editing ? EDIT_CUSTOM_FIELD_MUTATION : ADD_CUSTOM_FIELD_MUTATION
  );

  const { control, handleSubmit, register, errors } = useForm({
    resolver: yupResolver(schema),
  });

  // Requires to manage seperetly due to Material UI Checkbox
  const [isRequired, setIsRequired] = useState(customField.isRequired || false);
  const [limit, setLimit] = useState(Number(customField.limit) || null);

  return (
    <Modal
      open={true}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-sm">
        <h1 className="text-lg font-semibold mb-2">
          {editing ? "Editing" : "Add"} question
        </h1>
        <form
          onSubmit={handleSubmit((variables) => {
            variables.customField.isRequired = isRequired;
            return addOrEditCustomField({
              ...variables,
              collectionId: event.id,
              ...(editing && { fieldId: customField.id }),
            })
              .then(() => handleClose())
              .catch((err) => alert(err.message));
          })}
        >
          <div className="grid gap-4">
            <TextField
              placeholder="Name"
              name={"customField.name"}
              defaultValue={customField.name}
              inputRef={register}
              error={errors.customField?.name}
              helperText={errors.customField?.name?.message}
              color={event.color}
            />
            <TextField
              placeholder="Description"
              name={"customField.description"}
              defaultValue={customField.description}
              inputRef={register}
              error={errors.customField?.description}
              helperText={errors.customField?.description?.message}
              color={event.color}
            />
            <div className="flex">
              <SelectField
                name={"customField.type"}
                defaultValue={customField.type}
                inputRef={register}
                className="mr-4"
                color={event.color}
                inputProps={{
                  value: typeInputValue,
                  onChange: (e) => setTypeInputValue(e.target.value),
                }}
              >
                <option value="TEXT">Short Text</option>
                <option value="MULTILINE_TEXT">Long Text</option>
                <option value="BOOLEAN">Yes/No</option>
              </SelectField>
              {typeInputValue == "TEXT" ||
              typeInputValue == "MULTILINE_TEXT" ? (
                <TextField
                  placeholder="Character limit"
                  name={"customField.limit"}
                  defaultValue={customField.limit}
                  inputRef={register}
                  error={errors.customField?.limit}
                  helperText={errors.customField?.limit?.message}
                  color={event.color}
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
                    label="Is Required"
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
                color={event.color}
                onClick={handleClose}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading} color={event.color}>
                Save
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
