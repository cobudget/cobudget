import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

export default ({
  className,
  defaultCustomFields,
  filterLabels
}) => {
  return (
    <Autocomplete
      multiple
      id="tags-standard"
      options={defaultCustomFields}
      getOptionLabel={(customField) => customField.name}
      defaultValue={filterLabels}
      filterSelectedOptions
      className={`${className}`}
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
