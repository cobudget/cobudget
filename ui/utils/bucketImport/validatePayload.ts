import { bucketImportConfig, normalizeCode } from "./config";
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
  ctx: ImportRoundContext,
  /** Row numbers to show in messages (stable across row removal). Default: index + 1. */
  rowLabels?: number[]
): ImportValidation {
  const label = (i: number) => rowLabels?.[i] ?? i + 1;
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];
  const err = (
    row: number | null,
    field: string,
    message: string,
    kind?: ImportIssue["kind"],
    fieldId?: string
  ) => errors.push({ row, field, message, kind, fieldId });
  const warn = (row: number | null, field: string, message: string) =>
    warnings.push({ row, field, message });

  // Round-config problems are reported once, not per row.
  // The unique-identifier field is optional: without one there is no
  // uniqueness check (and the importer creates no tag).
  const uniqueField = ctx.fields.find((f) => f.isUniqueIdentifier);
  if (uniqueField && uniqueField.type !== "TEXT")
    err(
      null,
      "round",
      `The unique-identifier field "${uniqueField.name}" must be a single-line text field.`
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
  // Every row sharing a code is flagged (not just the later ones).
  const uniqueValueOf = (r: ImportBucketRow): string => {
    const v = uniqueField
      ? r.fieldValues.find((fv) => fv.fieldId === uniqueField.id)?.value
      : undefined;
    return typeof v === "string" ? v : "";
  };
  const codeRows = new Map<string, number[]>();
  rows.forEach((r, i) => {
    if (isBlank(uniqueValueOf(r))) return;
    const c = normalizeCode(uniqueValueOf(r));
    codeRows.set(c, [...(codeRows.get(c) ?? []), i]);
  });
  const titleFirstRow = new Map<string, number>();

  rows.forEach((row, i) => {
    // title
    if (isBlank(row.title)) err(i, "title", "Title is required.");
    else {
      const t = row.title.trim().toLowerCase();
      if (titleFirstRow.has(t))
        warn(i, "title", `Same title as row ${label(titleFirstRow.get(t))}.`);
      else titleFirstRow.set(t, i);
    }

    // summary
    if (row.summary && row.summary.length > bucketImportConfig.summaryMaxLength)
      err(
        i,
        "summary",
        `Summary is ${row.summary.length} characters; the limit is ${bucketImportConfig.summaryMaxLength}.`
      );

    // unique identifier: required + unique in file and vs the round
    if (uniqueField) {
      const raw = uniqueValueOf(row);
      const un = uniqueField.name;
      if (isBlank(raw))
        err(i, un, `"${un}" is required.`, undefined, uniqueField.id);
      else {
        const code = normalizeCode(raw);
        const sharing = codeRows.get(code);
        if (sharing.length > 1)
          err(
            i,
            un,
            `${un} "${raw.trim()}" is used on rows ${sharing
              .map(label)
              .join(", ")}.`,
            "duplicateCode",
            uniqueField.id
          );
        if (ctx.existingCodes.has(code))
          err(
            i,
            un,
            `${un} "${raw.trim()}" already exists in this round.`,
            "existingCode",
            uniqueField.id
          );
      }
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
      const ferr = (m: string) => err(i, def.name, m, undefined, def.id);
      if (!def) {
        err(i, "fieldValues", `Unknown field id ${fv.fieldId} for this round.`);
        return;
      }
      if (seen.has(fv.fieldId)) {
        err(
          i,
          def.name,
          `Field "${def.name}" is given more than once.`,
          undefined,
          def.id
        );
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
          ferr(`"${def.name}" must be text.`);
          return;
        }
        if (def.limit && fv.value.length > def.limit)
          ferr(
            `"${def.name}" is ${fv.value.length} characters; the limit is ${def.limit}.`
          );
        if (def.options.length && !def.options.includes(fv.value))
          ferr(`"${fv.value}" is not an allowed value for "${def.name}".`);
      } else if (def.type === "BOOLEAN") {
        if (typeof fv.value !== "boolean")
          ferr(`"${def.name}" must be true or false.`);
      } else {
        ferr(`Field "${def.name}" (${def.type}) cannot be imported.`);
      }
    });
    ctx.fields
      .filter((f) => f.isRequired && !f.isUniqueIdentifier) // unique field: checked above
      .forEach((f) => {
        const given = row.fieldValues.find((fv) => fv.fieldId === f.id);
        if (!given || isBlank(given.value))
          err(i, f.name, `"${f.name}" is required.`, undefined, f.id);
      });
  });

  return { errors, warnings };
}
