import type { Prepared } from "utils/bucketImport/prepareImport";
import type { ImportColumn } from "utils/bucketImport/columns";

type Item = {
  key: string;
  severity: "error" | "warning";
  rowNumber: number | null;
  rowTitle: string;
  column: string | null;
  field: string;
  message: string;
};

const ErrorIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
  </svg>
);
const WarningIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);

// The list view: every error, then every warning, each linked to its row
// (number and title) and field. The same "No image yet." warning on every row
// would drown the list, so it is one grouped entry.
const IssuesList = ({
  prepared,
  columns,
  onOpen,
}: {
  prepared: Prepared;
  columns: ImportColumn[];
  onOpen: (rowNumber: number, column: string | null) => void;
}) => {
  const fieldName = (col: string | null) => {
    if (!col) return "";
    if (col === "image") return "Image";
    if (col.startsWith("budget-")) return "Budget";
    const c = columns.find((x) => x.column === col);
    return !c
      ? col
      : c.target === "title"
      ? "Title"
      : c.target === "summary"
      ? "Summary"
      : c.field.name;
  };

  const items: Item[] = [];
  let noImageFirst = 0;
  let noImageCount = 0;
  for (const r of prepared.rows) {
    r.issues.forEach((i, k) => {
      if (i.column === "image" && i.message === "No image yet.") {
        if (!noImageCount) noImageFirst = r.rowNumber;
        noImageCount += 1;
        return;
      }
      items.push({
        key: `${r.rowNumber}-${k}`,
        severity: i.severity === "error" ? "error" : "warning",
        rowNumber: r.rowNumber,
        rowTitle: r.payload.title,
        column: i.column,
        field: fieldName(i.column),
        message: i.message,
      });
    });
  }
  items.sort(
    (a, b) =>
      Number(a.severity === "warning") - Number(b.severity === "warning")
  );
  if (noImageCount) {
    items.push({
      key: "no-image",
      severity: "warning",
      rowNumber: noImageFirst,
      rowTitle: "",
      column: "image",
      field: "Images",
      message:
        noImageCount === 1
          ? "1 row has no image yet."
          : `${noImageCount} rows have no image yet.`,
    });
  }

  if (!items.length)
    return (
      <p className="text-sm text-green-800 bg-green-50 rounded px-4 py-3">
        Nothing to check: every entry is ready.
      </p>
    );

  const errors = items.filter((i) => i.severity === "error").length;
  const warnings = items.length - errors;

  return (
    <div>
      <p className="text-sm mb-2">
        <span className="font-medium">
          {items.length} {items.length === 1 ? "item" : "items"} to check
        </span>
        <span className="text-gray-600">
          {" "}
          · {errors} {errors === 1 ? "error" : "errors"} · {warnings}{" "}
          {warnings === 1 ? "warning" : "warnings"}. Select one to open it in
          the editor below.
        </span>
      </p>
      <div
        className="border border-gray-300 rounded overflow-y-auto"
        style={{ maxHeight: "28rem" }}
      >
        {items.map((i) => {
          const isError = i.severity === "error";
          return (
            <button
              key={i.key}
              type="button"
              onClick={() =>
                i.rowNumber !== null && onOpen(i.rowNumber, i.column)
              }
              title={`${i.message}`}
              className={`w-full flex items-center gap-2 text-left border-l-4 border-b border-b-gray-200 last:border-b-0 px-3 py-1.5 text-sm focus:outline-none focus:ring ${
                isError
                  ? "bg-red-50 border-l-red-500 hover:bg-red-100"
                  : "bg-yellow-50 border-l-yellow-500 hover:bg-yellow-100"
              }`}
            >
              <span
                className={`flex-none ${
                  isError ? "text-red-700" : "text-yellow-700"
                }`}
              >
                {isError ? <ErrorIcon /> : <WarningIcon />}
                <span className="sr-only">{isError ? "Error" : "Warning"}</span>
              </span>
              <span className="flex-none font-medium text-gray-900">
                {i.field === "Images"
                  ? "Images"
                  : [`Entry ${i.rowNumber}`, i.rowTitle, i.field]
                      .filter(Boolean)
                      .join(" · ")}
              </span>
              <span className="truncate text-gray-700">{i.message}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default IssuesList;
