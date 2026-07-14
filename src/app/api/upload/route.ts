import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { cloudinary } from '@/lib/cloudinary';
import { checkRateLimit } from '@/lib/rate-limit';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = await checkRateLimit(`upload:${session.user.id}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 10MB' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'kids-family-fun-day',
      resource_type: 'image',
    });

    return NextResponse.json({ url: result.secure_url, filename: result.public_id });
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
