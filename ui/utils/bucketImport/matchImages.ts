import slugify from "../slugify";
import { normalizeCode } from "./config";

// Pure filename -> row matching for the batch image upload. Order of
// strategies: unique identifier, then title slug, then order number. The first
// strategy that finds any row decides; it is never overridden by a weaker one.
// Ambiguity is reported, never guessed.

export type MatchFile = { id: string; name: string };
export type MatchRow = {
  rowNumber: number; // stable row number, also the "order number"
  /** Value of the round's unique-identifier field ('' when none) */
  uniqueValue: string;
  title: string;
};

export type MatchBy = "code" | "title" | "number";

export type MatchResult = {
  assigned: { fileId: string; rowNumber: number; by: MatchBy }[];
  ambiguous: {
    fileId: string;
    by: MatchBy;
    candidates: number[];
    reason: "multiple-rows" | "multiple-files" | "row-has-image";
  }[];
  unmatched: string[]; // file ids
};

/** "GF01.final.PNG" -> "gf01.final" (only the last extension is dropped). */
export const fileStem = (name: string) =>
  name
    .replace(/^.*[\\/]/, "")
    .replace(/\.[^.]*$/, "")
    .trim()
    .toLowerCase();

const candidatesFor = (
  stem: string,
  rows: MatchRow[]
): { by: MatchBy; rows: number[] } | null => {
  const code = normalizeCode(stem);
  if (code) {
    const hit = rows.filter((r) => normalizeCode(r.uniqueValue) === code);
    if (hit.length) return { by: "code", rows: hit.map((r) => r.rowNumber) };
  }
  const slug = slugify(stem);
  if (slug) {
    const hit = rows.filter((r) => slugify(r.title) === slug);
    if (hit.length) return { by: "title", rows: hit.map((r) => r.rowNumber) };
  }
  if (/^\d+$/.test(stem)) {
    const n = Number(stem);
    const hit = rows.filter((r) => r.rowNumber === n);
    if (hit.length) return { by: "number", rows: hit.map((r) => r.rowNumber) };
  }
  return null;
};

/**
 * @param occupied row numbers that already have an image: a file that would
 * land there is reported as a conflict instead of silently replacing it.
 */
export function matchFiles(
  files: MatchFile[],
  rows: MatchRow[],
  occupied: Set<number> = new Set()
): MatchResult {
  const result: MatchResult = { assigned: [], ambiguous: [], unmatched: [] };
  const single: { fileId: string; rowNumber: number; by: MatchBy }[] = [];

  for (const f of files) {
    const c = candidatesFor(fileStem(f.name), rows);
    if (!c) result.unmatched.push(f.id);
    else if (c.rows.length > 1)
      result.ambiguous.push({
        fileId: f.id,
        by: c.by,
        candidates: c.rows,
        reason: "multiple-rows",
      });
    else single.push({ fileId: f.id, rowNumber: c.rows[0], by: c.by });
  }

  const perRow = new Map<number, typeof single>();
  single.forEach((s) =>
    perRow.set(s.rowNumber, [...(perRow.get(s.rowNumber) ?? []), s])
  );
  for (const s of single) {
    const claimants = perRow.get(s.rowNumber) ?? [];
    if (claimants.length > 1)
      result.ambiguous.push({
        fileId: s.fileId,
        by: s.by,
        candidates: [s.rowNumber],
        reason: "multiple-files",
      });
    else if (occupied.has(s.rowNumber))
      result.ambiguous.push({
        fileId: s.fileId,
        by: s.by,
        candidates: [s.rowNumber],
        reason: "row-has-image",
      });
    else result.assigned.push(s);
  }
  return result;
}

/**
 * Files the name matcher could not place go, in the order given, to the rows
 * that still have no image (in row order). Returns the pairs and the files
 * left over when there are more files than free rows.
 */
export function placeInOrder(
  fileIds: string[],
  freeRows: number[]
): { placed: { fileId: string; rowNumber: number }[]; leftover: string[] } {
  const n = Math.min(fileIds.length, freeRows.length);
  return {
    placed: fileIds
      .slice(0, n)
      .map((fileId, i) => ({ fileId, rowNumber: freeRows[i] })),
    leftover: fileIds.slice(n),
  };
}

/** Runs async tasks with at most `limit` in flight (FIFO). */
export function createLimiter(limit: number) {
  let active = 0;
  const queue: (() => void)[] = [];
  const next = () => {
    if (active >= limit) return;
    const start = queue.shift();
    if (start) start();
  };
  return <T>(task: () => Promise<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      queue.push(() => {
        active++;
        task()
          .then(resolve, reject)
          .finally(() => {
            active--;
            next();
          });
      });
      next();
    });
}
