import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { gql, useMutation, useQuery } from "urql";
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
  templateBudgetPairs,
  templateFileName,
} from "utils/bucketImport/config";
import { buildColumns } from "utils/bucketImport/columns";
import type { ImportFieldDef } from "utils/bucketImport/types";
import { applyImages } from "utils/bucketImport/images";
import type { RowImage, RowImages } from "utils/bucketImport/images";
import { uploadBucketImage } from "utils/uploadBucketImage";
import { createLimiter, matchFiles } from "utils/bucketImport/matchImages";
import BatchImages from "./BatchImages";
import type { UnassignedFile } from "./BatchImages";
import BucketPreview from "./BucketPreview";
import ColumnReference from "./ColumnReference";
import ConfirmModal from "./ConfirmModal";
import ImportResult from "./ImportResult";
import IssuesList from "./IssuesList";
import PreviewTable from "./PreviewTable";
import RowEditor from "./RowEditor";
import type { FocusRequest } from "./RowEditor";

const IMPORT_CONTEXT_QUERY = gql`
  query BucketImportContext($roundId: ID!) {
    bucketImportContext(roundId: $roundId) {
      currency
      existingCodes
      fields {
        id
        name
        description
        type
        limit
        options
        isRequired
        importKey
        isUniqueIdentifier
      }
    }
  }
`;

const IMPORT_BUCKETS = gql`
  mutation ImportBuckets($roundId: ID!, $buckets: [BucketImportInput!]!) {
    importBuckets(roundId: $roundId, buckets: $buckets) {
      createdCount
      buckets {
        id
        title
      }
    }
  }
`;

const downloadTemplate = (fields: ImportFieldDef[]) => {
  const blob = new Blob(
    ["\uFEFF" + buildTemplateCsv(fields, templateBudgetPairs)],
    {
      type: "text/csv;charset=utf-8",
    }
  );
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
  const [{ data, fetching, error }, reexecuteContext] = useQuery({
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
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [showBatch, setShowBatch] = useState(false);
  const [onlyIssueFields, setOnlyIssueFields] = useState(true);
  const [focusReq, setFocusReq] = useState<FocusRequest | null>(null);
  const [ackWarnings, setAckWarnings] = useState(false);
  const [, importBuckets] = useMutation(IMPORT_BUCKETS);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [created, setCreated] = useState<
    { id: string; title: string }[] | null
  >(null);
  const submittingRef = useRef(false); // synchronous double-click guard

  const [images, setImages] = useState<RowImages>({});
  const attemptRef = useRef(0);
  const limitRef = useRef(createLimiter(3)); // at most 3 uploads in flight
  const batchIdRef = useRef(0);
  const [unassigned, setUnassigned] = useState<UnassignedFile[]>([]);

  const preparedBase: Prepared | null = useMemo(
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
  const prepared = useMemo(
    () => (preparedBase ? applyImages(preparedBase, images) : null),
    [preparedBase, images]
  );
  const summary = prepared ? summarize(prepared) : null;

  const uniqueName =
    ctx?.fields.find((f) => f.isUniqueIdentifier)?.name ?? "identifier";
  const columns = useMemo(() => buildColumns(ctx?.fields ?? []), [ctx]);

  const hasColumn = useCallback((column: string) => headers.includes(column), [
    headers,
  ]);

  const [parsing, setParsing] = useState(false);
  const onFile = useCallback(async (file?: File) => {
    if (!file) return;
    setParsing(true);
    try {
      const parsed = await parseCsvText(await file.text());
      if (parsed.rows.length === 0)
        return toast.error("The CSV file has no data rows.");
      setFileName(file.name);
      setHeaders(parsed.headers);
      setRows(parsed.rows.map((cells, i) => ({ id: i + 1, cells })));
      setImages({}); // row ids restart at 1 for a new file
      setUnassigned([]);
      setSelected(null);
      setAckWarnings(false);
    } catch (e) {
      toast.error("Could not read this file as CSV: " + (e?.message ?? e));
    } finally {
      setParsing(false);
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

  // Uploads start immediately. A later attach/clear on the same row replaces
  // or removes its entry, so a stale upload result is dropped (attempt check).
  const attachImage = useCallback(async (id: number, file: File) => {
    const attempt = ++attemptRef.current;
    setImages((m) => ({
      ...m,
      [id]: { status: "uploading", fileName: file.name, attempt },
    }));
    let next: RowImage;
    try {
      const { small, large } = await limitRef.current(() =>
        uploadBucketImage(file)
      );
      next = { status: "done", fileName: file.name, attempt, small, large };
    } catch (e) {
      next = {
        status: "error",
        fileName: file.name,
        attempt,
        error: e?.message ?? String(e),
      };
    }
    setImages((m) => (m[id]?.attempt === attempt ? { ...m, [id]: next } : m));
  }, []);

  const clearImage = useCallback((id: number) => {
    setImages((m) => {
      const rest = { ...m };
      delete rest[id];
      return rest;
    });
  }, []);

  const moveImage = useCallback((from: number, to: number) => {
    setImages((m) => {
      if (m[from]?.status !== "done" || m[to]) return m;
      const rest = { ...m };
      delete rest[from];
      return { ...rest, [to]: m[from] };
    });
  }, []);

  const onBatchFiles = (files: File[]) => {
    if (!preparedBase || files.length === 0) return;
    const entries = files.map((file) => ({
      id: `f${++batchIdRef.current}`,
      file,
    }));
    const result = matchFiles(
      entries.map((e) => ({ id: e.id, name: e.file.name })),
      preparedBase.rows.map((r) => ({
        rowNumber: r.rowNumber,
        uniqueValue: r.uniqueValue,
        title: r.payload.title,
      })),
      new Set(
        Object.keys(images)
          .map(Number)
          .filter((n) => images[n].status !== "error")
      )
    );
    const fileOf = (id: string) => entries.find((e) => e.id === id).file;
    result.assigned.forEach((a) => attachImage(a.rowNumber, fileOf(a.fileId)));
    setUnassigned((u) => [
      ...u,
      ...result.unmatched.map((id) => ({
        id,
        file: fileOf(id),
        reason: "unmatched" as const,
        candidates: [] as number[],
      })),
      ...result.ambiguous.map((a) => ({
        id: a.fileId,
        file: fileOf(a.fileId),
        reason: a.reason,
        candidates: a.candidates,
      })),
    ]);
  };

  const assignUnassigned = (id: string, rowNumber: number) => {
    const u = unassigned.find((x) => x.id === id);
    if (!u) return;
    setUnassigned((us) => us.filter((x) => x.id !== id));
    attachImage(rowNumber, u.file);
  };

  const onRemove = useCallback(
    (id: number) => {
      clearImage(id);
      setRows((rs) => rs.filter((r) => r.id !== id));
      setSelected((s) => (s === id ? null : s));
    },
    [clearImage]
  );

  const removeExisting = () => {
    if (!prepared) return;
    const ids = new Set(
      prepared.rows
        .filter((r) => r.issues.some((i) => i.kind === "existingCode"))
        .map((r) => r.rowNumber)
    );
    ids.forEach(clearImage);
    setRows((rs) => rs.filter((r) => !ids.has(r.id)));
    setSelected((s) => (s !== null && ids.has(s) ? null : s));
  };

  // Open a row in the editor. `column`: the field to bring into view and focus
  // (the pencil, the issues list); without it the row is only selected (a
  // plain click on the table must not move the page).
  const openRow = (rowNumber: number, column: string | null | undefined) => {
    const row = prepared?.rows.find((r) => r.rowNumber === rowNumber);
    let target = column ?? null;
    if (target?.startsWith("budget-")) {
      // the budget pencil points at the first budget line with an issue
      target =
        row?.issues.find((i) => i.column?.startsWith("budget-"))?.column ??
        target;
    }
    setMode("edit");
    if (selected !== rowNumber) setOnlyIssueFields(true);
    setSelected(rowNumber);
    if (column !== undefined) {
      // a field without an issue is hidden while filtering: show all fields
      const hasIssue =
        !!target && !!row?.issues.some((i) => i.column === target);
      if (!hasIssue) setOnlyIssueFields(false);
      if (target)
        setFocusReq((f) => ({ column: target, nonce: (f?.nonce ?? 0) + 1 }));
    }
  };

  const base = `/${round.group?.slug ?? "c"}/${round.slug}`;
  const selectedRow = prepared?.rows.find((r) => r.rowNumber === selected);
  const totalAsk = prepared?.rows.reduce((t, r) => t + r.totalMinor, 0) ?? 0;
  // Gate for the import button: no errors, rows left, warnings acknowledged.
  const canImport =
    !!summary &&
    !summary.blocked &&
    summary.total > 0 &&
    (summary.warningRows === 0 || ackWarnings);

  const submit = async () => {
    if (!prepared || !canImport || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await importBuckets({
        roundId: round.id,
        buckets: prepared.rows.map((r) => r.payload),
      });
      if (res.error) {
        // Nothing was written (single all-or-nothing transaction). Refresh the
        // round's unique values so the table shows what the server saw.
        setSubmitError(
          res.error.graphQLErrors?.[0]?.message ?? res.error.message
        );
        reexecuteContext({ requestPolicy: "network-only" });
        return;
      }
      setCreated(res.data.importBuckets.buckets);
      setConfirmOpen(false);
      setRows([]);
      setImages({});
      setUnassigned([]);
      setHeaders([]);
      setSelected(null);
    } catch (e) {
      setSubmitError(e?.message ?? String(e));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const importAnother = () => {
    setCreated(null);
    setFileName(null);
    setAckWarnings(false);
    reexecuteContext({ requestPolicy: "network-only" });
  };

  if (created)
    return (
      <div className="page">
        <h1 className="text-2xl font-semibold mb-4">Import buckets from CSV</h1>
        <ImportResult created={created} base={base} onAnother={importAnother} />
      </div>
    );

  return (
    <div className="page">
      <div className="mb-4">
        <Link href={base}>
          <a className="text-sm text-gray-600">← Back to the overview</a>
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

      {!(prepared && summary && ctx) && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Preview</h2>
          <div className="border-2 border-dashed rounded-lg p-10 text-center text-gray-500 text-sm">
            {parsing ? (
              "Reading your file…"
            ) : (
              <>
                Choose a CSV file above. Your rows appear here, with errors and
                warnings, so you can fix them and assign an image to each bucket
                before anything is created.
              </>
            )}
          </div>
        </div>
      )}

      {prepared && summary && ctx && (
        <div className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
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
              title={`${summary.duplicateCodeRows} rows share the same ${uniqueName}`}
              className=""
            >
              Every row with a repeated value is highlighted. Edit the values or
              remove rows until each one is unique.
            </Banner>
          )}
          {summary.existingCodeRows > 0 && (
            <Banner
              variant="critical"
              title={`${summary.existingCodeRows} rows already exist in this round`}
              className=""
            >
              <div className="flex items-center gap-3 flex-wrap">
                <span>Their {uniqueName} values are already used here.</span>
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
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 ml-auto">
              <Button
                variant="secondary"
                onClick={() => setShowBatch((v) => !v)}
              >
                {showBatch ? "Hide batch image upload" : "Batch image upload"}
              </Button>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={onlyNeedsAttention}
                  onChange={(e) => setOnlyNeedsAttention(e.target.checked)}
                />
                Show only rows that need attention
              </label>
            </div>
          </div>

          <IssuesList
            prepared={prepared}
            columns={columns}
            onOpen={(rowNumber, column) => openRow(rowNumber, column)}
          />

          {showBatch && (
            <BatchImages
              rows={prepared.rows.map((r) => ({
                rowNumber: r.rowNumber,
                title: r.payload.title,
                uniqueValue: r.uniqueValue,
              }))}
              images={images}
              unassigned={unassigned}
              onFiles={onBatchFiles}
              onAssign={assignUnassigned}
              onDiscard={(id) =>
                setUnassigned((us) => us.filter((x) => x.id !== id))
              }
              onMove={moveImage}
              onClear={clearImage}
            />
          )}

          <PreviewTable
            prepared={prepared}
            currency={ctx.currency}
            columns={columns}
            hasColumn={hasColumn}
            onlyNeedsAttention={onlyNeedsAttention}
            selected={selected}
            onEditCell={(rowNumber, column) => openRow(rowNumber, column)}
            onSelectRow={(rowNumber) => openRow(rowNumber, undefined)}
            images={images}
            onAttachImage={attachImage}
            onClearImage={clearImage}
          />

          <div className="border rounded p-4 space-y-4">
            {selectedRow ? (
              <>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h3 className="font-semibold">
                    Row {selectedRow.rowNumber}:{" "}
                    {selectedRow.payload.title || "(no title)"}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div
                      role="group"
                      aria-label="Edit or preview"
                      className="inline-flex rounded overflow-hidden border border-gray-300 text-sm"
                    >
                      {(["edit", "preview"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          aria-pressed={mode === m}
                          className={`px-3 py-1 ${
                            mode === m ? "bg-gray-900 text-white" : "bg-white"
                          }`}
                          onClick={() => setMode(m)}
                        >
                          {m === "edit" ? "Edit" : "Preview"}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="text-sm text-gray-600"
                      onClick={() => setSelected(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
                {mode === "edit" ? (
                  <RowEditor
                    row={selectedRow}
                    columns={columns}
                    budgetNumbers={prepared.budgetNumbers}
                    hasColumn={hasColumn}
                    onEdit={onEdit}
                    image={images[selectedRow.rowNumber]}
                    onAttachImage={(f) => attachImage(selectedRow.rowNumber, f)}
                    onClearImage={() => clearImage(selectedRow.rowNumber)}
                    onRemove={() => onRemove(selectedRow.rowNumber)}
                    focus={focusReq}
                    onlyIssues={onlyIssueFields}
                    onToggleOnlyIssues={setOnlyIssueFields}
                  />
                ) : (
                  <BucketPreview
                    row={selectedRow}
                    round={{ ...round, currency: ctx.currency }}
                    fields={ctx.fields}
                  />
                )}
              </>
            ) : (
              <p className="text-sm text-gray-600">
                Hover a cell in the table and press its pencil to edit that row
                here, or switch to Preview to see the bucket as it will appear.
              </p>
            )}
          </div>

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
                  .
                </p>
              </>
            )}
            <div>
              <Button
                disabled={!canImport || submitting}
                onClick={() => {
                  setSubmitError(null);
                  setConfirmOpen(true);
                }}
              >
                Import {summary.total} bucket{summary.total === 1 ? "" : "s"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">How it works</h2>
        <div className="grid gap-6 md:grid-cols-3 text-sm">
          <div className="space-y-2">
            <h3 className="font-semibold">1. Download the template</h3>
            <p>
              Download the template and fill it in: one row per bucket. Keep the
              file as CSV (.csv).
            </p>
            <Button
              variant="secondary"
              disabled={!ctx}
              onClick={() => downloadTemplate(ctx.fields)}
            >
              Download CSV template
            </Button>
            <details>
              <summary className="cursor-pointer font-medium">
                Column reference
              </summary>
              <div className="mt-3">
                {fetching ? (
                  <span className="text-gray-600">Loading round fields…</span>
                ) : (
                  <ColumnReference fields={ctx?.fields ?? []} />
                )}
              </div>
            </details>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">
              2. Check interactively and assign images
            </h3>
            <p>
              Upload the file and review the table. Use a cell&apos;s pencil to
              fix a row below it, and assign an image to each bucket.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">3. Submit</h3>
            <p>
              Nothing is written until you confirm. Errors block the import;
              warnings must be acknowledged.
            </p>
          </div>
        </div>
      </div>

      {confirmOpen && summary && ctx && (
        <ConfirmModal
          total={summary.total}
          warningRows={summary.warningRows}
          totalAsk={totalAsk}
          currency={ctx.currency}
          submitting={submitting}
          error={submitError}
          onConfirm={submit}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
};

export default BucketImport;
