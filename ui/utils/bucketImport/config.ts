// Import settings. The CSV columns are NOT configured here: they are generated
// from the round's custom fields (utils/bucketImport/columns.ts), keyed by
// Field.importKey. Only limits and defaults live in this file.

export const bucketImportConfig = {
  // The round's unique-identifier field (Field.isUniqueIdentifier) must be unique
  // across the file and the round's existing buckets; its value also becomes a
  // round tag (what the CSV export and filters use). Rounds without one skip both.
  summaryMaxLength: 160,
  // Safety caps for the commit payload (Apollo body limit is ~1 MB).
  maxRows: 200,
  maxBudgetItemsPerRow: 100,
  // BudgetItem.min is a Postgres INT4, in minor units.
  maxAmountMinor: 2147483647,
  // Defaults: published immediately and open for funding, admin is
  // cocreator, no events published (publish-bucket emails every member).
  publishImmediately: true,
  approveImmediately: true,
} as const;

/** Unique-identifier values compare trimmed and case-insensitive (stricter than the tag index). */
export const normalizeCode = (code: string) => code.trim().toLowerCase();

export const templateFileName = "bucket-import-template.csv";
export const templateBudgetPairs = 5;
