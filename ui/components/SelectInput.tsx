import React from "react";
import { FormControl, InputLabel, Select } from "@mui/material";

const SelectInput = ({
  label,
  defaultValue,
  children,
  inputRef,
  name,
  fullWidth,
  value,
  onChange,
  disabled = false,
}: any) => {
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
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        {children}
      </Select>
    </FormControl>
  );
};

export default SelectInput;

// use this one;
export const SelectField = ({
  children,
  inputRef,
  inputProps,
  defaultValue,
  name,
  label,
  color = "green",
  className = "",
}: any) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium mb-1 block">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`block appearance-none w-full bg-gray-100 border-3 border-gray-100 py-3 px-4 pr-8 rounded focus:outline-none focus:ring focus:ring-${color} transition-shadows ease-in-out duration-200`}
          name={name}
          id={name}
          ref={inputRef}
          defaultValue={defaultValue}
          {...inputProps}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 flex items-center px-2 text-gray-700">
          <svg className="h-4 w-4" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
