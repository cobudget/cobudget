import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { gql, useQuery } from "urql";
import toast from "react-hot-toast";
import Button from "components/Button";
import Banner from "components/Banner";
import FormattedCurrency from "components/FormattedCurrency";
import {
  buildTemplateCsv,
  parseCsvText,
  prepareImport,
  summarize,
} from "utils/bucketImport/prepareImport";
import type { Prepared } from "utils/bucketImport/prepareImport";
import {
  baseColumns,
  normalizeName,
  templateBudgetPairs,
  templateFileName,
} from "utils/bucketImport/config";
import BucketPreview from "./BucketPreview";
import ColumnReference from "./ColumnReference";
import PreviewTable from "./PreviewTable";
import RowEditor from "./RowEditor";

const IMPORT_CONTEXT_QUERY = gql`
  query BucketImportContext($roundId: ID!) {
    bucketImportContext(roundId: $roundId) {
      currency
      existingCodes
      fields {
        id
        name
        type
        limit
        options
        isRequired
      }
    }
  }
`;

const downloadTemplate = () => {
  const blob = new Blob(["\uFEFF" + buildTemplateCsv(templateBudgetPairs)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = templateFileName;
  a.click();
  URL.revokeObjectURL(url);
};

const Count = ({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) => (
  <div className={`rounded px-3 py-2 ${className}`}>
    <div className="text-2xl font-semibold">{value}</div>
    <div className="text-sm">{label}</div>
  </div>
);

// Editable state: the raw cells are the source of truth. Every edit re-runs
// prepareImport (pure, a few dozen rows), so counts and messages are live.
type EditRow = { id: number; cells: string[] };

const BucketImport = ({ round }: { round: any }) => {
  const [{ data, fetching, error }] = useQuery({
    query: IMPORT_CONTEXT_QUERY,
    variables: { roundId: round.id },
    requestPolicy: "network-only",
  });
  const ctx = data?.bucketImportContext;

  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<EditRow[]>([]);
  const [onlyNeedsAttention, setOnlyNeedsAttention] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [ackWarnings, setAckWarnings] = useState(false);

  const prepared: Prepared | null = useMemo(
    () =>
      headers.length && ctx
        ? prepareImport(
            {
              headers,
              rows: rows.map((r) => r.cells),
              rowNumbers: rows.map((r) => r.id),
            },
            {
              fields: ctx.fields.map((f) => ({
                ...f,
                options: f.options ?? [],
              })),
              existingCodes: ctx.existingCodes,
            }
          )
        : null,
    [headers, rows, ctx]
  );
  const summary = prepared ? summarize(prepared) : null;

  const priorityOptions: string[] = useMemo(() => {
    const col = baseColumns.find((c) => c.column === "priority_area");
    const f = ctx?.fields.find(
      (x) => normalizeName(x.name) === normalizeName(col.fieldName)
    );
    return f?.options ?? [];
  }, [ctx]);

  const hasColumn = useCallback((column: string) => headers.includes(column), [
    headers,
  ]);

  const onFile = useCallback(async (file?: File) => {
    if (!file) return;
    try {
      const parsed = await parseCsvText(await file.text());
      if (parsed.rows.length === 0)
        return toast.error("The CSV file has no data rows.");
      // image_url is optional in the file but always editable here
      const hs = parsed.headers.includes("image_url")
        ? parsed.headers
        : [...parsed.headers, "image_url"];
      setFileName(file.name);
      setHeaders(hs);
      setRows(parsed.rows.map((cells, i) => ({ id: i + 1, cells })));
      setSelected(null);
      setAckWarnings(false);
    } catch (e) {
      toast.error("Could not read this file as CSV: " + (e?.message ?? e));
    }
  }, []);

  const onEdit = useCallback(
    (id: number, column: string, value: string) => {
      const c = headers.indexOf(column);
      if (c < 0) return;
      setRows((rs) =>
        rs.map((r) => {
          if (r.id !== id) return r;
          const cells = [...r.cells];
          while (cells.length < headers.length) cells.push("");
          cells[c] = value;
          return { ...r, cells };
        })
      );
    },
    [headers]
  );

  const onRemove = useCallback((id: number) => {
    setRows((rs) => rs.filter((r) => r.id !== id));
    setSelected((s) => (s === id ? null : s));
  }, []);

  const removeExisting = () => {
    if (!prepared) return;
    const ids = new Set(
      prepared.rows
        .filter((r) => r.issues.some((i) => i.kind === "existingCode"))
        .map((r) => r.rowNumber)
    );
    setRows((rs) => rs.filter((r) => !ids.has(r.id)));
    setSelected((s) => (s !== null && ids.has(s) ? null : s));
  };

  const base = `/${round.group?.slug ?? "c"}/${round.slug}`;
  const selectedRow = prepared?.rows.find((r) => r.rowNumber === selected);
  const totalAsk = prepared?.rows.reduce((t, r) => t + r.totalMinor, 0) ?? 0;
  // Gate for the (next step's) confirm button: no errors, rows left, and
  // warnings acknowledged. Nothing is written from this page yet.
  const canImport =
    !!summary &&
    !summary.blocked &&
    summary.total > 0 &&
    (summary.warningRows === 0 || ackWarnings);

  return (
    <div className="page">
      <div className="mb-4">
        <Link href={`${base}/settings/import`}>
          <a className="text-sm text-gray-600">← Round settings</a>
        </Link>
        <h1 className="text-2xl font-semibold mt-1">Import buckets from CSV</h1>
      </div>

      {error && (
        <Banner
          variant="critical"
          title="Could not load round data"
          className="mb-4"
        >
          {error.message}
        </Banner>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
        <h2 className="text-lg font-semibold">Before you start</h2>
        <ol className="list-decimal ml-5 space-y-1 text-sm">
          <li>
            The round needs the custom fields below (Round Settings → Bucket
            Form). The importer never creates or changes them.
          </li>
          <li>
            Download the template, fill in one row per bucket (Google Sheets →
            Download as CSV, or Excel → CSV UTF-8) and upload it here.
          </li>
          <li>
            You get a preview with errors and warnings per row. Fix them right
            in the table (or remove a row); counts update as you type. Nothing
            is written until you confirm in a later step; errors block the
            import, warnings must be acknowledged.
          </li>
          <li>
            Imported buckets are published and open for funding immediately,
            list you as cocreator, and send no notification emails.
          </li>
        </ol>
        <div>
          <Button variant="secondary" onClick={downloadTemplate}>
            Download CSV template
          </Button>
        </div>
        <details>
          <summary className="cursor-pointer font-medium text-sm">
            Column reference
          </summary>
          <div className="mt-3">
            {fetching ? (
              <span className="text-sm text-gray-600">
                Loading round fields…
              </span>
            ) : (
              <ColumnReference fields={ctx?.fields ?? []} />
            )}
          </div>
        </details>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Upload CSV</h2>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = ""; // allow re-selecting the same file
          }}
        />
        <Button disabled={!ctx} onClick={() => fileRef.current?.click()}>
          {headers.length ? "Choose another file" : "Choose CSV file"}
        </Button>
        {fileName && (
          <span className="ml-3 text-sm text-gray-700">{fileName}</span>
        )}
      </div>

      {prepared && summary && ctx && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          {prepared.fileIssues.map((i, k) => (
            <Banner
              key={k}
              variant={i.severity === "error" ? "critical" : "warning"}
              title={
                i.severity === "error"
                  ? "Problem with the file or round"
                  : "Heads up"
              }
              className=""
            >
              {i.message}
            </Banner>
          ))}

          {summary.duplicateCodeRows > 0 && (
            <Banner
              variant="critical"
              title={`${summary.duplicateCodeRows} rows share a reference code`}
              className=""
            >
              Every row with a repeated code is highlighted. Edit the codes or
              remove rows until each code is unique.
            </Banner>
          )}
          {summary.existingCodeRows > 0 && (
            <Banner
              variant="critical"
              title={`${summary.existingCodeRows} rows already exist in this round`}
              className=""
            >
              <div className="flex items-center gap-3 flex-wrap">
                <span>Their reference codes are already used here.</span>
                <Button variant="secondary" onClick={removeExisting}>
                  Remove rows that already exist
                </Button>
              </div>
            </Banner>
          )}

          <div className="flex flex-wrap gap-3 items-stretch">
            <Count label="rows" value={summary.total} className="bg-gray-100" />
            <Count
              label="OK"
              value={summary.okRows}
              className="bg-green-100 text-green-900"
            />
            <Count
              label="with warnings"
              value={summary.warningRows}
              className="bg-yellow-100 text-yellow-900"
            />
            <Count
              label="with errors"
              value={summary.errorRows}
              className="bg-red-100 text-red-900"
            />
            <label className="flex items-center gap-2 text-sm ml-auto">
              <input
                type="checkbox"
                checked={onlyNeedsAttention}
                onChange={(e) => setOnlyNeedsAttention(e.target.checked)}
              />
              Show only rows that need attention
            </label>
          </div>

          <PreviewTable
            prepared={prepared}
            currency={ctx.currency}
            priorityOptions={priorityOptions}
            hasColumn={hasColumn}
            onlyNeedsAttention={onlyNeedsAttention}
            selected={selected}
            onSelect={setSelected}
            onEdit={onEdit}
            onRemove={onRemove}
          />

          {selectedRow && (
            <div className="border rounded p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Row {selectedRow.rowNumber}:{" "}
                  {selectedRow.cells.proposal_title}
                </h3>
                <button
                  type="button"
                  className="text-sm text-gray-600"
                  onClick={() => setSelected(null)}
                >
                  Close
                </button>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <RowEditor
                  row={selectedRow}
                  budgetNumbers={prepared.budgetNumbers}
                  hasColumn={hasColumn}
                  onEdit={onEdit}
                />
                <BucketPreview
                  row={selectedRow}
                  round={{ ...round, currency: ctx.currency }}
                  fields={ctx.fields}
                />
              </div>
            </div>
          )}

          <div className="border-t pt-4 space-y-2 text-sm">
            {summary.blocked ? (
              <p className="text-red-700">
                Importing is blocked while there are errors
                {summary.errorRows ? ` (${summary.errorRows} rows)` : ""}.
              </p>
            ) : summary.total === 0 ? (
              <p className="text-gray-700">No rows left to import.</p>
            ) : (
              <>
                {summary.warningRows > 0 && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={ackWarnings}
                      onChange={(e) => setAckWarnings(e.target.checked)}
                    />
                    I have reviewed the {summary.warningRows} rows with warnings
                    and want to import them anyway
                  </label>
                )}
                <p className={canImport ? "text-green-800" : "text-gray-700"}>
                  {canImport ? "Ready: " : "Not ready yet: "}
                  {summary.total} buckets, total ask{" "}
                  <FormattedCurrency value={totalAsk} currency={ctx.currency} />
                  . (The import button arrives in the next step; this page
                  writes nothing yet.)
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BucketImport;
