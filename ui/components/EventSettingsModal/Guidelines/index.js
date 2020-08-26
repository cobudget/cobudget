import gql from "graphql-tag";
import { useState } from "react";
import { useMutation } from "@apollo/react-hooks";

import Button from "components/Button";
import { AddIcon } from "components/Icons";

import AddOrEditGuideline from "./EditGuideline";
import DraggableGuidelines from "./DraggableGuidelines";

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

export default ({ event }) => {
  const [addGuidelineModalOpen, setAddGuidelineModalOpen] = useState(false);
  const [editingGuideline, setEditingGuideline] = useState(undefined);

  const [deleteGuideline, { loading }] = useMutation(
    DELETE_GUIDELINE_MUTATION,
    {
      variables: { eventId: event.id },
    }
  );

  return (
    <>
      <h1 className="text-2xl font-semibold mb-2">Guidelines</h1>
      <p className="text-gray-700 mb-2">
        Set up the guidelines that dreams should follow.
      </p>

      <DraggableGuidelines
        event={event}
        guidelines={event.guidelines}
        setEditingGuideline={setEditingGuideline}
        deleteGuideline={deleteGuideline}
      />

      <div className="flex my-2">
        <Button
          variant="secondary"
          onClick={() => setAddGuidelineModalOpen(true)}
          className="flex-grow"
        >
          <AddIcon className="h-5 w-5 mr-1" /> Add guideline
        </Button>
      </div>
      {(addGuidelineModalOpen || editingGuideline) && (
        <AddOrEditGuideline
          event={event}
          guideline={editingGuideline}
          handleClose={() => {
            setAddGuidelineModalOpen(false);
            setEditingGuideline(undefined);
          }}
        />
      )}
    </>
  );
};
