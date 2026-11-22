import { useEffect, useState } from "react";
import { budgetColumnPattern } from "utils/fieldKey";
import type { ImportColumn } from "utils/bucketImport/columns";
import type { Prepared } from "utils/bucketImport/prepareImport";
import type { RowImage } from "utils/bucketImport/images";
import ImageControl from "./ImageControl";

export type FocusRequest = { column: string; nonce: number };

const inputBase = "w-full border rounded px-2 py-1 text-gray-900";

type Issue = Prepared["rows"][number]["issues"][number];

// Same colours as the table cells.
const fieldTone = (issues: Issue[]) =>
  issues.some((i) => i.severity === "error")
    ? "bg-red-100 border-red-300"
    : issues.length
    ? "bg-yellow-100 border-yellow-300"
    : "bg-white border-gray-300";

const fieldId = (column: string) => `import-field-${column}`;

// The one place a row is edited: every column of the file (built-ins, the
// round's fields, budget lines), an image, and removing the row. Edits go
// through the same path as before (raw cells, live revalidation); the table
// is read-only and only points here.
const RowEditor = ({
  row,
  columns,
  budgetNumbers,
  hasColumn,
  onEdit,
  image,
  onAttachImage,
  onClearImage,
  onRemove,
  focus,
  onlyIssues,
  onToggleOnlyIssues,
  onAddBudgetLine,
}: {
  row: Prepared["rows"][number];
  columns: ImportColumn[];
  budgetNumbers: number[];
  hasColumn: (column: string) => boolean;
  onEdit: (rowNumber: number, column: string, value: string) => void;
  image?: RowImage;
  onAttachImage: (file: File) => void;
  onClearImage: () => void;
  onRemove: () => void;
  focus: FocusRequest | null;
  onlyIssues: boolean;
  onToggleOnlyIssues: (v: boolean) => void;
  onAddBudgetLine: () => void;
}) => {
  const issuesOf = (col: string) => row.issues.filter((i) => i.column === col);

  // While "only fields that need attention" is on, a field that stops having
  // an issue because it is being edited must not vanish under the cursor: the
  // field with focus stays until focus leaves it (a budget pair counts as one
  // field). Edits themselves are applied immediately either way.
  // The same goes for the view itself: if the last issue is fixed while a
  // field has focus, the checkbox and the field list stay as they were until
  // focus leaves the field, then it switches.
  const issuesNow = row.issues.length > 0;
  const [active, setActive] = useState<string | null>(null);
  const [frozenHasIssues, setFrozenHasIssues] = useState<boolean | null>(null);
  useEffect(() => {
    setActive(null);
    setFrozenHasIssues(null);
  }, [row.rowNumber]);
  const focusProps = (key: string) => ({
    onFocus: () => {
      setActive(key);
      setFrozenHasIssues((f) => f ?? issuesNow);
    },
    onBlur: (e: React.FocusEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
        setActive((a) => (a === key ? null : a));
        setFrozenHasIssues(null);
      }
    },
  });

  // A pencil in the table points at one field: bring it into view and focus.
  useEffect(() => {
    if (!focus) return;
    const el = document.getElementById(fieldId(focus.column));
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    (el as HTMLElement).focus({ preventScroll: true });
  }, [focus?.nonce, row.rowNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  const messages = (issues: Issue[]) =>
    issues.map((i, k) => (
      <span
        key={k}
        className={`text-xs block ${
          i.severity === "error" ? "text-red-700" : "text-yellow-800"
        }`}
      >
        {i.message}
      </span>
    ));

  const control = (c: ImportColumn) => {
    const issues = issuesOf(c.column);
    const value = row.cells[c.column] ?? "";
    const cls = `${inputBase} ${fieldTone(issues)}`;
    const change = (v: string) => onEdit(row.rowNumber, c.column, v);
    const options = c.field?.options;
    if (options?.length) {
      return (
        <select
          id={fieldId(c.column)}
          className={cls}
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
      );
    }
    const long = c.target === "summary" || c.field?.type === "MULTILINE_TEXT";
    return long ? (
      <textarea
        id={fieldId(c.column)}
        className={cls}
        rows={c.target === "summary" ? 3 : 6}
        value={value}
        onChange={(e) => change(e.target.value)}
      />
    ) : (
      <input
        id={fieldId(c.column)}
        className={cls}
        value={value}
        onChange={(e) => change(e.target.value)}
      />
    );
  };

  // With issues, show just the affected fields (a long form pushes the import
  // button far down); a toggle brings the rest back.
  const hasIssues =
    active !== null && frozenHasIssues !== null ? frozenHasIssues : issuesNow;
  const filtering = onlyIssues && hasIssues;
  const rowLevel = row.issues.filter((i) => !i.column);
  const present = columns.filter(
    (c) =>
      hasColumn(c.column) &&
      (!filtering || issuesOf(c.column).length > 0 || active === c.column)
  );
  const budgetPairs = budgetNumbers.filter((n) => {
    const item = `budget-item-${n}`;
    const amount = `budget-amount-${n}`;
    return (
      hasColumn(item) &&
      hasColumn(amount) &&
      (!filtering ||
        issuesOf(item).length + issuesOf(amount).length > 0 ||
        active === `budget-${n}`)
    );
  });
  const wide = (c: ImportColumn) =>
    c.target === "summary" || c.field?.type === "MULTILINE_TEXT";
  const title = (c: ImportColumn) =>
    c.target === "title"
      ? "Title"
      : c.target === "summary"
      ? "Summary"
      : c.field.name;

  return (
    <div className="space-y-4">
      {hasIssues && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyIssues}
            onChange={(e) => onToggleOnlyIssues(e.target.checked)}
          />
          Show only fields that need attention
        </label>
      )}
      {messages(rowLevel)}
      {(!filtering || issuesOf("image").length > 0) && (
        <div id={fieldId("image")} tabIndex={-1} className="outline-none">
          <h4 className="font-medium text-sm">Image</h4>
          <ImageControl
            thumb={row.payload.images?.[0]?.small ?? null}
            image={image}
            onAttach={onAttachImage}
            onClear={onClearImage}
          />
          {messages(issuesOf("image"))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {present.map((c) => (
          <label
            key={c.column}
            className={`block text-sm ${wide(c) ? "sm:col-span-2" : ""}`}
            {...focusProps(c.column)}
          >
            <span className="font-medium">{title(c)}</span>
            {control(c)}
            {messages(issuesOf(c.column))}
          </label>
        ))}
      </div>

      <div>
        {budgetPairs.length > 0 && (
          <h4 className="font-medium text-sm mb-1">Budget lines</h4>
        )}
        {budgetPairs.length > 0 && (
          <div>
            <div className="grid grid-cols-[1fr_8rem] gap-x-2 gap-y-1 text-sm">
              {budgetPairs.map((n) => {
                const item = `budget-item-${n}`;
                const amount = `budget-amount-${n}`;
                const itemIssues = issuesOf(item);
                const amountIssues = issuesOf(amount);
                return (
                  <div
                    key={n}
                    className="contents"
                    {...focusProps(`budget-${n}`)}
                  >
                    <div>
                      <input
                        id={fieldId(item)}
                        className={`${inputBase} ${fieldTone(itemIssues)}`}
                        placeholder={`Item ${n}`}
                        value={row.cells[item] ?? ""}
                        onChange={(e) =>
                          onEdit(row.rowNumber, item, e.target.value)
                        }
                      />
                      {messages(itemIssues)}
                    </div>
                    <div>
                      <input
                        id={fieldId(amount)}
                        className={`${inputBase} text-right ${fieldTone(
                          amountIssues
                        )}`}
                        placeholder="Amount"
                        value={row.cells[amount] ?? ""}
                        onChange={(e) =>
                          onEdit(row.rowNumber, amount, e.target.value)
                        }
                      />
                      {messages(amountIssues)}
                    </div>
                  </div>
                );
              })}
            </div>
            {!filtering && (
              <p className="text-xs text-gray-500 mt-1">
                Columns matching {String(budgetColumnPattern.item.source)} /{" "}
                {String(budgetColumnPattern.amount.source)}. Blank pairs are
                ignored.
              </p>
            )}
          </div>
        )}
        {(!filtering || budgetPairs.length > 0) && (
          <button
            type="button"
            className="mt-2 text-sm underline text-gray-700 hover:text-gray-900"
            onClick={onAddBudgetLine}
          >
            + Add budget line
          </button>
        )}
      </div>

      <div className="border-t pt-3 flex justify-end">
        <button
          type="button"
          className="flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-900 hover:underline focus:outline-none focus:ring rounded"
          onClick={onRemove}
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
          Remove this entry from the import
        </button>
      </div>
    </div>
  );
};

export default RowEditor;
