export type UploadedImage = { small: string; large: string };

const CLOUDINARY_UPLOAD_URL =
  "https://api.cloudinary.com/v1_1/dreamswtf/image/upload";

/**
 * Uploads one image to Cloudinary with the `dreams` preset. The preset's
 * eager transformations are positional: eager[0] = large, eager[1] = small.
 * Rejects with Cloudinary's error text when the upload is refused.
 */
export async function uploadBucketImage(file: File): Promise<UploadedImage> {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "dreams");

  const res = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: data,
  });
  const json = await res.json();
  if (!json.eager?.[0] || !json.eager?.[1])
    throw new Error(
      json.error?.message ?? "Image upload failed (no image returned)"
    );
  return { small: json.eager[1].secure_url, large: json.eager[0].secure_url };
}
