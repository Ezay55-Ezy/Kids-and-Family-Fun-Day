import { NextResponse } from 'next/server';
import { getPublishedGalleryImages } from '@/services/gallery-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId') || undefined;

  const images = await getPublishedGalleryImages(eventId);
  return NextResponse.json(images);
}
