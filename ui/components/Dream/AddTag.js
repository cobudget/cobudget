import React, { useState } from "react";
import { useMutation, gql } from "urql";

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
  const [, addTag] = useMutation(ADD_TAG_MUTATION);
  const [input, setInput] = useState("");
  return (
    <Downshift
      onChange={(tag) => {
        if (!tag) return;
        const variables = tag.id ? { tagId: tag.id } : { tagValue: tag.value };

        addTag({
          dreamId: dream.id,
          ...variables,
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
              className=""
              //style={{ display: "inline-block" }}
              {...getRootProps({}, { suppressRefError: true })}
            >
              <input
                {...getInputProps({ onFocus: openMenu })}
                className="bg-gray-100 px-3 py-2 rounded w-full"
                placeholder="Add tag"
                onBlur={() => {
                  clearSelection();
                }}
              />
            </div>

            {isOpen && filtered.length ? (
              <ul {...getMenuProps()} className="shadow rounded p-1">
                {filtered.map((item, index) => (
                  <li
                    key={item.value}
                    {...getItemProps({
                      key: item.value,
                      index,
                      item,
                    })}
                    className={
                      "rounded px-2 py-1 " +
                      (highlightedIndex === index ? "bg-gray-100" : "")
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
