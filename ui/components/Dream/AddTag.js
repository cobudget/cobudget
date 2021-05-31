import React from "react";
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

const AddTag = ({ items, dream }) => {
  const [addTag] = useMutation(ADD_TAG_MUTATION);

  return (
    <Downshift
      onChange={(tag) => {
        const variables = tag.id ? { tagId: tag.id } : { tagValue: tag.value };
        console.log({ tag, variables });
        addTag({
          variables: { dreamId: dream.id, ...variables },
        }).then((data) => console.log("Yooo!", data));
      }}
      itemToString={(item) => (item ? item.value : "")}
    >
      {({
        getInputProps,
        getItemProps,
        getLabelProps,
        getMenuProps,
        isOpen,
        inputValue,
        highlightedIndex,
        selectedItem,
        getRootProps,
        openMenu,
      }) => {
        let filtered = items.filter(
          (item) =>
            !inputValue ||
            item.value.toLowerCase().includes(inputValue.toLowerCase())
        );
        if (filtered.length === 0) {
          filtered = [{ value: inputValue }];
        }

        return (
          <div>
            <label {...getLabelProps()}>Add a tag</label>
            <div
              style={{ display: "inline-block" }}
              {...getRootProps({}, { suppressRefError: true })}
            >
              <input {...getInputProps({ onFocus: openMenu })} />
            </div>
            <ul {...getMenuProps()}>
              {isOpen
                ? filtered.map((item, index) => (
                    <li
                      key={item.value}
                      {...getItemProps({
                        key: item.value,
                        index,
                        item,
                        style: {
                          backgroundColor:
                            highlightedIndex === index ? "lightgray" : "white",
                          fontWeight: selectedItem === item ? "bold" : "normal",
                        },
                      })}
                    >
                      {item.value}
                    </li>
                  ))
                : null}
            </ul>
          </div>
        );
      }}
    </Downshift>
  );
};

export default AddTag;
