import gql from "graphql-tag";
import { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import { useForm } from "react-hook-form";
import { Modal } from "@material-ui/core";
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import TextField from "../TextField";
import HiddenTextField from "../HiddenTextField";
import Button from "../Button";
import IconButton from "../IconButton";
import { DeleteIcon, AddIcon } from "../Icons";
import { Delete as OldDeleteIcon, Add as OldAddIcon } from "@material-ui/icons";
import { makeStyles } from '@material-ui/core/styles';

import SelectInput from "../SelectInput";

import * as yup from "yup";

const EDIT_CUSTOM_FIELDS_MUTATION = gql`
  mutation EditCustomFields($eventId: ID!, $customFields: [CustomFieldInput]!) {
    editCustomFields(eventId: $eventId, customFields: $customFields) {
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

const schema = yup.object().shape({
  customFields: yup.array().of(
    yup.object().shape({
      name: yup.string().required(),
      description: yup.string().required(),
      type: yup.string().required(), //TODO: enum
      isRequired: yup.bool().required(),
      isShownOnFrontPage: yup.bool(),
    })
  ),
});

export default ({
  initialCustomFields,
  event,
  currency,
  allowStretchGoals,
  handleClose,
  open,
}) => {
  const [editCustomFields, { loading }] = useMutation(EDIT_CUSTOM_FIELDS_MUTATION, {
    variables: { eventId: event.id },
  });

  const { handleSubmit, register, errors } = useForm({
    validationSchema: schema,
  });

  const emptyCustomField = { description: ""};

  const [customFields, setCustomFields] = useState(
    initialCustomFields && initialCustomFields.length ? initialCustomFields : [emptyCustomField]
  );

  const addCustomField = () => setCustomFields([...customFields, emptyCustomField]);
  const removeCustomField = (i) =>
    setCustomFields([...customFields.filter((item, index) => i !== index)]);

    const useStyles = makeStyles({
      modalStyle:{
        overflow:'scroll',
        display:'grid'
      }
  });
  
  const classes = useStyles();
  return (
    <Modal
      open={open}
      onClose={()=> {}}
      className={`flex items-center justify-center p-4 ${classes.modalStyle}`}
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-md">
        <h1 className="text-xl font-semibold">Edit custom fields</h1>

        <form
          onSubmit={handleSubmit((variables) =>
            editCustomFields({ variables })
              .then((data) => {
                console.log({ data });
                handleClose();
              })
              .catch((err) => alert(err.message))
          )}
        >
          <Grid container spacing={2}>
            {customFields.map((customField, index) => {
              const fieldName = `customFields[${index}]`;
              return (
                <Grid item xs={12} key={fieldName}>
                  <Grid container>
                    <Grid item>
                      <HiddenTextField
                        name={`${fieldName}.id`}
                        defaultValue={customField.id}
                        inputRef={register()}
                      />
                      <TextField
                        placeholder="Name"
                        name={`${fieldName}.name`}
                        defaultValue={customField.name}
                        inputRef={register({
                          required: "Required",
                        })}
                      />
                    </Grid>

                    <Grid item>
                      <TextField
                        placeholder="Description"
                        name={`${fieldName}.description`}
                        defaultValue={customField.description}
                        inputRef={register({
                          required: "Required",
                        })}
                      />
                    </Grid>

                    <Grid item>
                      <SelectInput
                        name={`${fieldName}.type`}
                        label="Type"
                        defaultValue={customField.type}
                        inputRef={register({
                          required: "Required",
                        })}
                      >
                        <option value="TEXT">Text field</option>
                        <option value="MULTILINE_TEXT">Multi line text</option>
                        <option value="BOOLEAN">Checkbox - True / False</option>
                      </SelectInput>
                    </Grid>

                    <Grid item>
                    <FormControlLabel
                      control={<Checkbox
                        name={`${fieldName}.isRequired`}
                        defaultValue={customField.isRequired}
                        inputRef={register({
                          required: "Required",
                        })}
                      />}
                      label="Is Required"
                    />
                    </Grid>
                  </Grid>

                  <div className="my-2">
                    <IconButton onClick={() => removeCustomField(index)}>
                      <DeleteIcon className="h-6 w-6 text-color-red" />
                    </IconButton>
                  </div>
              </Grid>
              );
            })
            }
          </Grid>
          <div className="flex mb-2">
            <Button
              variant="secondary"
              onClick={addCustomField}
              className="flex-grow"
            >
              <AddIcon className="h-5 w-5 mr-1" /> Add row
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
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
