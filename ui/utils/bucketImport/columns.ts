import { bucketImportConfig } from "./config";
import type { ImportFieldDef } from "./types";

// The CSV column model, generated from the round's custom fields. Used by the
// parser, the template, the column reference and the row editor, so none of
// them can drift apart. Columns = built-ins + one per importable field, named
// by Field.importKey (see utils/fieldKey.ts). Budget lines
// (budget_item_N / budget_amount_N) are discovered from the file's headers.

/** Field types the importer can fill from a CSV cell. */
export const importableTypes = ["TEXT", "MULTILINE_TEXT", "ENUM", "BOOLEAN"];

export type ImportColumn = {
  /** CSV header */
  column: string;
  target: "title" | "summary" | "image" | "field";
  /** target === "field" */
  field?: ImportFieldDef;
  required: boolean;
  /** The round's unique-identifier column */
  unique?: boolean;
  description: string;
};

export const builtInColumns: ImportColumn[] = [
  {
    column: "title",
    target: "title",
    required: true,
    description: "Short, clear title of the bucket.",
  },
  {
    column: "summary",
    target: "summary",
    required: true,
    description: `Shown on cards and at the top of the page. Plain text, max ${bucketImportConfig.summaryMaxLength} characters.`,
  },
  {
    column: "image",
    target: "image",
    required: false,
    description:
      "Image URL (e.g. Cloudinary). Images can also be attached after upload; rows without one get a warning.",
  },
];

export const isImportable = (f: ImportFieldDef) =>
  !!f.importKey && importableTypes.includes(f.type);

/** Human description of what a field column accepts (from the field config). */
export function describeField(f: ImportFieldDef): string {
  const parts: string[] = [];
  if (f.isUniqueIdentifier)
    parts.push(
      "Unique in the file and the round; also becomes a tag. Must not already exist in the round."
    );
  if (f.type === "BOOLEAN") parts.push("true/false (or yes/no).");
  else if (f.options?.length)
    parts.push(`One of the allowed values: ${f.options.join(" · ")}.`);
  else if (f.type === "MULTILINE_TEXT")
    parts.push("Text (Markdown supported).");
  else parts.push("Text.");
  if (f.limit && (f.type === "TEXT" || f.type === "MULTILINE_TEXT"))
    parts.push(`Max ${f.limit} characters.`);
  if (f.description) parts.push(f.description);
  return parts.join(" ");
}

/** Built-ins first, then the round's importable fields in their form order. */
export function buildColumns(fields: ImportFieldDef[]): ImportColumn[] {
  return [
    ...builtInColumns,
    ...fields.filter(isImportable).map(
      (field): ImportColumn => ({
        column: field.importKey as string,
        target: "field",
        field,
        required: !!field.isRequired || !!field.isUniqueIdentifier,
        unique: !!field.isUniqueIdentifier,
        description: describeField(field),
      })
    ),
  ];
}

/** Fields of the round that have no CSV column (not importable), for a note. */
export const skippedFields = (fields: ImportFieldDef[]) =>
  fields.filter((f) => !isImportable(f));
