import { NextResponse } from 'next/server';
import { getPublishedGalleryImages } from '@/services/gallery-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId') || undefined;
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '30', 10)));
  const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));

  const images = await getPublishedGalleryImages(eventId, limit, offset);
  return NextResponse.json(images, {
    headers: {
      'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
    },
  });
}
