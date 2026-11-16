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

// --- CSV column model ------------------------------------------------------

export type BaseColumn = {
  /** CSV header */
  column: string;
  /** Where the value goes: a bucket attribute or a round custom field by name */
  target: "title" | "summary" | "image" | "referenceCode" | "field";
  /** Round custom field name (target === "field"); matched with normalizeName */
  fieldName?: string;
  required: boolean;
  description: string;
};

// GIAG-SPECIFIC: the July Key Fund format. Field names must match the
// round's existing custom fields (they are never created by the importer).
export const baseColumns: BaseColumn[] = [
  {
    column: "proposal_title",
    target: "title",
    required: true,
    description: "Short, clear title of the proposal.",
  },
  {
    column: "proposal_summary",
    target: "summary",
    required: true,
    description: `Shown on cards and at the top of the page. Plain text, max ${bucketImportConfig.summaryMaxLength} characters.`,
  },
  {
    column: "reference_code",
    target: "referenceCode",
    required: true,
    description:
      "Unique code, e.g. GF10. Also becomes a tag. Must not already exist in the round.",
  },
  {
    column: "image_url",
    target: "image",
    required: false,
    description:
      "Image URL (e.g. Cloudinary). Images can also be attached after upload; rows without one get a warning.",
  },
  {
    column: "priority_area",
    target: "field",
    fieldName: "Priority Area",
    required: false,
    description: "One of the allowed values configured on the round.",
  },
  {
    column: "report_date",
    target: "field",
    fieldName: "Report Date",
    required: false,
    description: "Free text date, e.g. 19.06.26.",
  },
  {
    column: "assessor",
    target: "field",
    fieldName: "Assessor",
    required: false,
    description: "Name of the assessor.",
  },
  {
    column: "key_fund_comments",
    target: "field",
    fieldName: "Key Fund's Comments",
    required: false,
    description: "Key Fund's commentary (Markdown supported).",
  },
  {
    column: "project_description",
    target: "field",
    fieldName: "Project Description",
    required: false,
    description: "Description of the project (Markdown supported).",
  },
  {
    column: "what_trying_to_achieve",
    target: "field",
    fieldName: "What are they trying to achieve in the project?",
    required: false,
    description: "What the applicant is trying to achieve (Markdown).",
  },
  {
    column: "who_what_how_long",
    target: "field",
    fieldName: "Who will do what? How long will it take? How do you make sure?",
    required: false,
    description: "Who does what, how long, quality assurance (Markdown).",
  },
  {
    column: "safety_measures",
    target: "field",
    fieldName:
      "How will you make sure that people that engage in the activity are safe?",
    required: false,
    description: "How participant safety is ensured (Markdown).",
  },
  {
    column: "who_benefits",
    target: "field",
    fieldName:
      "Who is the main group of people that will benefit from the project?",
    required: false,
    description: "Main group of people who benefit (Markdown).",
  },
  {
    column: "sustainability",
    target: "field",
    fieldName: "How will the activity continue after the grant has been spent?",
    required: false,
    description: "How the activity continues after the grant (Markdown).",
  },
];

// GIAG-SPECIFIC: budget lines are budget_item_N + budget_amount_N, any N >= 1.
export const budgetColumnPattern = {
  item: /^budget_item_(\d+)$/,
  amount: /^budget_amount_(\d+)$/,
};

// GIAG-SPECIFIC: template content/name
export const templateFileName = "bucket-import-template.csv";
export const templateBudgetPairs = 5;
