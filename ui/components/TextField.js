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
  endAdornment,
  color = "green",
}) => {
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
        <div className="relative">
          <input
            className={`block  w-full px-4 py-3 rounded-md  bg-gray-100 focus:bg-white focus:outline-none border-3 ${
              (error
                ? "border-red"
                : `border-transparent focus:border-${color}`) +
              " " +
              (size === "large" ? "text-xl" : "") +
              " " +
              (endAdornment ? "pr-12" : "")
            } transition-borders ease-in-out duration-200`}
            name={name}
            id={name}
            ref={inputRef}
            placeholder={placeholder}
            defaultValue={defaultValue}
            autoFocus={autoFocus}
            {...inputProps}
          />
          {endAdornment && (
            <span className="absolute mr-4 right-0 top-0 bottom-0 flex items-center text-gray-500">
              {endAdornment}
            </span>
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
