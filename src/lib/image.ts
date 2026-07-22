import { cloudinary } from '@/lib/cloudinary';

export interface ImageUploadResult {
  url: string;
  publicId: string;
}

export async function uploadImage(
  file: File,
  folder = 'kids-family-fun-day'
): Promise<ImageUploadResult> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
  });

  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
