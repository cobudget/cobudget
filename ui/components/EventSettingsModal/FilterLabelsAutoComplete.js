import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";

const UPDATE_FILTER_LABELS_MUTATION = gql`
  mutation UpdateFilterLabels($eventId: ID!, $filterLabelsId: [ID]!) {
    updateFilterLabels(eventId: $eventId, filterLabelsId: $filterLabelsId) {
      id
      filterLabels {
        eventId
      }
    }
  }
`;

export default ({
  className,
  event,
  defaultCustomFields,
  filterLabels
}) => {
  const [updateFilterLabels, { loading }] = useMutation(
    UPDATE_FILTER_LABELS_MUTATION,
    {
      variables: { eventId: event.id },
    }
  );

  const defaultValue = defaultCustomFields.filter((customFields) => 
  {
    return filterLabels.some(filterLabel => filterLabel.customField.id === customFields.id)
  });

  return (
    <Autocomplete
      multiple
      id="tags-standard"
      options={defaultCustomFields}
      getOptionLabel={(customField) => customField.name}
      defaultValue={defaultValue}
      filterSelectedOptions
      className={`${className}`}
      onChange={(event, newValue) => {
        const filterLabelsId = newValue.map(customField => customField.id);
        updateFilterLabels({
          variables: { filterLabelsId },
        })
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          label="Filter labels that appears on the front page"
          placeholder="Choose labels"
          fullWidth
        />
      )}
    />
  );
}
