import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";

import Downshift from "downshift";

const ADD_TAG_MUTATION = gql`
  mutation AddTag($dreamId: ID!, $tagId: ID, $tagValue: String) {
    addTag(dreamId: $dreamId, tagId: $tagId, tagValue: $tagValue) {
      id
      tags {
        id
        value
      }
    }
  }
`;

const AddTag = ({ items: eventTags, dream }) => {
  const [addTag] = useMutation(ADD_TAG_MUTATION);
  const [input, setInput] = useState("");
  return (
    <Downshift
      onChange={(tag) => {
        if (!tag) return;
        const variables = tag.id ? { tagId: tag.id } : { tagValue: tag.value };

        addTag({
          variables: { dreamId: dream.id, ...variables },
        }).then(() => setInput(""));
      }}
      onInputValueChange={(value) => setInput(value)}
      inputValue={input}
      itemToString={(item) => (item ? item.value : "")}
    >
      {({
        getInputProps,
        getItemProps,
        getMenuProps,
        isOpen,
        inputValue,
        highlightedIndex,
        selectedItem,
        getRootProps,
        openMenu,
        clearSelection,
      }) => {
        let filtered = eventTags
          .filter((tag) => !dream.tags.map((t) => t.id).includes(tag.id))
          .filter(
            (item) =>
              !inputValue ||
              item.value.toLowerCase().includes(inputValue.toLowerCase())
          );

        const inputValueAlreadyDefined = filtered.reduce(
          (previous, current) => previous + (current.value === inputValue),
          false
        );

        if (inputValue.length && !inputValueAlreadyDefined) {
          filtered = [{ value: inputValue }, ...filtered];
        }

        return (
          <div>
            {/* <label {...getLabelProps()}>Add a tag</label> */}
            <div
              style={{ display: "inline-block" }}
              {...getRootProps({}, { suppressRefError: true })}
            >
              <input
                {...getInputProps({ onFocus: openMenu })}
                className="bg-gray-100 px-2 py-1"
                placeholder="Add tag"
                onBlur={() => {
                  clearSelection();
                }}
              />
            </div>

            {isOpen ? (
              <ul {...getMenuProps()} className="shadow rounded p-1">
                {filtered.map((item, index) => (
                  <li
                    key={item.value}
                    {...getItemProps({
                      key: item.value,
                      index,
                      item,
                      style: {
                        fontWeight: selectedItem === item ? "bold" : "normal",
                      },
                    })}
                    className={
                      "rounded px-1 " +
                      (highlightedIndex === index ? "bg-gray-200" : "")
                    }
                  >
                    {item.value}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      }}
    </Downshift>
  );
};

export default AddTag;
