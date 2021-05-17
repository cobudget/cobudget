import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Button, TextField } from "@material-ui/core";

const Wrapper = styled.div`
  margin: 0.5rem 0;
`;

const ListForm = ({
  inputName,
  placeholder,
  value,
  handleChange,
  handleBlur,
  handleSubmit,
  isSubmitting,
}) => (
  <Wrapper>
    <form onSubmit={handleSubmit} className="flex" data-cy="list-form">
      <TextField
        name={inputName}
        variant="outlined"
        size="small"
        autoFocus
        placeholder={placeholder}
        value={value}
        disabled={isSubmitting}
        onChange={handleChange}
        onBlur={handleBlur}
        data-cy="list-form-name-input"
      />
      <Button type="submit" disabled={!value || isSubmitting}>
        Save
      </Button>
    </form>
  </Wrapper>
);

ListForm.propTypes = {
  inputName: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  handleChange: PropTypes.func,
  handleBlur: PropTypes.func,
  handleSubmit: PropTypes.func,
  isSubmitting: PropTypes.bool,
};

ListForm.defaultProps = {
  inputName: "",
  placeholder: "Enter text...",
  value: "",
  handleChange: () => null,
  handleBlur: () => null,
  handleSubmit: () => null,
  isSubmitting: false,
};

export default ListForm;
