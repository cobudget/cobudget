// Commit payload shape shared by the client preview and the server mutation.
// All money is in MINOR units (pence); conversion happens before this point.

export type ImportBudgetItem = { description: string; amount: number };

export type ImportFieldValue = { fieldId: string; value: unknown };

export type ImportImage = { small?: string | null; large?: string | null };

export type ImportBucketRow = {
  title: string;
  summary?: string | null;
  fieldValues: ImportFieldValue[];
  budgetItems: ImportBudgetItem[];
  images?: ImportImage[] | null;
};

export type ImportFieldDef = {
  id: string;
  name: string;
  type: string; // FieldType
  limit?: number | null;
  options: string[];
  isRequired: boolean;
  description?: string | null;
  /** CSV column name (Field.importKey); null = not importable yet */
  importKey?: string | null;
  isUniqueIdentifier?: boolean;
};

export type ImportRoundContext = {
  fields: ImportFieldDef[];
  /** Already normalised with normalizeCode. */
  existingCodes: Set<string>;
};

export type ImportIssue = {
  row: number | null; // 0-based index into the payload, null = whole import
  field: string;
  /** Set for issues about a round field (maps the issue to its CSV column) */
  fieldId?: string;
  message: string;
  /** Machine-readable tag for issues the UI acts on (values of the unique-identifier field) */
  kind?: "duplicateCode" | "existingCode";
};

export type ImportValidation = {
  errors: ImportIssue[];
  warnings: ImportIssue[];
};
