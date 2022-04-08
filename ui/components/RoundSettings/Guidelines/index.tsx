import { useState } from "react";

import Button from "components/Button";
import { AddIcon } from "components/Icons";

import AddOrEditGuideline from "./EditGuideline";
import DraggableGuidelines from "./DraggableGuidelines";

const Guidelines = ({ round }) => {
  const [addGuidelineModalOpen, setAddGuidelineModalOpen] = useState(false);
  const [editingGuideline, setEditingGuideline] = useState(undefined);

  return (
    <div className="px-6">
      <h1 className="text-2xl font-semibold mb-2">Guidelines</h1>
      <p className="text-gray-700 mb-4">
        Set up the guidelines that {process.env.BUCKET_NAME_PLURAL} should
        follow.
      </p>

      <DraggableGuidelines
        round={round}
        items={round.guidelines}
        setEditingItem={setEditingGuideline}
      />

      <div className="flex my-2">
        <Button
          variant="secondary"
          color={round.color}
          onClick={() => setAddGuidelineModalOpen(true)}
          className="flex-grow"
        >
          <AddIcon className="h-5 w-5 mr-1" /> Add guideline
        </Button>
      </div>
      {(addGuidelineModalOpen || editingGuideline) && (
        <AddOrEditGuideline
          round={round}
          guideline={editingGuideline}
          handleClose={() => {
            setAddGuidelineModalOpen(false);
            setEditingGuideline(undefined);
          }}
        />
      )}
    </div>
  );
};

export default Guidelines;
