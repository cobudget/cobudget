import { useState } from "react";

const TextField = ({
  inputRef,
  inputProps,
  name,
  placeholder,
  label,
  labelComponent,
  defaultValue,
  error,
  helperText,
  className,
  multiline,
  rows,
  size,
  autoFocus,
  startAdornment,
  endAdornment,
  color = "green",
}) => {
  const [hasFocus, setHasFocus] = useState(false);
  const LabelComponent = labelComponent;
  return (
    <div className={`flex flex-col ${className}`}>
      {(label || labelComponent) && (
        <label htmlFor={name} className="text-sm font-medium mb-1 block">
          {label ? label : <LabelComponent />}
        </label>
      )}
      {multiline ? (
        <textarea
          className={`block  px-4 py-3 rounded-md  bg-gray-100 focus:bg-white focus:outline-none border-3 ${
            error ? "border-red" : `border-transparent focus:border-${color}`
          } transition-borders ease-in-out duration-200`}
          name={name}
          id={name}
          ref={inputRef}
          placeholder={placeholder}
          defaultValue={defaultValue}
          rows={rows}
          autoFocus={autoFocus}
          {...inputProps}
        />
      ) : (
        <div
          className={`relative flex rounded-md  bg-gray-100 border-3
            ${hasFocus ? "bg-white" : ""}
            ${error ? "border-red" : "border-transparent"}
            ${hasFocus && !error ? `border-${color}` : ""}
          `}
        >
          {startAdornment && (
            <label
              htmlFor={name}
              className="ml-4 flex items-center text-gray-500"
            >
              {startAdornment}
            </label>
          )}
          <input
            className={`block  w-full px-4 py-3 focus:outline-none transition-borders ease-in-out duration-200
              ${size === "large" ? "text-xl" : ""}
              ${startAdornment ? "pl-1" : ""}
              ${endAdornment ? "pr-1" : ""}
            `}
            name={name}
            id={name}
            ref={inputRef}
            placeholder={placeholder}
            defaultValue={defaultValue}
            autoFocus={autoFocus}
            {...inputProps}
            onFocus={(e) => {
              setHasFocus(true);
              inputProps?.onFocus?.(e);
            }}
            onBlur={(e) => {
              setHasFocus(false);
              inputProps?.onBlur?.(e);
            }}
          />
          {endAdornment && (
            <label
              htmlFor={name}
              className="mr-4 flex items-center text-gray-500"
            >
              {endAdornment}
            </label>
          )}
        </div>
      )}
      {error && (
        <span className="text-red px-4 py-1 text-xs font-medium">
          {helperText}
        </span>
      )}
    </div>
  );
};

export default TextField;
