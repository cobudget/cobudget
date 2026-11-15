// GIAG-SPECIFIC: everything in this file describes the Give it a Go import
// format. For a general (prod) version this becomes round-configurable.
// See worktracks/02/01-csv-bucket-import-feature/context.md ("GIAG-SPECIFIC seams").

export const bucketImportConfig = {
  // Round custom field holding the proposal's reference code. It must already
  // exist on the target round; the importer never creates or edits fields.
  referenceCodeFieldName: "Reference Code",
  // Reference codes must be unique across the file and the round's existing
  // buckets (the platform enforces nothing itself). Each code also becomes a
  // round tag (the tag is what the CSV export and filters use).
  createTagFromReferenceCode: true,
  summaryMaxLength: 160,
  // Safety caps for the commit payload (Apollo body limit is ~1 MB).
  maxRows: 200,
  maxBudgetItemsPerRow: 100,
  // BudgetItem.min is a Postgres INT4, in minor units.
  maxAmountMinor: 2147483647,
  // GIAG defaults: published immediately and open for funding, admin is
  // cocreator, no events published (publish-bucket emails every member).
  publishImmediately: true,
  approveImmediately: true,
} as const;

/** Normalise names for comparison: curly -> straight apostrophes, trim, lowercase. */
export const normalizeName = (name: string) =>
  name.replace(/[‘’ʼ]/g, "'").trim().toLowerCase();

/** Reference codes compare trimmed and case-insensitive (stricter than the tag index). */
export const normalizeCode = (code: string) => code.trim().toLowerCase();
