import csv from "csvtojson";
import {
  baseColumns,
  budgetColumnPattern,
  bucketImportConfig,
  normalizeName,
} from "./config";
import type {
  ImportBucketRow,
  ImportBudgetItem,
  ImportFieldDef,
  ImportFieldValue,
} from "./types";
import { validateImportPayload } from "./validatePayload";

// Pure (no React / Prisma): CSV text -> table -> validated rows with
// cell-level issues. Shared logic lives in validatePayload.ts; this file only
// knows about the CSV shape.

export type CsvTable = { headers: string[]; rows: string[][] };

export type Severity = "error" | "warning";

export type PreparedIssue = {
  severity: Severity;
  /** CSV column the message belongs to, or null for the whole row */
  column: string | null;
  message: string;
};

export type PreparedRow = {
  /** 1-based data row number (header excluded) */
  rowNumber: number;
  cells: Record<string, string>;
  payload: ImportBucketRow;
  totalMinor: number;
  issues: PreparedIssue[];
};

export type PrepareContext = {
  fields: ImportFieldDef[];
  /** normalised reference codes already used in the round */
  existingCodes: string[];
};

export type Prepared = {
  /** problems with the file or round set-up, reported once (not per row) */
  fileIssues: { severity: Severity; message: string }[];
  rows: PreparedRow[];
  budgetNumbers: number[];
  unknownColumns: string[];
  payloadBytes: number;
};

const BOM = /^﻿/;

/** Parse CSV text (BOM, CRLF, quoted multi-line cells, `,` or `;` delimiter). */
export async function parseCsvText(text: string): Promise<CsvTable> {
  const clean = text.replace(BOM, "");
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? "";
  const delimiter =
    (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0)
      ? ";"
      : ",";
  const all: string[][] = await csv({
    noheader: true,
    output: "csv",
    delimiter,
    trim: false,
  }).fromString(clean);
  // Skip leading comment lines ("# ...") such as the ones in the July template.
  let start = 0;
  while (start < all.length && (all[start][0] ?? "").trim().startsWith("#"))
    start++;
  const [headerRow = [], ...rows] = all.slice(start);
  const headers = headerRow.map((h) => h.trim());
  return {
    headers,
    rows: rows.filter((r) => r.some((c) => (c ?? "").trim() !== "")),
  };
}

/** "1234", "1,234.50", "£1,234" -> minor units; null when not a valid amount. */
export function parseAmountToMinor(raw: string): number | null {
  const v = raw.trim().replace(/^£\s*/, "");
  if (!/^(\d+|\d{1,3}(,\d{3})+)(\.\d{1,2})?$/.test(v)) return null;
  const minor = Math.round(parseFloat(v.replace(/,/g, "")) * 100);
  return minor <= bucketImportConfig.maxAmountMinor ? minor : null;
}

export function prepareImport(table: CsvTable, ctx: PrepareContext): Prepared {
  const fileIssues: Prepared["fileIssues"] = [];
  const fileError = (message: string) =>
    fileIssues.push({ severity: "error", message });
  const fileWarn = (message: string) =>
    fileIssues.push({ severity: "warning", message });

  const idx = new Map<string, number>();
  table.headers.forEach((h, i) => {
    if (!h) return;
    if (idx.has(h)) fileError(`Column "${h}" appears more than once.`);
    else idx.set(h, i);
  });

  // Required columns
  baseColumns
    .filter((c) => c.required && !idx.has(c.column))
    .forEach((c) => fileError(`Required column "${c.column}" is missing.`));

  // Budget columns: discover N from headers (never a fixed count)
  const itemNs = new Set<number>();
  const amountNs = new Set<number>();
  table.headers.forEach((h) => {
    const mi = h.match(budgetColumnPattern.item);
    const ma = h.match(budgetColumnPattern.amount);
    if (mi) itemNs.add(Number(mi[1]));
    if (ma) amountNs.add(Number(ma[1]));
  });
  const budgetNumbers = Array.from(itemNs)
    .concat(Array.from(amountNs).filter((n) => !itemNs.has(n)))
    .sort((a, b) => a - b);
  budgetNumbers.forEach((n) => {
    if (!itemNs.has(n))
      fileError(
        `"budget_amount_${n}" has no matching "budget_item_${n}" column.`
      );
    if (!amountNs.has(n))
      fileError(
        `"budget_item_${n}" has no matching "budget_amount_${n}" column.`
      );
  });
  if (budgetNumbers.length === 0)
    fileError(
      'No budget columns found (expected "budget_item_1", "budget_amount_1", ...).'
    );

  // Unknown columns -> warning only (never imported)
  const known = new Set(baseColumns.map((c) => c.column));
  const unknownColumns = table.headers.filter(
    (h) =>
      h &&
      !known.has(h) &&
      !budgetColumnPattern.item.test(h) &&
      !budgetColumnPattern.amount.test(h)
  );
  unknownColumns.forEach((h) =>
    fileWarn(`Column "${h}" is not recognised and will be ignored.`)
  );

  // Round fields must already exist for every field column in the file
  const fieldByName = new Map(
    ctx.fields.map((f) => [normalizeName(f.name), f])
  );
  const fieldColumns = baseColumns.filter(
    (c) => c.target === "field" && idx.has(c.column)
  );
  const missingFields = fieldColumns.filter(
    (c) => !fieldByName.has(normalizeName(c.fieldName))
  );
  if (missingFields.length)
    fileError(
      `This round has no custom field for: ${missingFields
        .map((c) => `"${c.fieldName}" (column ${c.column})`)
        .join(
          ", "
        )}. Add or rename them in Round Settings → Bucket Form, then upload again.`
    );

  // Rows
  const get = (r: string[], col: string) =>
    idx.has(col) ? (r[idx.get(col)] ?? "").replace(/\r\n?/g, "\n").trim() : "";
  const colFor = (target: string) =>
    baseColumns.find((c) => c.target === target)?.column;

  const rows: PreparedRow[] = table.rows.map((r, i) => {
    const issues: PreparedIssue[] = [];
    const add = (severity: Severity, column: string | null, message: string) =>
      issues.push({ severity, column, message });

    const cells: Record<string, string> = {};
    table.headers.forEach((h, c) => {
      if (h) cells[h] = (r[c] ?? "").replace(/\r\n?/g, "\n").trim();
    });

    // budget lines
    const budgetItems: ImportBudgetItem[] = [];
    let totalMinor = 0;
    budgetNumbers.forEach((n) => {
      const itemCol = `budget_item_${n}`;
      const amountCol = `budget_amount_${n}`;
      const desc = get(r, itemCol);
      const amountRaw = get(r, amountCol);
      if (!desc && !amountRaw) return;
      if (!desc)
        return add(
          "error",
          itemCol,
          `Description missing for budget line ${n}.`
        );
      if (!amountRaw)
        return add("error", amountCol, `Amount missing for "${desc}".`);
      const minor = parseAmountToMinor(amountRaw);
      if (minor === null)
        return add(
          "error",
          amountCol,
          `"${amountRaw}" is not a valid amount (whole or 2-decimal number, no currency symbol).`
        );
      budgetItems.push({ description: desc, amount: minor });
      totalMinor += minor;
    });

    // field values
    const fieldValues: ImportFieldValue[] = [];
    fieldColumns.forEach((c) => {
      const def = fieldByName.get(normalizeName(c.fieldName));
      const v = get(r, c.column);
      if (def && v) fieldValues.push({ fieldId: def.id, value: v });
    });

    // image
    const imageUrl = get(r, colFor("image"));
    if (imageUrl && !/^https?:\/\/\S+$/i.test(imageUrl))
      add("error", "image_url", "Image must be a full http(s) URL.");
    else if (!imageUrl) add("warning", "image_url", "No image yet.");

    const payload: ImportBucketRow = {
      title: get(r, colFor("title")),
      summary: get(r, colFor("summary")),
      referenceCode: get(r, colFor("referenceCode")),
      fieldValues,
      budgetItems,
      images:
        imageUrl && /^https?:\/\/\S+$/i.test(imageUrl)
          ? [{ small: imageUrl, large: imageUrl }]
          : [],
    };

    return { rowNumber: i + 1, cells, payload, totalMinor, issues };
  });

  // Shared rules (also run authoritatively on the server)
  const validation = validateImportPayload(
    rows.map((r) => r.payload),
    { fields: ctx.fields, existingCodes: new Set(ctx.existingCodes) }
  );
  const columnForField = (name: string): string | null => {
    if (name === "title") return colFor("title");
    if (name === "summary") return colFor("summary");
    if (name === "referenceCode") return colFor("referenceCode");
    if (name.startsWith("budgetItems")) return null;
    const base = baseColumns.find(
      (c) =>
        c.target === "field" &&
        normalizeName(c.fieldName) === normalizeName(name)
    );
    return base?.column ?? null;
  };
  const seenFile = new Set(fileIssues.map((f) => f.message));
  [
    ...validation.errors.map((x) => ({ ...x, severity: "error" as Severity })),
    ...validation.warnings.map((x) => ({
      ...x,
      severity: "warning" as Severity,
    })),
  ].forEach((x) => {
    if (x.row === null) {
      if (!seenFile.has(x.message)) {
        fileIssues.push({ severity: x.severity, message: x.message });
        seenFile.add(x.message);
      }
      return;
    }
    // "No budget items" is already reported if the cause was a bad amount
    const row = rows[x.row];
    if (
      x.field === "budgetItems" &&
      x.message.startsWith("No budget items") &&
      row.issues.some((p) => p.column?.startsWith("budget_"))
    )
      return;
    row.issues.push({
      severity: x.severity,
      column: columnForField(x.field),
      message: x.message,
    });
  });

  const payloadBytes = JSON.stringify(rows.map((r) => r.payload)).length;
  if (payloadBytes > 800 * 1024)
    fileWarn(
      `The import is ${(payloadBytes / 1024).toFixed(
        0
      )} KB; the server limit is about 1 MB. Split the file if it fails.`
    );

  return { fileIssues, rows, budgetNumbers, unknownColumns, payloadBytes };
}

export function summarize(prepared: Prepared) {
  const hasFileError = prepared.fileIssues.some((i) => i.severity === "error");
  const errorRows = prepared.rows.filter((r) =>
    r.issues.some((i) => i.severity === "error")
  ).length;
  const warningRows = prepared.rows.filter(
    (r) =>
      !r.issues.some((i) => i.severity === "error") &&
      r.issues.some((i) => i.severity === "warning")
  ).length;
  return {
    total: prepared.rows.length,
    errorRows,
    warningRows,
    okRows: prepared.rows.length - errorRows - warningRows,
    blocked: hasFileError || errorRows > 0,
  };
}

/** Template CSV: header + one example row, built from the column config. */
export function buildTemplateCsv(budgetPairs: number): string {
  const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const budgetHeaders = Array.from({ length: budgetPairs }, (_, i) => [
    `budget_item_${i + 1}`,
    `budget_amount_${i + 1}`,
  ]).flat();
  const headers = [...baseColumns.map((c) => c.column), ...budgetHeaders];
  const example = [
    ...baseColumns.map((c) =>
      c.target === "title"
        ? "Community garden"
        : c.target === "summary"
        ? "Turn the empty lot on Mill Road into a shared growing space."
        : c.target === "referenceCode"
        ? "EX01"
        : ""
    ),
    "Raised beds",
    "1200",
    "Tools",
    "350.50",
    ...Array(Math.max(0, budgetPairs - 2) * 2).fill(""),
  ];
  return (
    [headers.map(q).join(","), example.map(q).join(",")].join("\r\n") + "\r\n"
  );
}
