import { useState } from "react";

import Button from "components/Button";
import { AddIcon } from "components/Icons";

import AddOrEditGuideline from "./EditGuideline";
import DraggableGuidelines from "./DraggableGuidelines";
import { FormattedMessage } from "react-intl";

const Guidelines = ({ round }) => {
  const [addGuidelineModalOpen, setAddGuidelineModalOpen] = useState(false);
  const [editingGuideline, setEditingGuideline] = useState(undefined);

  return (
    <div className="px-6">
      <h1 className="text-2xl font-semibold mb-2">
        <FormattedMessage defaultMessage="Guidelines" />
      </h1>
      <p className="text-gray-700 mb-4">
        <FormattedMessage
          defaultMessage="Set up the guidelines that {bucketName} should follow."
          values={{
            bucketName: process.env.BUCKET_NAME_PLURAL,
          }}
        />
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
          testid="add-guideline-button"
        >
          <AddIcon className="h-5 w-5 mr-1" />
          <FormattedMessage defaultMessage="Add guideline" />
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
