import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from "react-sortable-hoc";
import { makeStyles } from "@material-ui/core";
import ReactMarkdown from "react-markdown";
import { DraggableIcon } from "components/Icons";
import { Tooltip } from "react-tippy";
import IconButton from "components/IconButton";
import { DeleteIcon, EditIcon } from "components/Icons";

const DELETE_GUIDELINE_MUTATION = gql`
  mutation DeleteGuideline($eventId: ID!, $guidelineId: ID!) {
    deleteGuideline(eventId: $eventId, guidelineId: $guidelineId) {
      id
      guidelines {
        id
        title
        description
      }
    }
  }
`;

const SET_GUIDELINE_POSITION_MUTATION = gql`
  mutation SetGuidelinePosition(
    $eventId: ID!
    $guidelineId: ID!
    $newPosition: Float
  ) {
    setGuidelinePosition(
      eventId: $eventId
      guidelineId: $guidelineId
      newPosition: $newPosition
    ) {
      id
      guidelines {
        id
        title
        description
        position
      }
    }
  }
`;

// We need to make sure that the zIndex is bigger the material design
// modal otherwise the component disappear when dragged
export const useStyles = makeStyles((theme) => ({
  sorting: {
    zIndex: theme.zIndex.modal + 100,
  },
}));

const DragHandle = sortableHandle(() => (
  <IconButton className="mx-1 cursor-move">
    <DraggableIcon className="h-6 w-6" />
  </IconButton>
));

const SortableItem = sortableElement(
  ({ guideline, setEditingGuideline, eventId, loading }) => {
    const [deleteGuideline, { loading: deleting }] = useMutation(
      DELETE_GUIDELINE_MUTATION,
      {
        variables: { eventId, guidelineId: guideline.id },
      }
    );

    return (
      <li className="group bg-white p-4 mb-3 rounded shadow list-none">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">{guideline.title}</h2>
          <div>
            <Tooltip title="Edit" position="bottom" size="small">
              <IconButton
                onClick={() => setEditingGuideline(guideline)}
                className="mx-1"
              >
                <EditIcon className="h-6 w-6" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete" position="bottom" size="small">
              <IconButton
                loading={deleting}
                onClick={() =>
                  confirm(
                    "Are you sure you would like to delete this guideline?"
                  ) && deleteGuideline()
                }
              >
                <DeleteIcon className="h-6 w-6" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Drag to reorder" position="bottom" size="small">
              <DragHandle />
            </Tooltip>
          </div>
        </div>
        <ReactMarkdown source={guideline.description} className="markdown" />
      </li>
    );
  }
);

const SortableContainer = sortableContainer(({ children }) => {
  return <ul className="select-none">{children}</ul>;
});

export default ({ event, guidelines, setEditingGuideline }) => {
  // To allow real time dragging changes - we duplicate the list locally
  const [localGuidelines, setLocalGuidelines] = useState(guidelines);

  // This updated the global server custom fields with our local copy
  useEffect(() => {
    // The following prevents two requests from overriding and flickering in the ui
    if (!loading) {
      setLocalGuidelines(guidelines);
    }
  }, [guidelines]);

  const [setGuidelinePosition, { loading }] = useMutation(
    SET_GUIDELINE_POSITION_MUTATION,
    {
      variables: { eventId: event.id },
    }
  );

  const classes = useStyles();

  // Extract the position of the custom fields before and after the new index to calculate the new
  // custom field position (Based on https://softwareengineering.stackexchange.com/a/195317/54663)
  const onSortEnd = ({ oldIndex, newIndex }) => {
    const guideline = localGuidelines[oldIndex];
    let beforePosition;
    let afterPosition;
    let beforeGuideline;

    const afterGuideline = localGuidelines[newIndex];
    if (oldIndex > newIndex) {
      beforeGuideline = localGuidelines[newIndex - 1];
    } else {
      beforeGuideline = localGuidelines[newIndex + 1];
    }
    if (beforeGuideline) {
      beforePosition = beforeGuideline.position;
    } else {
      // Last element
      beforePosition = localGuidelines[localGuidelines.length - 1].position + 1;
    }
    if (newIndex == 0) {
      // First element
      afterPosition = localGuidelines[0].position - 1;
      beforePosition = localGuidelines[0].position;
    } else {
      afterPosition = afterGuideline.position;
    }

    // In order to replace the position locally we must duplicate the custom fields locally
    let guidelinesNew = [...localGuidelines];
    const newPosition = (beforePosition - afterPosition) / 2.0 + afterPosition;
    guideline.position = newPosition;
    setLocalGuidelines(guidelinesNew);

    setGuidelinePosition({
      variables: {
        guidelineId: guideline.id,
        newPosition,
      },
    });
  };

  return (
    <SortableContainer
      onSortEnd={onSortEnd}
      useDragHandle
      helperClass={classes.sorting}
    >
      {localGuidelines
        .sort((a, b) => a.position - b.position)
        .map((guideline, index) => (
          <SortableItem
            key={guideline.id}
            index={index}
            guideline={guideline}
            setEditingGuideline={setEditingGuideline}
            loading={loading}
            eventId={event.id}
          />
        ))}
    </SortableContainer>
  );
};
