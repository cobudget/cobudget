import { useState } from "react";

import Button from "components/Button";
import { AddIcon } from "components/Icons";
import AddOrEditCustomField from "./AddOrEditCustomField";
import DraggableCustomField from "./DraggableCustomFields";
import capitalize from "utils/capitalize";
import { FormattedMessage, useIntl } from "react-intl";

const CustomFields = ({ round }) => {
  const [addCustomFieldModalOpen, setAddCustomFieldModalOpen] = useState(false);
  const [editingCustomField, setEditingCustomField] = useState(undefined);

  return (
    <div className="px-6">
      <h1 className="text-2xl font-semibold mb-2">
        <FormattedMessage
          defaultMessage="{bucketName} Form"
          values={{
            bucketName: capitalize(process.env.BUCKET_NAME_SINGULAR),
          }}
        />
      </h1>

      <p className="text-gray-700 mb-4">
        <FormattedMessage
          defaultMessage="Customize the form for {bucketName} to fill out."
          values={{
            bucketName: process.env.BUCKET_NAME_PLURAL,
          }}
        />
      </p>

      <DraggableCustomField
        round={round}
        items={round.customFields}
        setEditingItem={setEditingCustomField}
      />

      <div className="flex my-2">
        <Button
          variant="secondary"
          color={round.color}
          onClick={() => setAddCustomFieldModalOpen(true)}
          className="flex-grow"
        >
          <AddIcon className="h-5 w-5 mr-1" />{" "}
          <FormattedMessage defaultMessage="Add form item" />
        </Button>
      </div>
      {(addCustomFieldModalOpen || editingCustomField) && (
        <AddOrEditCustomField
          round={round}
          customField={editingCustomField}
          handleClose={() => {
            setAddCustomFieldModalOpen(false);
            setEditingCustomField(undefined);
          }}
        />
      )}
    </div>
  );
};

export default CustomFields;
