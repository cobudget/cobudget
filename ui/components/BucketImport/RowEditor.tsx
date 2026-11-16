import { baseColumns, budgetColumnPattern } from "utils/bucketImport/config";
import type { Prepared } from "utils/bucketImport/prepareImport";
import type { RowImage } from "utils/bucketImport/images";
import ImageControl from "./ImageControl";

const inputClass =
  "w-full border border-gray-300 rounded px-2 py-1 bg-white text-gray-900";

// Everything the table does not show: the long-text custom fields and every
// budget line (any number of pairs). Same edit path as the table cells.
const RowEditor = ({
  row,
  budgetNumbers,
  hasColumn,
  onEdit,
  image,
  onAttachImage,
  onClearImage,
}: {
  row: Prepared["rows"][number];
  budgetNumbers: number[];
  hasColumn: (column: string) => boolean;
  onEdit: (rowNumber: number, column: string, value: string) => void;
  image?: RowImage;
  onAttachImage: (file: File) => void;
  onClearImage: () => void;
}) => {
  const shownInTable = [
    "proposal_title",
    "proposal_summary",
    "reference_code",
    "priority_area",
    "image_url",
  ];
  const fieldColumns = baseColumns.filter(
    (c) =>
      c.target === "field" &&
      !shownInTable.includes(c.column) &&
      hasColumn(c.column)
  );
  const msgs = (col: string) =>
    row.issues.filter((i) => i.column === col).map((i) => i.message);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-sm">Image</h4>
        <ImageControl
          thumb={row.payload.images?.[0]?.small ?? null}
          image={image}
          onAttach={onAttachImage}
          onClear={onClearImage}
        />
        {msgs("image_url").map((m) => (
          <span key={m} className="text-xs block text-yellow-800">
            {m}
          </span>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {fieldColumns.map((c) => (
          <label key={c.column} className="block text-sm">
            <span className="font-medium">{c.fieldName}</span>{" "}
            <span className="font-mono text-xs text-gray-500">{c.column}</span>
            <textarea
              className={inputClass}
              rows={c.description.includes("Markdown") ? 4 : 1}
              value={row.cells[c.column] ?? ""}
              onChange={(e) => onEdit(row.rowNumber, c.column, e.target.value)}
            />
            {msgs(c.column).map((m) => (
              <span key={m} className="text-red-700 text-xs block">
                {m}
              </span>
            ))}
          </label>
        ))}
      </div>

      <div>
        <h4 className="font-medium text-sm mb-1">Budget lines</h4>
        <div className="grid grid-cols-[1fr_8rem] gap-x-2 gap-y-1 text-sm">
          {budgetNumbers.map((n) => {
            const item = `budget_item_${n}`;
            const amount = `budget_amount_${n}`;
            if (!hasColumn(item) || !hasColumn(amount)) return null;
            const bad = msgs(item).concat(msgs(amount));
            return (
              <div key={n} className="contents">
                <input
                  className={`${inputClass} ${bad.length ? "bg-red-100" : ""}`}
                  placeholder={`Item ${n}`}
                  value={row.cells[item] ?? ""}
                  onChange={(e) => onEdit(row.rowNumber, item, e.target.value)}
                  title={bad.join("\n") || undefined}
                />
                <input
                  className={`${inputClass} text-right ${
                    bad.length ? "bg-red-100" : ""
                  }`}
                  placeholder="Amount"
                  value={row.cells[amount] ?? ""}
                  onChange={(e) =>
                    onEdit(row.rowNumber, amount, e.target.value)
                  }
                  title={bad.join("\n") || undefined}
                />
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Columns matching {String(budgetColumnPattern.item.source)} /{" "}
          {String(budgetColumnPattern.amount.source)}. Blank pairs are ignored.
        </p>
      </div>
    </div>
  );
};

export default RowEditor;
