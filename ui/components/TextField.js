const TextField = ({
  inputRef,
  inputProps,
  name,
  placeholder,
  label,
  defaultValue,
  error,
  helperText,
  className,
  multiline,
  rows,
  size,
  autoFocus,
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm px-4 text-gray-800 mb-1 block">
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          className={`block  px-4 py-3 rounded-md  bg-gray-100 focus:bg-white focus:outline-none border-3 ${
            error ? "border-red" : "border-transparent focus:border-green"
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
        <input
          className={`block  px-4 py-3 rounded-md  bg-gray-100 focus:bg-white focus:outline-none border-3 ${
            (error ? "border-red" : "border-transparent focus:border-green") +
            " " +
            (size === "large" ? "text-xl" : "")
          } transition-borders ease-in-out duration-200`}
          name={name}
          id={name}
          ref={inputRef}
          placeholder={placeholder}
          defaultValue={defaultValue}
          autoFocus={autoFocus}
          {...inputProps}
        />
      )}
      {error && (
        <span className="text-red px-4 py-1 text-xs font-medium">
          {helperText}
        </span>
      )}
      {/* {inputProps?.maxLength && (
            <span className="text-gray-500">
              {inputProps.maxLength} characters left
            </span>
          )} */}
    </div>
  );
};

export default TextField;
