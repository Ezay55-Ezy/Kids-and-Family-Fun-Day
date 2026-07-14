import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth-utils';
import { togglePublishGalleryImage } from '@/services/gallery-service';

export async function POST(_request: Request, { params }: { params: Promise<{ imageId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const { imageId } = await params;

  try {
    const image = await togglePublishGalleryImage(imageId);
    return NextResponse.json(image);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
