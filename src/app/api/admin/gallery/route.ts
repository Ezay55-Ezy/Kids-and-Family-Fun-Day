import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth-utils';
import { listGalleryImages, createGalleryImage, getGalleryStats } from '@/services/gallery-service';
import { galleryFilterSchema, galleryImageSchema } from '@/validators/gallery.validator';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const { searchParams } = new URL(request.url);
  const parsed = galleryFilterSchema.safeParse({
    query: searchParams.get('query') || undefined,
    eventId: searchParams.get('eventId') || undefined,
    status: searchParams.get('status') || 'ALL',
    page: searchParams.get('page') || 1,
    limit: searchParams.get('limit') || 10,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid filters', details: parsed.error.flatten() }, { status: 400 });
  }
  const filters = parsed.data;

  const [result, stats] = await Promise.all([
    listGalleryImages(filters),
    getGalleryStats(),
  ]);

  return NextResponse.json({ ...result, stats });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const body = await request.json();
  const parsed = galleryImageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  try {
    const image = await createGalleryImage(data);
    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
