import { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers";

import { Checkbox, Modal } from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import TextField from "components/TextField";
import Button from "components/Button";
import { SelectField } from "components/SelectInput";

const ADD_CUSTOM_FIELD_MUTATION = gql`
  mutation AddCustomField($eventId: ID!, $customField: CustomFieldInput!) {
    addCustomField(eventId: $eventId, customField: $customField) {
      id
      customFields {
        id
        name
        description
        type
        isRequired
        position
        isShownOnFrontPage
        createdAt
      }
    }
  }
`;

const EDIT_CUSTOM_FIELD_MUTATION = gql`
  mutation EditCustomField(
    $eventId: ID!
    $fieldId: ID!
    $customField: CustomFieldInput!
  ) {
    editCustomField(
      eventId: $eventId
      fieldId: $fieldId
      customField: $customField
    ) {
      id
      customFields {
        id
        name
        description
        type
        isRequired
        position
        isShownOnFrontPage
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
    isRequired: yup.bool().required(),
    isShownOnFrontPage: yup.bool().nullable(),
  }),
});

export default ({
  event,
  handleClose,
  customField = {
    name: "",
    description: "",
    type: "TEXT",
    isRequired: false,
    isShownOnFrontPage: false,
  },
}) => {
  const editing = Boolean(customField.id);

  const [addOrEditCustomField, { loading }] = useMutation(
    editing ? EDIT_CUSTOM_FIELD_MUTATION : ADD_CUSTOM_FIELD_MUTATION,
    {
      variables: {
        eventId: event.id,
        ...(editing && { fieldId: customField.id }),
      },
    }
  );

  const { control, handleSubmit, register, errors } = useForm({
    resolver: yupResolver(schema),
  });

  // Requires to manage seperetly due to Material UI Checkbox 
  const [isShownOnFrontPage, setIsShownOnFrontPage] = useState(customField.isShownOnFrontPage || false);
  const [isRequired, setIsRequired] = useState(customField.isRequired || false);

  return (
    <Modal
      open={true}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-sm">
        <h1 className="text-lg font-semibold mb-2">
          {editing ? "Editing" : "Add"} custom field
        </h1>
        <form
          onSubmit={handleSubmit((variables) => {
            variables.customField.isShownOnFrontPage = isShownOnFrontPage;
            variables.customField.isRequired = isRequired;
            return addOrEditCustomField({ variables })
              .then(() => handleClose())
              .catch((err) => alert(err.message))
          }
          )}
        >
          <div className="grid gap-4">
            <TextField
              placeholder="Name"
              name={"customField.name"}
              defaultValue={customField.name}
              inputRef={register}
              error={errors.customField?.name}
              helperText={errors.customField?.name?.message}
            />
            <TextField
              placeholder="Description"
              name={"customField.description"}
              defaultValue={customField.description}
              inputRef={register}
              error={errors.customField?.description}
              helperText={errors.customField?.description?.message}
            />
            <div className="flex">
              <SelectField
                name={"customField.type"}
                defaultValue={customField.type}
                inputRef={register}
                className="mr-4"
              >
                <option value="TEXT">Short Text</option>
                <option value="MULTILINE_TEXT">Long Text</option>
                <option value="BOOLEAN">Yes/No</option>
              </SelectField>
              <Controller
                as={
                  <FormControlLabel
                    label="Is Required"
                    control={
                      <Checkbox
                      onChange={(e) => {
                        setIsRequired(e.target.checked);
                      }}
                      checked={isRequired} />
                    }
                  />
                }
                name={"customField.isRequired"}
                defaultValue={customField.isRequired}
                control={control}
                inputRef={register}
              />
              <Controller
                as={
                  <FormControlLabel
                    label="Show on front page"
                    control={
                      <Checkbox
                        onChange={(e) => {
                          setIsShownOnFrontPage(e.target.checked);
                        }}
                        checked={isShownOnFrontPage} />
                      }
                  />
                }
                name={"customField.isShownOnFrontPage"}
                defaultValue={isShownOnFrontPage}
                control={control}
                inputRef={register}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end items-center">
            <div className="flex">
              <Button
                variant="secondary"
                onClick={handleClose}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Save
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
