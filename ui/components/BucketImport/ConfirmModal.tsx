import { Modal } from "@material-ui/core";
import Button from "components/Button";
import FormattedCurrency from "components/FormattedCurrency";

export type UploadFailure = {
  rowNumber: number;
  title: string;
  fileName: string;
  message: string;
};

// Last stop before anything is written. While `submitting` it shows the
// progress (images are uploaded first, then the buckets are created in one
// all-or-nothing step) and both buttons are disabled (double-submit guard;
// the server also serialises imports per round and re-checks the unique
// values, so a second request cannot create duplicates).
const ConfirmModal = ({
  total,
  warningRows,
  totalAsk,
  currency,
  submitting,
  phase,
  progress,
  failures,
  error,
  onConfirm,
  onCancel,
}: {
  total: number;
  warningRows: number;
  totalAsk: number;
  currency: string;
  submitting: boolean;
  phase: "idle" | "images" | "import";
  progress: { done: number; total: number };
  failures: UploadFailure[];
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const pct = progress.total
    ? Math.round((progress.done / progress.total) * 100)
    : 0;
  return (
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
            Buckets are published and open for funding immediately, you are
            listed as cocreator, and no notification emails are sent.
          </li>
          <li>
            Images are uploaded first, then all buckets are created in one step.
            If anything fails, no buckets are created.
          </li>
          {warningRows > 0 && (
            <li>
              {warningRows} {warningRows === 1 ? "entry has" : "entries have"}{" "}
              warnings that you chose to accept.
            </li>
          )}
        </ul>

        {submitting && (
          <div className="space-y-2" role="status" aria-live="polite">
            <p className="text-sm font-medium">
              {phase === "images"
                ? `Uploading images: ${progress.done} of ${progress.total}`
                : "Creating the buckets…"}
            </p>
            <div className="h-2 rounded bg-gray-200 overflow-hidden">
              <div
                className={`h-2 bg-anthracit ${
                  phase === "import" ? "animate-pulse" : ""
                }`}
                style={{
                  width: phase === "import" ? "100%" : `${pct}%`,
                  transition: "width 200ms",
                }}
              />
            </div>
            <p className="text-sm text-gray-700">
              Please keep this window open until it finishes.
            </p>
          </div>
        )}

        {failures.length > 0 && (
          <div
            role="alert"
            className="bg-red-100 text-red-900 rounded p-3 text-sm space-y-1"
          >
            <p className="font-medium">
              {failures.length} image{failures.length === 1 ? "" : "s"} could
              not be uploaded. Nothing was imported.
            </p>
            <ul className="list-disc ml-5">
              {failures.map((f) => (
                <li key={f.rowNumber}>
                  Entry {f.rowNumber}
                  {f.title ? ` (${f.title})` : ""} · {f.fileName}: {f.message}
                </li>
              ))}
            </ul>
            <p>Retry, or cancel to replace those images first.</p>
          </div>
        )}
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
          <Button
            loading={submitting}
            disabled={submitting}
            onClick={onConfirm}
          >
            {failures.length || error ? "Retry" : "Import now"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
