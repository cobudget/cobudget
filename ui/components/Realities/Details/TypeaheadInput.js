import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Downshift from "downshift";
import { TextField } from "@material-ui/core";
import TypeaheadResultsContainer from "./TypeaheadResultsContainer";

const Wrapper = styled.span`
  display: block;
  position: relative;
`;

const TypeaheadInput = ({
  label,
  name,
  id,
  placeholder,
  selectedItem,
  itemToString,
  itemToResult,
  searchQuery,
  queryDataToResultsArray,
  disabled,
  onChange,
  onBlur,
  invalid,
  autoFocus,
}) => (
  <Downshift
    selectedItem={selectedItem}
    onChange={onChange}
    itemToString={itemToString}
  >
    {({
      getRootProps,
      getInputProps,
      getMenuProps,
      getItemProps,
      inputValue,
      highlightedIndex,
      isOpen,
      clearSelection,
    }) => (
      <Wrapper {...getRootProps({ refKey: "innerRef" })}>
        <TextField
          label={label}
          variant="outlined"
          fullWidth
          {...getInputProps({
            name,
            id,
            placeholder,
            disabled,
            autoFocus,
            onBlur: (e) => {
              if (!inputValue) clearSelection();
              onBlur(e);
            },
            invalid,
          })}
        />
        {isOpen && (
          <TypeaheadResultsContainer
            {...{
              inputValue,
              getMenuProps,
              getItemProps,
              highlightedIndex,
              itemToResult: itemToResult || itemToString,
              searchQuery,
              queryDataToResultsArray,
            }}
          />
        )}
      </Wrapper>
    )}
  </Downshift>
);

TypeaheadInput.propTypes = {
  name: PropTypes.string,
  id: PropTypes.string,
  placeholder: PropTypes.string,
  selectedItem: PropTypes.shape({
    nodeId: PropTypes.string,
  }),
  itemToString: PropTypes.func,
  itemToResult: PropTypes.func,
  searchQuery: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  queryDataToResultsArray: PropTypes.func,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  invalid: PropTypes.bool,
  autoFocus: PropTypes.bool,
};

TypeaheadInput.defaultProps = {
  name: "",
  id: "",
  placeholder: "",
  selectedItem: null,
  itemToString: () => "",
  itemToResult: null,
  searchQuery: {},
  queryDataToResultsArray: () => [],
  disabled: false,
  onChange: () => null,
  onBlur: () => null,
  invalid: false,
  autoFocus: false,
};

export default TypeaheadInput;
