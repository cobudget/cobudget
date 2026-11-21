import slugify from "./slugify";

// importKey: the stable CSV column name of a round custom field (bucket
// import). Platform slug convention (utils/slugify: lower-case, hyphens),
// generated once when the field is created and NOT changed by a rename.
// The SQL backfill in migration 20261121120000_field_import_key mirrors
// generateImportKey for ASCII names.

/** Longest key; keeps CSV headers readable. A -N suffix still fits within it. */
export const MAX_IMPORT_KEY_LENGTH = 40;

/** Column names the importer owns; a field key can never equal one of them. */
export const RESERVED_KEYS = ["title", "summary", "image"];
export const budgetColumnPattern = {
  item: /^budget-item-(\d+)$/,
  amount: /^budget-amount-(\d+)$/,
};

export const isReservedKey = (key: string) =>
  RESERVED_KEYS.includes(key) ||
  budgetColumnPattern.item.test(key) ||
  budgetColumnPattern.amount.test(key);

const KEY_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;

/** Error message for an unacceptable key, or null when it is valid. */
export function validateImportKey(key: string): string | null {
  if (!key) return "Import key is required.";
  if (key.length > MAX_IMPORT_KEY_LENGTH)
    return `Import key can be at most ${MAX_IMPORT_KEY_LENGTH} characters.`;
  if (!KEY_PATTERN.test(key))
    return "Use lower-case letters, numbers, hyphens and underscores only (start with a letter or number).";
  if (isReservedKey(key))
    return `"${key}" is reserved for a built-in import column.`;
  return null;
}

const base = (name: string) => {
  let b = slugify(name).slice(0, MAX_IMPORT_KEY_LENGTH).replace(/-+$/, "");
  if (!b) b = "field";
  if (isReservedKey(b)) b += "-field";
  return b;
};

/**
 * Key for a new field: slug of its name, de-duplicated against the keys
 * already used in the round with -2, -3, ... (length cap respected).
 */
export function generateImportKey(
  name: string,
  taken: Iterable<string | null | undefined>
): string {
  const used = new Set(Array.from(taken).filter(Boolean));
  const b = base(name);
  let key = b;
  for (let n = 2; used.has(key); n++) {
    const suffix = `-${n}`;
    key = b.slice(0, MAX_IMPORT_KEY_LENGTH - suffix.length) + suffix;
  }
  return key;
}
