import React from "react";
import PropTypes from "prop-types";
import { TextField } from "@material-ui/core";

const InfoForm = ({
  label,
  inputName,
  placeholder,
  value,
  handleChange,
  handleBlur,
  handleSubmit,
  isSubmitting,
}) => (
  <form onSubmit={handleSubmit}>
    <TextField
      label={label}
      name={inputName}
      variant="outlined"
      fullWidth
      type="input"
      placeholder={placeholder}
      value={value}
      disabled={isSubmitting}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  </form>
);

InfoForm.propTypes = {
  inputName: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  handleChange: PropTypes.func,
  handleBlur: PropTypes.func,
  handleSubmit: PropTypes.func,
  isSubmitting: PropTypes.bool,
};

InfoForm.defaultProps = {
  inputName: "",
  placeholder: "Enter text...",
  value: "",
  handleChange: () => null,
  handleBlur: () => null,
  handleSubmit: () => null,
  isSubmitting: false,
};

export default InfoForm;
