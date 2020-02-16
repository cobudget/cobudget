import { FormControl, InputLabel, Select } from "@material-ui/core";

export default ({
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
