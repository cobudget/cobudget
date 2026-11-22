import { Modal } from "@material-ui/core";
import Button from "components/Button";

// Asks before an entry is dropped from the import: one stray click would
// otherwise lose the entry together with its edits and image.
const RemoveEntryModal = ({
  rowNumber,
  title,
  onConfirm,
  onCancel,
}: {
  rowNumber: number;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <Modal
    open
    onClose={onCancel}
    className="flex items-center justify-center p-4"
  >
    <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-md space-y-4">
      <h2 className="text-xl font-semibold">Remove entry {rowNumber}?</h2>
      <p className="text-sm">
        {title ? `"${title}" ` : "This entry "}
        will not be imported, and its edits and image are discarded. Your CSV
        file is not changed.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <button
          type="button"
          className="font-medium rounded-md px-5 py-2 text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring"
          onClick={onConfirm}
        >
          Remove entry
        </button>
      </div>
    </div>
  </Modal>
);

export default RemoveEntryModal;
