import useForm from "react-hook-form";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import {
  TextField,
  Box,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Button
} from "@material-ui/core";
import slugify from "../../utils/slugify";

const EDIT_EVENT = gql`
  mutation editEvent(
    $slug: String
    $title: String
    $currency: String
    $registrationPolicy: RegistrationPolicy
  ) {
    editEvent(
      slug: $slug
      title: $title
      currency: $currency
      registrationPolicy: $registrationPolicy
    ) {
      id
      title
      slug
      currency
      registrationPolicy
    }
  }
`;

const SelectInput = ({
  label,
  defaultValue,
  children,
  inputRef,
  name,
  fullWidth
}) => {
  const inputLabel = React.useRef(null);
  const [labelWidth, setLabelWidth] = React.useState(0);
  React.useEffect(() => {
    setLabelWidth(inputLabel.current.offsetWidth);
  }, []);
  return (
    <FormControl variant="outlined" fullWidth={fullWidth}>
      <InputLabel ref={inputLabel} id={`${label}-label`}>
        {label}
      </InputLabel>
      <Select
        native
        name={name}
        labelId={`${label}-label`}
        id={label}
        defaultValue={defaultValue}
        labelWidth={labelWidth}
        inputRef={inputRef}
      >
        {children}
      </Select>
    </FormControl>
  );
};

export default ({ event }) => {
  const [editEvent] = useMutation(EDIT_EVENT);

  const { handleSubmit, register, setValue, formState, errors } = useForm();

  return (
    <>
      <h2>Edit event</h2>
      <form
        onSubmit={handleSubmit(variables => {
          editEvent({ variables })
            .then(data => {
              // Add "Snackbar" success message from material UI
            })
            .catch(error => {
              alert(error.message);
            });
        })}
      >
        <Box maxWidth={500}>
          <Box m="15px 0">
            <TextField
              name="title"
              label="Title"
              defaultValue={event.title}
              variant="outlined"
              fullWidth
              inputRef={register}
            />
          </Box>
          <Box m="15px 0">
            <TextField
              name="slug"
              label="Slug"
              defaultValue={event.slug}
              fullWidth
              inputRef={register}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">.dreams.wtf</InputAdornment>
                ),
                onBlur: e => {
                  setValue("slug", slugify(e.target.value));
                }
              }}
              variant="outlined"
            />
          </Box>
          <Box m="15px 0">
            <SelectInput
              name="currency"
              label="Currency"
              defaultValue={event.currency}
              inputRef={register}
              fullWidth
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="SEK">SEK</option>
              <option value="DKK">DKK</option>
            </SelectInput>
          </Box>
          <Box m="15px 0">
            <SelectInput
              name="registrationPolicy"
              label="Registration policy"
              defaultValue={event.registrationPolicy}
              inputRef={register}
              fullWidth
            >
              <option value="OPEN">Open</option>
              <option value="REQUEST_TO_JOIN">Request to join</option>
              <option value="INVITE_ONLY">Invite only</option>
            </SelectInput>
          </Box>
          <Box m="15px 0">
            <Button
              type="submit"
              size="large"
              variant="contained"
              color="primary"
            >
              Save
            </Button>
          </Box>
        </Box>
      </form>
    </>
  );
};
