import { useEffect, useRef, useState } from "react";
import FormattedCurrency from "components/FormattedCurrency";
import type { Prepared, PreparedIssue } from "utils/bucketImport/prepareImport";
import type { RowImages } from "utils/bucketImport/images";
import type { ImportColumn } from "utils/bucketImport/columns";
import ImageControl from "./ImageControl";

const tone = (issues: PreparedIssue[]) =>
  issues.some((i) => i.severity === "error")
    ? "bg-red-100"
    : issues.length
    ? "bg-yellow-100"
    : "";

// Resolved rows stay visible this long (highlighted green), then fade out.
const RESOLVED_HOLD_MS = 900;
const FADE_MS = 500;

const columnTitle = (c: ImportColumn) =>
  c.target === "title"
    ? "Title"
    : c.target === "summary"
    ? "Summary"
    : c.field.name;

// Hover-only pencil (always visible on touch screens, where there is no
// hover). It is the only way into the editor: plain clicks and scrolling
// never interrupt browsing the table.
const pencilCss = `
.import-pencil { opacity: 0; }
.import-cell:hover .import-pencil, .import-pencil:focus { opacity: 1; }
@media (hover: none) { .import-pencil { opacity: 1; } }
`;

const Pencil = ({
  onClick,
  label,
}: {
  onClick: (e: React.MouseEvent) => void;
  label: string;
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className="import-pencil absolute right-1 top-1 p-0.5 rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
    onClick={onClick}
  >
    <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
      <path d="M13.6 2.4a2 2 0 0 1 2.8 2.8l-9.5 9.5-3.7.9.9-3.7 9.5-9.5z" />
    </svg>
  </button>
);

const PreviewTable = ({
  prepared,
  currency,
  columns,
  hasColumn,
  onlyNeedsAttention,
  selected,
  onEditCell,
  onSelectRow,
  onRemoveRow,
  images,
  onAttachImage,
  onClearImage,
}: {
  prepared: Prepared;
  currency: string;
  columns: ImportColumn[];
  hasColumn: (column: string) => boolean;
  onlyNeedsAttention: boolean;
  selected: number | null;
  onEditCell: (rowNumber: number, column: string) => void;
  onSelectRow: (rowNumber: number) => void;
  onRemoveRow: (rowNumber: number) => void;
  images: RowImages;
  onAttachImage: (rowNumber: number, file: File) => void;
  onClearImage: (rowNumber: number) => void;
}) => {
  // A row that has just been resolved is held for a moment, then fades out,
  // so it is clear it was fixed. Never while it is the selected row (it would
  // vanish under the editor) and never when the filter is first switched on.
  const [phase, setPhase] = useState<Record<number, "hold" | "fade" | "gone">>(
    {}
  );
  const prevFilter = useRef(onlyNeedsAttention);
  // Rows that were on screen (so a resolution is worth animating).
  const wasShown = useRef<Set<number>>(new Set());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    const filterJustChanged = prevFilter.current !== onlyNeedsAttention;
    prevFilter.current = onlyNeedsAttention;
    setPhase((p) => {
      const next = { ...p };
      let changed = false;
      for (const r of prepared.rows) {
        const hide =
          onlyNeedsAttention && !r.issues.length && selected !== r.rowNumber;
        if (!hide) {
          if (next[r.rowNumber]) {
            delete next[r.rowNumber];
            changed = true;
          }
          continue;
        }
        if (next[r.rowNumber]) continue;
        changed = true;
        // Rows that are OK when the filter is switched on (or the file is
        // loaded) are hidden at once; only fresh resolutions animate.
        const animate = !filterJustChanged && wasShown.current.has(r.rowNumber);
        if (!animate) {
          next[r.rowNumber] = "gone";
          continue;
        }
        next[r.rowNumber] = "hold";
        const n = r.rowNumber;
        timers.current.push(
          setTimeout(
            () =>
              setPhase((q) => (q[n] === "hold" ? { ...q, [n]: "fade" } : q)),
            RESOLVED_HOLD_MS
          ),
          setTimeout(
            () =>
              setPhase((q) => (q[n] === "fade" ? { ...q, [n]: "gone" } : q)),
            RESOLVED_HOLD_MS + FADE_MS
          )
        );
      }
      return changed ? next : p;
    });
  }, [prepared, onlyNeedsAttention, selected]);

  // (runs after the effect above, so that one sees the previous render)
  useEffect(() => {
    wasShown.current = new Set(
      prepared.rows
        .filter((r) =>
          onlyNeedsAttention ? phase[r.rowNumber] !== "gone" : true
        )
        .map((r) => r.rowNumber)
    );
  });

  const rows = prepared.rows.filter(
    (r) => !onlyNeedsAttention || phase[r.rowNumber] !== "gone"
  );
  // Rows that are correct and currently hidden (the count follows the fades).
  const hidden = onlyNeedsAttention
    ? prepared.rows.filter(
        (r) => !r.issues.length && phase[r.rowNumber] === "gone"
      ).length
    : 0;
  const shownColumns = columns.filter((c) => hasColumn(c.column));
  const colCount = shownColumns.length + 5; // # trash status image budget

  const th =
    "px-2 py-1.5 border border-gray-300 bg-gray-100 font-medium text-left whitespace-nowrap";
  const td = "px-2 py-1 border border-gray-300 align-top relative";

  return (
    <div className="overflow-auto max-h-screen border border-gray-300 rounded">
      <style>{pencilCss}</style>
      <table className="min-w-full text-sm border-collapse">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className={`${th} text-center`}>#</th>
            <th className={th}>
              <span className="sr-only">Remove</span>
            </th>
            <th className={th}>Status</th>
            <th className={th}>Image</th>
            {shownColumns.map((c) => (
              <th key={c.column} className={th}>
                {columnTitle(c)}
              </th>
            ))}
            <th className={`${th} text-right`}>Budget</th>
          </tr>
        </thead>
        <tbody>
          {hidden > 0 && (
            <tr>
              <td
                colSpan={colCount}
                className="px-3 py-1.5 border border-gray-300 bg-green-50 text-green-900 text-sm"
              >
                {rows.length === 0
                  ? `All ${hidden} entries are correct.`
                  : `${hidden} correct ${
                      hidden === 1 ? "entry" : "entries"
                    } hidden.`}
              </td>
            </tr>
          )}
          {rows.map((r) => {
            const hasError = r.issues.some((i) => i.severity === "error");
            const state = phase[r.rowNumber];
            const rowIssues = r.issues
              .map((i) => `${i.column ? `${i.column}: ` : ""}${i.message}`)
              .join("\n");
            return (
              <tr
                key={r.rowNumber}
                className={`import-row ${
                  selected === r.rowNumber
                    ? "bg-blue-50"
                    : state
                    ? "bg-green-50"
                    : "bg-white hover:bg-gray-100"
                } cursor-pointer`}
                onClick={() => {
                  // a text selection (copying a cell) is not a click on the row
                  if (window.getSelection()?.toString()) return;
                  onSelectRow(r.rowNumber);
                }}
                style={{
                  transition: `opacity ${FADE_MS}ms ease-out`,
                  opacity: state === "fade" ? 0 : 1,
                }}
              >
                <td className={`${td} text-center text-gray-600 bg-gray-50`}>
                  {r.rowNumber}
                </td>
                <td className={`${td} text-center`}>
                  <button
                    type="button"
                    aria-label={`Remove entry ${r.rowNumber}`}
                    title={`Remove entry ${r.rowNumber}`}
                    className="text-gray-500 hover:text-red-700 focus:outline-none focus:ring rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveRow(r.rowNumber);
                    }}
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
                  </button>
                </td>
                <td
                  className={`${td} whitespace-nowrap font-medium ${
                    hasError
                      ? "text-red-700"
                      : r.issues.length
                      ? "text-yellow-800"
                      : "text-green-700"
                  }`}
                  title={rowIssues || undefined}
                >
                  {hasError
                    ? "✕ Error"
                    : r.issues.length
                    ? "! Warning"
                    : "✓ OK"}
                </td>
                <td
                  className={`${td} min-w-40 ${tone(
                    r.issues.filter((i) => i.column === "image")
                  )}`}
                >
                  <ImageControl
                    thumb={r.payload.images?.[0]?.small ?? null}
                    image={images[r.rowNumber]}
                    onAttach={(f) => onAttachImage(r.rowNumber, f)}
                    onClear={() => onClearImage(r.rowNumber)}
                  />
                </td>
                {shownColumns.map((c) => {
                  const issues = r.issues.filter((i) => i.column === c.column);
                  const value = r.cells[c.column] ?? "";
                  return (
                    <td
                      key={c.column}
                      className={`${td} import-cell pr-8 ${tone(issues)}`}
                      title={
                        issues.map((i) => i.message).join("\n") || undefined
                      }
                    >
                      <div className="max-w-xs truncate">{value}</div>
                      <Pencil
                        label={`Edit ${columnTitle(c)} of entry ${r.rowNumber}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCell(r.rowNumber, c.column);
                        }}
                      />
                    </td>
                  );
                })}
                <td
                  className={`${td} import-cell pr-8 whitespace-nowrap text-right ${tone(
                    r.issues.filter((i) => i.column?.startsWith("budget-"))
                  )}`}
                  title={
                    r.issues
                      .filter((i) => i.column?.startsWith("budget-"))
                      .map((i) => i.message)
                      .join("\n") || undefined
                  }
                >
                  <FormattedCurrency value={r.totalMinor} currency={currency} />
                  <div className="text-xs text-gray-600">
                    {r.payload.budgetItems.length} items
                  </div>
                  <Pencil
                    label={`Edit budget of entry ${r.rowNumber}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCell(r.rowNumber, "budget-item-1");
                    }}
                  />
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
