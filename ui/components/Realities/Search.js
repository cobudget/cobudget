import React from "react";
import styled from "styled-components";
import Downshift from "downshift";
import { useRouter } from "next/router";
import SearchBar from "./SearchBar";
import SearchResultsContainer from "./SearchResultsContainer";

const Wrapper = styled.div`
  position: relative;
`;

const Search = () => {
  const router = useRouter();

  return (
    <Downshift
      id="search"
      onChange={(node, { reset, clearSelection }) => {
        clearSelection();
        reset();
        if (node) {
          switch (node.__typename) {
            case "Need":
              router.push(`/realities/need/${node.nodeId}`);
              break;
            case "Responsibility":
              router.push(`/realities/${node.nodeId}`);
              break;
            case "Person":
              //TODO: this isn't a page
              router.push(`/realities/profile/${node.nodeId}`);
              break;
            default:
              router.push(`/realities`);
          }
        }
      }}
      itemToString={(i) => (i && i.title) || ""}
    >
      {({
        getRootProps,
        getInputProps,
        getMenuProps,
        getItemProps,
        inputValue,
        highlightedIndex,
        isOpen,
        reset,
      }) => (
        <Wrapper {...getRootProps({ refKey: "innerRef" })}>
          <SearchBar
            onClear={() => reset()}
            {...getInputProps({
              onBlur: (e) => e.preventDefault(),
            })}
          />
          {isOpen && (
            <SearchResultsContainer
              searchTerm={inputValue}
              getMenuProps={getMenuProps}
              getItemProps={getItemProps}
              highlightedIndex={highlightedIndex}
            />
          )}
        </Wrapper>
      )}
    </Downshift>
  );
};

export default Search;
