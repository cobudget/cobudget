import { bucketImportConfig, normalizeCode, normalizeName } from "./config";
import type {
  ImportBucketRow,
  ImportIssue,
  ImportRoundContext,
  ImportValidation,
} from "./types";

const isBlank = (v: unknown) =>
  v === null ||
  v === undefined ||
  (typeof v === "string" && v.trim() === "") ||
  (Array.isArray(v) && v.length === 0);

/**
 * Pure validation of the commit payload (no React / Prisma). The server runs
 * this authoritatively inside the import transaction; the client can reuse it.
 */
export function validateImportPayload(
  rows: ImportBucketRow[],
  ctx: ImportRoundContext
): ImportValidation {
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];
  const err = (row: number | null, field: string, message: string) =>
    errors.push({ row, field, message });
  const warn = (row: number | null, field: string, message: string) =>
    warnings.push({ row, field, message });

  // Round-config problems are reported once, not per row.
  const refField = ctx.fields.find(
    (f) =>
      normalizeName(f.name) ===
      normalizeName(bucketImportConfig.referenceCodeFieldName)
  );
  if (!refField)
    err(
      null,
      "round",
      `The round has no "${bucketImportConfig.referenceCodeFieldName}" custom field. Add it in Round Settings → Bucket Form first.`
    );

  if (rows.length === 0) err(null, "rows", "There are no buckets to import.");
  if (rows.length > bucketImportConfig.maxRows)
    err(
      null,
      "rows",
      `Too many rows (${rows.length}); the maximum per import is ${bucketImportConfig.maxRows}.`
    );
  if (errors.length) return { errors, warnings };

  const fieldById = new Map(ctx.fields.map((f) => [f.id, f]));
  const codeFirstRow = new Map<string, number>();
  const titleFirstRow = new Map<string, number>();

  rows.forEach((row, i) => {
    // title
    if (isBlank(row.title)) err(i, "title", "Title is required.");
    else {
      const t = row.title.trim().toLowerCase();
      if (titleFirstRow.has(t))
        warn(i, "title", `Same title as row ${titleFirstRow.get(t) + 1}.`);
      else titleFirstRow.set(t, i);
    }

    // summary
    if (row.summary && row.summary.length > bucketImportConfig.summaryMaxLength)
      err(
        i,
        "summary",
        `Summary is ${row.summary.length} characters; the limit is ${bucketImportConfig.summaryMaxLength}.`
      );

    // reference code: required + unique in file and vs the round
    if (isBlank(row.referenceCode))
      err(i, "referenceCode", "Reference code is required.");
    else {
      const code = normalizeCode(row.referenceCode);
      if (codeFirstRow.has(code))
        err(
          i,
          "referenceCode",
          `Duplicate reference code "${row.referenceCode.trim()}" (also on row ${
            codeFirstRow.get(code) + 1
          }).`
        );
      else codeFirstRow.set(code, i);
      if (ctx.existingCodes.has(code))
        err(
          i,
          "referenceCode",
          `Reference code "${row.referenceCode.trim()}" already exists in this round.`
        );
    }

    // budget items
    if (row.budgetItems.length > bucketImportConfig.maxBudgetItemsPerRow)
      err(
        i,
        "budgetItems",
        `Too many budget items (${row.budgetItems.length}).`
      );
    if (row.budgetItems.length === 0)
      warn(i, "budgetItems", "No budget items; the total ask will be 0.");
    row.budgetItems.forEach((item, j) => {
      if (isBlank(item.description))
        err(i, `budgetItems[${j}]`, `Budget item ${j + 1} has no description.`);
      if (
        !Number.isInteger(item.amount) ||
        item.amount < 0 ||
        item.amount > bucketImportConfig.maxAmountMinor
      )
        err(
          i,
          `budgetItems[${j}]`,
          `Budget item ${j + 1} amount is not a valid amount.`
        );
    });

    // custom field values
    const seen = new Set<string>();
    row.fieldValues.forEach((fv) => {
      const def = fieldById.get(fv.fieldId);
      if (!def) {
        err(i, "fieldValues", `Unknown field id ${fv.fieldId} for this round.`);
        return;
      }
      if (seen.has(fv.fieldId)) {
        err(i, def.name, `Field "${def.name}" is given more than once.`);
        return;
      }
      seen.add(fv.fieldId);
      if (isBlank(fv.value)) return; // blanks are skipped; required checked below
      if (
        def.type === "TEXT" ||
        def.type === "MULTILINE_TEXT" ||
        def.type === "ENUM"
      ) {
        if (typeof fv.value !== "string") {
          err(i, def.name, `"${def.name}" must be text.`);
          return;
        }
        if (def.limit && fv.value.length > def.limit)
          err(
            i,
            def.name,
            `"${def.name}" is ${fv.value.length} characters; the limit is ${def.limit}.`
          );
        if (def.options.length && !def.options.includes(fv.value))
          err(
            i,
            def.name,
            `"${fv.value}" is not an allowed value for "${def.name}".`
          );
      } else if (def.type === "BOOLEAN") {
        if (typeof fv.value !== "boolean")
          err(i, def.name, `"${def.name}" must be true or false.`);
      } else {
        err(
          i,
          def.name,
          `Field "${def.name}" (${def.type}) cannot be imported.`
        );
      }
    });
    ctx.fields
      .filter((f) => f.isRequired && f.id !== refField.id) // refField is filled from row.referenceCode
      .forEach((f) => {
        const given = row.fieldValues.find((fv) => fv.fieldId === f.id);
        if (!given || isBlank(given.value))
          err(i, f.name, `"${f.name}" is required.`);
      });
  });

  return { errors, warnings };
}
