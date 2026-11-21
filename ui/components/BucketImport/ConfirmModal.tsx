import { Modal } from "@material-ui/core";
import Button from "components/Button";
import FormattedCurrency from "components/FormattedCurrency";

// Last stop before anything is written. `submitting` disables both buttons
// (double-submit guard); the server also serialises imports per round and
// re-checks reference codes, so a second request cannot create duplicates.
const ConfirmModal = ({
  total,
  warningRows,
  totalAsk,
  currency,
  submitting,
  error,
  onConfirm,
  onCancel,
}: {
  total: number;
  warningRows: number;
  totalAsk: number;
  currency: string;
  submitting: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <Modal
    open
    onClose={submitting ? undefined : onCancel}
    className="flex items-center justify-center p-4"
  >
    <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-sm max-h-screen overflow-auto space-y-4">
      <h2 className="text-xl font-semibold">
        Import {total} bucket{total === 1 ? "" : "s"}?
      </h2>
      <ul className="list-disc ml-5 text-sm space-y-1">
        <li>
          Total ask across all buckets:{" "}
          <FormattedCurrency value={totalAsk} currency={currency} />
        </li>
        <li>
          Buckets are published and open for funding immediately, you are listed
          as cocreator, and no notification emails are sent.
        </li>
        <li>All or nothing: if anything fails, no buckets are created.</li>
        {warningRows > 0 && (
          <li>{warningRows} rows have warnings that you chose to accept.</li>
        )}
      </ul>
      {error && (
        <div
          role="alert"
          className="bg-red-100 text-red-900 rounded p-3 text-sm whitespace-pre-wrap"
        >
          {error}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" disabled={submitting} onClick={onCancel}>
          Cancel
        </Button>
        <Button loading={submitting} disabled={submitting} onClick={onConfirm}>
          Import now
        </Button>
      </div>
    </div>
  </Modal>
);

export default ConfirmModal;
