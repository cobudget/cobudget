import { useRef, useState } from "react";
import type { RowImages } from "utils/bucketImport/images";

export type UnassignedFile = {
  id: string;
  file: File;
  reason: "unmatched" | "multiple-rows" | "multiple-files" | "row-has-image";
  candidates: number[];
};

type RowInfo = { rowNumber: number; title: string; referenceCode: string };

const reasonText = (u: UnassignedFile, label: (n: number) => string) => {
  const c = u.candidates.map(label).join(", ");
  switch (u.reason) {
    case "unmatched":
      return "No row matches this file name.";
    case "multiple-rows":
      return `Matches more than one row: ${c}.`;
    case "multiple-files":
      return `Another file in this batch also matches ${c}.`;
    case "row-has-image":
      return `${c} already has an image.`;
  }
};

const rowLabel = (r: RowInfo) =>
  `#${r.rowNumber} ${r.referenceCode ? `[${r.referenceCode}] ` : ""}${
    r.title || "(no title)"
  }`;

// Batch upload: drop many files, matching by reference code, then title slug,
// then order number. Everything the matcher is unsure about is listed here for
// a manual decision; assigned images can be moved or cleared.
const BatchImages = ({
  rows,
  images,
  unassigned,
  onFiles,
  onAssign,
  onDiscard,
  onMove,
  onClear,
}: {
  rows: RowInfo[];
  images: RowImages;
  unassigned: UnassignedFile[];
  onFiles: (files: File[]) => void;
  onAssign: (fileId: string, rowNumber: number) => void;
  onDiscard: (fileId: string) => void;
  onMove: (from: number, to: number) => void;
  onClear: (rowNumber: number) => void;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const byNumber = new Map(rows.map((r) => [r.rowNumber, r]));
  const label = (n: number) => {
    const r = byNumber.get(n);
    return r ? rowLabel(r) : `#${n}`;
  };
  const hasUploaded = (n: number) => {
    const s = images[n]?.status;
    return s === "done" || s === "uploading";
  };
  const withImage = rows.filter((r) => images[r.rowNumber]);
  const withoutImage = rows.filter((r) => !hasUploaded(r.rowNumber));

  // A render helper, not a component: a component defined here would remount
  // (and close an open <select>) on every render.
  const rowSelect = (
    placeholder: string,
    onPick: (n: number) => void,
    disabledWhen?: (n: number) => boolean
  ) => (
    <select
      className="border border-gray-300 rounded px-1 py-0.5 text-sm bg-white"
      value=""
      onChange={(e) => e.target.value && onPick(Number(e.target.value))}
    >
      <option value="">{placeholder}</option>
      {rows.map((r) => (
        <option
          key={r.rowNumber}
          value={r.rowNumber}
          disabled={disabledWhen?.(r.rowNumber)}
        >
          {rowLabel(r)}
          {hasUploaded(r.rowNumber) ? " (has image)" : ""}
        </option>
      ))}
    </select>
  );

  return (
    <div className="border rounded p-4 space-y-3">
      <h3 className="font-semibold">Images</h3>
      <p className="text-sm text-gray-700">
        Drop many images at once. A file is matched to a row by its name
        (without the extension, ignoring case): first the reference code (
        <span className="font-mono">GF01.jpg</span>), then the title (
        <span className="font-mono">community-garden.png</span>), then the row
        number (<span className="font-mono">7.jpg</span>). Anything unclear is
        listed below for you to decide. You can also attach an image to a single
        row in the table.
      </p>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      <div
        role="button"
        tabIndex={0}
        className={`border-2 border-dashed rounded p-6 text-center text-sm cursor-pointer ${
          dragging ? "border-gray-700 bg-gray-50" : "border-gray-300"
        }`}
        onClick={() => ref.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && ref.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onFiles(
            Array.from(e.dataTransfer.files).filter((f) =>
              f.type.startsWith("image/")
            )
          );
        }}
      >
        Drop images here, or click to choose files
      </div>

      {unassigned.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-yellow-900">
            {unassigned.length} file{unassigned.length === 1 ? "" : "s"} not
            assigned
          </h4>
          {unassigned.map((u) => (
            <div
              key={u.id}
              className="flex flex-wrap items-center gap-2 text-sm bg-yellow-50 rounded px-2 py-1"
            >
              <span className="font-mono">{u.file.name}</span>
              <span className="text-yellow-900">{reasonText(u, label)}</span>
              <span className="ml-auto flex items-center gap-2">
                {rowSelect("Assign to row…", (n) => onAssign(u.id, n))}
                <button
                  type="button"
                  className="underline text-gray-700"
                  onClick={() => onDiscard(u.id)}
                >
                  Discard
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="text-sm">
        <span className="font-medium">
          {withoutImage.length} of {rows.length} rows without an uploaded image
        </span>
        {withoutImage.length > 0 && (
          <span className="text-gray-700">
            {" "}
            (a warning, not an error; a row keeps its image_url cell if it has
            one):{" "}
            {withoutImage
              .slice(0, 12)
              .map((r) => `#${r.rowNumber}`)
              .join(", ")}
            {withoutImage.length > 12 ? ", …" : ""}
          </span>
        )}
      </div>

      {withImage.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm font-medium">
            Assigned images ({withImage.length}): move or clear
          </summary>
          <div className="mt-2 space-y-1">
            {withImage.map((r) => {
              const img = images[r.rowNumber];
              return (
                <div
                  key={r.rowNumber}
                  className="flex flex-wrap items-center gap-2 text-sm"
                >
                  <span className="font-mono">{img.fileName}</span>
                  <span className="text-gray-600">→ {rowLabel(r)}</span>
                  {img.status === "uploading" && (
                    <span className="text-gray-600">uploading…</span>
                  )}
                  {img.status === "error" && (
                    <span className="text-red-700">failed: {img.error}</span>
                  )}
                  <span className="ml-auto flex items-center gap-2">
                    {img.status === "done" &&
                      rowSelect(
                        "Move to row…",
                        (n) => onMove(r.rowNumber, n),
                        (n) => hasUploaded(n)
                      )}
                    {img.status !== "uploading" && (
                      <button
                        type="button"
                        className="underline text-gray-700"
                        onClick={() => onClear(r.rowNumber)}
                      >
                        {img.status === "error" ? "Dismiss" : "Clear"}
                      </button>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
};

export default BatchImages;
