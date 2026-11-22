import type { Prepared } from "utils/bucketImport/prepareImport";
import type { ImportColumn } from "utils/bucketImport/columns";

const ITEM_REM = 2.75; // fixed item height, so the panel can show 1.5 items

type Item = {
  key: string;
  severity: "error" | "warning";
  rowNumber: number;
  column: string | null;
  where: string;
  message: string;
};

// Everything that needs a decision, errors first. The same "No image yet."
// warning on every row would drown the list, so it is one grouped entry.
const IssuesList = ({
  prepared,
  columns,
  onOpen,
}: {
  prepared: Prepared;
  columns: ImportColumn[];
  onOpen: (rowNumber: number, column: string | null) => void;
}) => {
  const title = (col: string | null) => {
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
        column: i.column,
        where: `Row ${r.rowNumber}${i.column ? ` · ${title(i.column)}` : ""}`,
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
      column: "image",
      where: "Images",
      message:
        noImageCount === 1
          ? "1 row has no image yet."
          : `${noImageCount} rows have no image yet.`,
    });
  }
  if (!items.length) return null;

  const errors = items.filter((i) => i.severity === "error").length;
  const warnings = items.length - errors;
  return (
    <div>
      <div className="text-sm mb-1">
        <span className="font-medium">To review</span>
        <span className="text-gray-600">
          {" "}
          · {errors} {errors === 1 ? "error" : "errors"}, {warnings}{" "}
          {warnings === 1 ? "warning" : "warnings"}. Select one to open it in
          the editor.
        </span>
      </div>
      <div
        className="overflow-y-auto border border-gray-300 rounded"
        style={{ maxHeight: `${ITEM_REM * 1.5}rem` }}
      >
        {items.map((i) => (
          <button
            key={i.key}
            type="button"
            style={{ height: `${ITEM_REM}rem` }}
            className="w-full flex items-center gap-2 px-3 text-left text-sm border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
            title={`${i.where}: ${i.message}`}
            onClick={() => onOpen(i.rowNumber, i.column)}
          >
            <span
              className={`flex-none font-medium ${
                i.severity === "error" ? "text-red-700" : "text-yellow-800"
              }`}
            >
              {i.severity === "error" ? "✕" : "!"}
            </span>
            <span className="flex-none font-medium">{i.where}</span>
            <span className="truncate text-gray-800">{i.message}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default IssuesList;
