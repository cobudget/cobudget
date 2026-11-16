import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { gql, useQuery } from "urql";
import toast from "react-hot-toast";
import Button from "components/Button";
import Banner from "components/Banner";
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
import ColumnReference from "./ColumnReference";
import PreviewTable from "./PreviewTable";

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
  const blob = new Blob(["﻿" + buildTemplateCsv(templateBudgetPairs)], {
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

const BucketImport = ({ round }: { round: any }) => {
  const [{ data, fetching, error }] = useQuery({
    query: IMPORT_CONTEXT_QUERY,
    variables: { roundId: round.id },
    requestPolicy: "network-only",
  });
  const ctx = data?.bucketImportContext;

  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [table, setTable] = useState<Awaited<
    ReturnType<typeof parseCsvText>
  > | null>(null);
  const [onlyNeedsAttention, setOnlyNeedsAttention] = useState(false);

  // Validation is derived from (file, round context), so it re-runs if the
  // round context reloads. Read-only for now; editing arrives in the next step.
  const prepared: Prepared | null = useMemo(
    () =>
      table && ctx
        ? prepareImport(table, {
            fields: ctx.fields.map((f) => ({
              ...f,
              options: f.options ?? [],
            })),
            existingCodes: ctx.existingCodes,
          })
        : null,
    [table, ctx]
  );
  const summary = prepared ? summarize(prepared) : null;

  const onFile = useCallback(async (file?: File) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = await parseCsvText(text);
      if (parsed.rows.length === 0)
        return toast.error("The CSV file has no data rows.");
      setFileName(file.name);
      setTable(parsed);
    } catch (e) {
      toast.error("Could not read this file as CSV: " + (e?.message ?? e));
    }
  }, []);

  const base = `/${round.group?.slug ?? "c"}/${round.slug}`;

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
            You get a preview with errors and warnings per row. Nothing is
            written until you confirm in a later step; errors block the import,
            warnings do not.
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
          {table ? "Choose another file" : "Choose CSV file"}
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

          <p className="text-sm text-gray-700">
            {summary.blocked
              ? "Fix the errors in your file and upload it again. Importing is blocked while errors exist."
              : "No errors. (Importing is added in a later step; this is a preview.)"}
          </p>

          <PreviewTable
            prepared={prepared}
            currency={ctx.currency}
            onlyNeedsAttention={onlyNeedsAttention}
          />
        </div>
      )}
    </div>
  );
};

export default BucketImport;
