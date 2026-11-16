import { useRef } from "react";
import type { RowImage } from "utils/bucketImport/images";

// Thumbnail + upload / replace / clear for one row. `thumb` is whatever image
// the row will import with (uploaded file or a valid image_url cell).
const ImageControl = ({
  thumb,
  image,
  onAttach,
  onClear,
}: {
  thumb: string | null;
  image?: RowImage;
  onAttach: (file: File) => void;
  onClear: () => void;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const uploading = image?.status === "uploading";
  return (
    <div
      className="flex items-center gap-2 mt-1"
      onClick={(e) => e.stopPropagation()}
    >
      {thumb && (
        <img
          src={thumb}
          alt=""
          className="h-10 w-10 object-cover rounded flex-none"
        />
      )}
      <div className="text-xs space-y-0.5">
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onAttach(file);
            e.target.value = ""; // allow re-selecting the same file
          }}
        />
        <div className="flex gap-2">
          <button
            type="button"
            className="underline text-gray-700 disabled:opacity-50"
            disabled={uploading}
            onClick={() => ref.current?.click()}
          >
            {image?.status === "done" ? "Replace" : "Upload image"}
          </button>
          {image && !uploading && (
            <button
              type="button"
              className="underline text-gray-700"
              onClick={onClear}
            >
              {image.status === "error" ? "Dismiss" : "Clear"}
            </button>
          )}
        </div>
        {uploading && <div className="text-gray-600">Uploading…</div>}
        {image?.status === "done" && (
          <div
            className="text-gray-600 truncate max-w-40"
            title={image.fileName}
          >
            {image.fileName}
          </div>
        )}
        {image?.status === "error" && (
          <div className="text-red-700">
            Upload failed ({image.fileName}): {image.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageControl;
