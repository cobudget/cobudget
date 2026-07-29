// Cloudinary unsigned uploads (preset "dreams") reject files over 10MB.
export const MAX_PASTED_IMAGE_BYTES = 9 * 1024 * 1024;

export function dataUriToFile(
  dataUri: string,
  baseName = "pasted-image"
): File | null {
  const match = /^data:([a-z0-9.+-]+\/[a-z0-9.+-]+)?(;charset=[^;,]+)?(;base64)?,/i.exec(
    dataUri
  );
  if (!match) return null;
  const mime = match[1] || "application/octet-stream";
  const isBase64 = !!match[3];
  const data = dataUri.slice(match[0].length);
  try {
    let bytes: Uint8Array;
    if (isBase64) {
      const binary = atob(data);
      bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
    } else {
      bytes = new TextEncoder().encode(decodeURIComponent(data));
    }
    const ext = (mime.split("/")[1] ?? "bin").split("+")[0];
    const buffer = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    ) as ArrayBuffer;
    return new File([buffer], `${baseName}.${ext}`, { type: mime });
  } catch {
    return null;
  }
}

// Mirrors utils/uploadImageFiles.ts (same cloud + preset) but returns null on
// failure instead of alert()ing, since pasted-image uploads run in the
// background rather than from an explicit user action.
export async function uploadPastedImage(file: File): Promise<string | null> {
  try {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "dreams");
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dreamswtf/image/upload",
      { method: "POST", body: data }
    );
    if (!res.ok) {
      console.error("Pasted image upload failed", res.status, await res.text());
      return null;
    }
    const json = await res.json();
    return json.secure_url ?? null;
  } catch (err) {
    console.error("Pasted image upload failed", err);
    return null;
  }
}
