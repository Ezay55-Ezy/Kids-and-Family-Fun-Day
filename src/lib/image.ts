/**
 * Image upload abstraction layer.
 *
 * Currently implements a base64/data-URL placeholder that stores images
 * as data URIs. Swap the implementation of `uploadImage` and `deleteImage`
 * when a Cloudinary (or other provider) integration is ready — no other
 * code in the application needs to change.
 */

export interface ImageUploadResult {
  url: string;
  publicId?: string;
}

/**
 * Upload an image file and return its public URL.
 *
 * @param file - The file to upload (from a FileList or drop event)
 * @param folder - Optional folder/path prefix (e.g. "events")
 */
export async function uploadImage(
  file: File,
  folder?: string
): Promise<ImageUploadResult> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const dataUrl = `data:${file.type};base64,${base64}`;

  return { url: dataUrl };
}

/**
 * Delete an image by its publicId (no-op in the base64 implementation).
 */
export async function deleteImage(_publicId: string): Promise<void> {
  // no-op — base64 images have no server-side storage to clean up
}
