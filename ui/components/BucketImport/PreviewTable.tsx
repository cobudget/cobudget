import FormattedCurrency from "components/FormattedCurrency";
import type { Prepared, PreparedIssue } from "utils/bucketImport/prepareImport";

const tone = (issues: PreparedIssue[]) =>
  issues.some((i) => i.severity === "error")
    ? "bg-red-100 text-red-900"
    : issues.length
    ? "bg-yellow-100 text-yellow-900"
    : "";

// One cell: highlighted when any issue is attached to its column; the
// explanation is shown on hover and in the Messages column.
const Cell = ({
  issues,
  className = "",
  children,
}: {
  issues: PreparedIssue[];
  className?: string;
  children: React.ReactNode;
}) => (
  <td
    className={`px-2 py-1 align-top border-b ${tone(issues)} ${className}`}
    title={issues.map((i) => i.message).join("\n") || undefined}
  >
    {children}
  </td>
);

const PreviewTable = ({
  prepared,
  currency,
  onlyNeedsAttention,
}: {
  prepared: Prepared;
  currency: string;
  onlyNeedsAttention: boolean;
}) => {
  const rows = prepared.rows.filter(
    (r) => !onlyNeedsAttention || r.issues.length > 0
  );
  const on = (r: Prepared["rows"][number], col: string) =>
    r.issues.filter((i) => i.column === col);

  return (
    <div className="overflow-auto max-h-screen border rounded">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-gray-100 text-left">
          <tr>
            {[
              "#",
              "Status",
              "Title",
              "Summary",
              "Ref. code",
              "Priority area",
              "Image",
              "Total ask",
              "Messages",
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
            return (
              <tr key={r.rowNumber}>
                <td className="px-2 py-1 align-top border-b text-gray-600">
                  {r.rowNumber}
                </td>
                <td className="px-2 py-1 align-top border-b whitespace-nowrap">
                  {hasError ? "Error" : r.issues.length ? "Warning" : "OK"}
                </td>
                <Cell issues={on(r, "proposal_title")} className="min-w-48">
                  {r.cells.proposal_title}
                </Cell>
                <Cell issues={on(r, "proposal_summary")} className="min-w-64">
                  {r.cells.proposal_summary}
                </Cell>
                <Cell issues={on(r, "reference_code")}>
                  {r.cells.reference_code}
                </Cell>
                <Cell issues={on(r, "priority_area")}>
                  {r.cells.priority_area}
                </Cell>
                <Cell issues={on(r, "image_url")}>
                  {r.cells.image_url ? "✓" : "–"}
                </Cell>
                <Cell
                  issues={r.issues.filter((i) =>
                    i.column?.startsWith("budget_")
                  )}
                  className="whitespace-nowrap text-right"
                >
                  <FormattedCurrency value={r.totalMinor} currency={currency} />
                  <div className="text-xs text-gray-600">
                    {r.payload.budgetItems.length} items
                  </div>
                </Cell>
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PreviewTable;
