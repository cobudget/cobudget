import type { Prepared } from "./prepareImport";

// Image state lives OUTSIDE the CSV cells, keyed by the stable row number, so
// it survives cell edits and row removal. Nothing is uploaded while the user
// works: a picked file stays on their computer ("pending", shown through a
// local preview URL) and is uploaded when they submit the import.

export type RowImage = {
  status: "pending" | "uploading" | "done" | "error";
  fileName: string;
  file: File;
  /** object URL of the local file (display only, never sent to the server) */
  previewUrl: string;
  /** set once uploaded (status "done") */
  small?: string;
  large?: string;
  /** last upload failure (status "error"); the upload is retried on submit */
  error?: string;
};

export type RowImages = Record<number, RowImage>;

/**
 * Overlays the image state on a prepared import (pure). Any chosen image
 * clears the row's "No image yet" warning and shows in the previews; the
 * payload carries the uploaded URLs once they exist, the local preview URL
 * before that (the submit step replaces those with the uploaded ones).
 */
export function applyImages(prepared: Prepared, images: RowImages): Prepared {
  return {
    ...prepared,
    rows: prepared.rows.map((r) => {
      const img = images[r.rowNumber];
      if (!img) return r;
      const done = img.status === "done" && img.small && img.large;
      return {
        ...r,
        payload: {
          ...r.payload,
          images: [
            done
              ? { small: img.small, large: img.large }
              : { small: img.previewUrl, large: img.previewUrl },
          ],
        },
        issues: r.issues.filter((i) => i.column !== "image"),
      };
    }),
  };
}
