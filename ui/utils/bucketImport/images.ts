import type { Prepared } from "./prepareImport";

// Image state lives OUTSIDE the CSV cells, keyed by the stable row number, so
// it survives cell edits and row removal. An uploaded image overrides the
// row's image_url cell; clearing it falls back to the cell.

export type RowImage =
  | { status: "uploading"; fileName: string; attempt: number }
  | {
      status: "done";
      fileName: string;
      attempt: number;
      small: string;
      large: string;
    }
  | { status: "error"; fileName: string; attempt: number; error: string };

export type RowImages = Record<number, RowImage>;

/**
 * Overlays the image state on a prepared import (pure). Done images replace
 * the payload image and drop the row's image_url issues; a pending upload
 * blocks the import; a failed upload leaves the row as the CSV had it.
 */
export function applyImages(prepared: Prepared, images: RowImages): Prepared {
  const imageIssue = (i: { column: string | null }) => i.column === "image_url";
  return {
    ...prepared,
    rows: prepared.rows.map((r) => {
      const img = images[r.rowNumber];
      if (!img || img.status === "error") return r;
      if (img.status === "done")
        return {
          ...r,
          payload: {
            ...r.payload,
            images: [{ small: img.small, large: img.large }],
          },
          issues: r.issues.filter((i) => !imageIssue(i)),
        };
      return {
        ...r,
        issues: [
          ...r.issues.filter((i) => !imageIssue(i)),
          {
            severity: "error" as const,
            column: "image_url",
            message: `Image "${img.fileName}" is still uploading.`,
          },
        ],
      };
    }),
  };
}
