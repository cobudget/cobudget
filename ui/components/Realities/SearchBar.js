import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { FaTimesCircle } from "react-icons/fa";
import { TextField } from "@material-ui/core";
import { useIntl } from "react-intl";

const ClearButton = styled.button`
  background-color: white;
  border-bottom-right-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  border: 1px solid #ced4da;
  color: rgba(0, 0, 0, 0.5);
  font-size: 1.25rem;
  line-height: 1.25rem;
  padding: 0 0.75rem;
  z-index: 1;
  &:hover,
  &:focus {
    outline: none;
    background-color: #f8f8f8;
    color: black;
  }
  &:active {
    background-color: white;
    color: rgba(0, 0, 0, 0.7);
  }
`;

const SearchBar = (props) => {
  const { onClear, ...inputProps } = props;
  const intl = useIntl();
  return (
    <div className="w-2/3 m-auto flex mb-4">
      <TextField
        placeholder={intl.formatMessage({ defaultMessage: "Search" })}
        fullWidth
        variant="outlined"
        {...inputProps}
      />
      <ClearButton
        onClick={(e) => {
          e.preventDefault();
          onClear(e);
        }}
      >
        <FaTimesCircle />
      </ClearButton>
    </div>
  );
};

SearchBar.propTypes = {
  onClear: PropTypes.func,
};

SearchBar.defaultProps = {
  onClear: () => null,
};

export default SearchBar;
