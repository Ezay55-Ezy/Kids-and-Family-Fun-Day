import { NextResponse } from 'next/server';
import { listPublishedEvents } from '@/services/event-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get('search') || undefined;
  const sort = (searchParams.get('sort') as 'newest' | 'soonest' | 'oldest') || undefined;
  const timeframe = (searchParams.get('timeframe') as 'upcoming' | 'past') || undefined;

  try {
    const events = await listPublishedEvents({ search, sort, timeframe });
    return NextResponse.json({ events }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('[PUBLIC_EVENTS_API_ERROR]', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
