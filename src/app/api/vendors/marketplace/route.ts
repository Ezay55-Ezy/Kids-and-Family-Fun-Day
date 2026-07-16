import { NextResponse } from 'next/server';
import { listMarketplaceVendors } from '@/services/vendor-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;
  const category = searchParams.get('category') || undefined;
  const sort = searchParams.get('sort') || 'name';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

  try {
    const result = await listMarketplaceVendors({ search, category, sort, page, limit });
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('[MARKETPLACE_LIST_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to load marketplace vendors.' },
      { status: 500 }
    );
  }
}
