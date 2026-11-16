import FormattedCurrency from "components/FormattedCurrency";
import type { Prepared, PreparedIssue } from "utils/bucketImport/prepareImport";

const tone = (issues: PreparedIssue[]) =>
  issues.some((i) => i.severity === "error")
    ? "bg-red-100"
    : issues.length
    ? "bg-yellow-100"
    : "";

const inputClass =
  "w-full border border-gray-300 rounded px-1 py-0.5 bg-white text-gray-900";

type Row = Prepared["rows"][number];

// One editable cell: highlighted by its issues, explanation on hover and in
// the Messages column. Edits revalidate live (the whole import re-runs; it is
// a few dozen rows).
const EditableCell = ({
  row,
  column,
  editable,
  multiline,
  options,
  onEdit,
  className = "",
}: {
  row: Row;
  column: string;
  editable: boolean;
  multiline?: boolean;
  options?: string[];
  onEdit: (rowNumber: number, column: string, value: string) => void;
  className?: string;
}) => {
  const issues = row.issues.filter((i) => i.column === column);
  const value = row.cells[column] ?? "";
  const change = (v: string) => onEdit(row.rowNumber, column, v);
  return (
    <td
      className={`px-2 py-1 align-top border-b ${tone(issues)} ${className}`}
      title={issues.map((i) => i.message).join("\n") || undefined}
    >
      {!editable ? (
        <span className="text-gray-500">–</span>
      ) : options?.length ? (
        <select
          className={inputClass}
          value={value}
          onChange={(e) => change(e.target.value)}
        >
          <option value="" />
          {/* keep an invalid value visible so it can be seen and replaced */}
          {value && !options.includes(value) && (
            <option value={value}>{value}</option>
          )}
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          className={inputClass}
          rows={2}
          value={value}
          onChange={(e) => change(e.target.value)}
        />
      ) : (
        <input
          className={inputClass}
          value={value}
          onChange={(e) => change(e.target.value)}
        />
      )}
    </td>
  );
};

const PreviewTable = ({
  prepared,
  currency,
  priorityOptions,
  hasColumn,
  onlyNeedsAttention,
  selected,
  onSelect,
  onEdit,
  onRemove,
}: {
  prepared: Prepared;
  currency: string;
  priorityOptions: string[];
  hasColumn: (column: string) => boolean;
  onlyNeedsAttention: boolean;
  selected: number | null;
  onSelect: (rowNumber: number) => void;
  onEdit: (rowNumber: number, column: string, value: string) => void;
  onRemove: (rowNumber: number) => void;
}) => {
  const rows = prepared.rows.filter(
    (r) => !onlyNeedsAttention || r.issues.length > 0
  );

  return (
    <div className="overflow-auto max-h-screen border rounded">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-gray-100 text-left z-10">
          <tr>
            {[
              "#",
              "Status",
              "Title",
              "Summary",
              "Ref. code",
              "Priority area",
              "Image URL",
              "Total ask",
              "Messages",
              "",
            ].map((h) => (
              <th key={h} className="px-2 py-2 border-b font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const hasError = r.issues.some((i) => i.severity === "error");
            const isSelected = selected === r.rowNumber;
            return (
              <tr
                key={r.rowNumber}
                className={isSelected ? "outline-black bg-gray-50" : ""}
                onClick={() => onSelect(r.rowNumber)}
              >
                <td className="px-2 py-1 align-top border-b text-gray-600">
                  {r.rowNumber}
                </td>
                <td className="px-2 py-1 align-top border-b whitespace-nowrap">
                  {hasError ? "Error" : r.issues.length ? "Warning" : "OK"}
                </td>
                <EditableCell
                  row={r}
                  column="proposal_title"
                  editable={hasColumn("proposal_title")}
                  onEdit={onEdit}
                  className="min-w-48"
                />
                <EditableCell
                  row={r}
                  column="proposal_summary"
                  editable={hasColumn("proposal_summary")}
                  multiline
                  onEdit={onEdit}
                  className="min-w-64"
                />
                <EditableCell
                  row={r}
                  column="reference_code"
                  editable={hasColumn("reference_code")}
                  onEdit={onEdit}
                  className="min-w-28"
                />
                <EditableCell
                  row={r}
                  column="priority_area"
                  editable={hasColumn("priority_area")}
                  options={priorityOptions}
                  onEdit={onEdit}
                  className="min-w-40"
                />
                <EditableCell
                  row={r}
                  column="image_url"
                  editable={hasColumn("image_url")}
                  onEdit={onEdit}
                  className="min-w-40"
                />
                <td
                  className={`px-2 py-1 align-top border-b whitespace-nowrap text-right ${tone(
                    r.issues.filter((i) => i.column?.startsWith("budget_"))
                  )}`}
                >
                  <FormattedCurrency value={r.totalMinor} currency={currency} />
                  <div className="text-xs text-gray-600">
                    {r.payload.budgetItems.length} items
                  </div>
                </td>
                <td className="px-2 py-1 align-top border-b min-w-64">
                  {r.issues.map((i, k) => (
                    <div
                      key={k}
                      className={
                        i.severity === "error"
                          ? "text-red-700"
                          : "text-yellow-800"
                      }
                    >
                      {i.severity === "error" ? "✕" : "!"}{" "}
                      {i.column ? (
                        <span className="font-mono">{i.column}: </span>
                      ) : null}
                      {i.message}
                    </div>
                  ))}
                </td>
                <td className="px-2 py-1 align-top border-b">
                  <button
                    type="button"
                    className="text-gray-600 hover:text-red-700 whitespace-nowrap"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(r.rowNumber);
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PreviewTable;
