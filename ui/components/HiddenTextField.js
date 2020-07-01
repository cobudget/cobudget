const HiddenTextField = ({
  inputRef,
  inputProps,
  name,
  placeholder,
  defaultValue,
}) => {
  return (
    <input
      className={`invisible`}
      name={name}
      id={name}
      ref={inputRef}
      placeholder={placeholder}
      defaultValue={defaultValue}
      type='hidden'
      {...inputProps}
    />
  );
};

export default HiddenTextField;
