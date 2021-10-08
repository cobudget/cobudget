import "@toast-ui/editor/dist/toastui-editor.css";
import { useRef } from "react";
const Editor =
  typeof window === "undefined" ? (
    <div />
  ) : (
    require("@toast-ui/react-editor").Editor
  );

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
  color = "blue",
  wysiwyg,
}) => {
  const wysiwygRef = useRef();
  const LabelComponent = labelComponent;

  return (
    <div className={`flex flex-col ${className}`}>
      {(label || labelComponent) && (
        <label htmlFor={name} className="text-sm font-medium mb-1 block">
          {label ? label : <LabelComponent />}
        </label>
      )}
      {multiline ? (
        wysiwyg ? (
          typeof window === "undefined" ? (
            <div />
          ) : (
            <Editor
              usageStatistics={false}
              //initialEditType="wysiwyg"
              autoFocus={autoFocus}
              initialValue={defaultValue}
              ref={(el) => {
                wysiwygRef.current = el?.getInstance();
                inputRef?.(el?.getInstance());
              }}
              //events={{
              //  change: (e) => {
              //    console.log("in change with", e);
              //    inputProps?.onChange?.(e);
              //  },
              //}}
              onChange={() => {
                // TODO: debounce, getMarkdown is a heavy function
                console.log("wysiref", wysiwygRef.current);
                inputProps?.onChange?.({
                  target: {
                    value: wysiwygRef.current?.getMarkdown() ?? "",
                  },
                });
              }}
            />
          )
        ) : (
          <textarea
            className={`block  px-4 py-3 rounded-md  bg-gray-100 focus:bg-white focus:outline-none border-3 ${
              error ? "border-red" : `border-transparent focus:border-${color}`
            } transition-colors ease-in-out duration-200`}
            name={name}
            id={name}
            ref={inputRef}
            placeholder={placeholder}
            defaultValue={defaultValue}
            rows={rows}
            autoFocus={autoFocus}
            {...inputProps}
          />
        )
      ) : (
        <div
          className={`relative flex rounded-md border-3 transition-colors ease-in-out duration-200 
            bg-gray-100 focus-within:bg-white 
            ${
              error
                ? "border-red"
                : `border-transparent focus-within:border-${color}`
            }
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
            className={`block w-full px-4 py-3 focus:outline-none transition-colors ease-in-out duration-200 bg-transparent
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
              inputProps?.onFocus?.(e);
            }}
            onBlur={(e) => {
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
