import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth-utils';
import { getGalleryImageById, updateGalleryImage, deleteGalleryImage } from '@/services/gallery-service';
import { galleryImageUpdateSchema } from '@/validators/gallery.validator';

export async function GET(_request: Request, { params }: { params: Promise<{ imageId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const { imageId } = await params;
  const image = await getGalleryImageById(imageId);
  if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 });

  return NextResponse.json(image);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ imageId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const { imageId } = await params;
  const body = await request.json();
  const data = galleryImageUpdateSchema.parse(body);

  try {
    const image = await updateGalleryImage(imageId, data);
    return NextResponse.json(image);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ imageId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const { imageId } = await params;

  try {
    await deleteGalleryImage(imageId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
