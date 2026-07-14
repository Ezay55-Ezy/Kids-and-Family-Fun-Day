import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth-utils';
import { reportFilterSchema } from '@/validators/report.validator';
import { getEventsReport, getBookingsReport, getUsersReport, getVendorsReport, getReviewsReport } from '@/services/report-service';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { await requireAdmin(session.user.id); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const { searchParams } = new URL(request.url);
  const filters = reportFilterSchema.parse({
    type: searchParams.get('type') || 'events',
    query: searchParams.get('query') || undefined,
    status: searchParams.get('status') || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
    eventId: searchParams.get('eventId') || undefined,
    vendorId: searchParams.get('vendorId') || undefined,
    role: searchParams.get('role') || undefined,
    page: searchParams.get('page') || 1,
    limit: searchParams.get('limit') || 20,
  });

  switch (filters.type) {
    case 'events':
      return NextResponse.json(await getEventsReport(filters));
    case 'bookings':
      return NextResponse.json(await getBookingsReport(filters));
    case 'users':
      return NextResponse.json(await getUsersReport(filters));
    case 'vendors':
      return NextResponse.json(await getVendorsReport(filters));
    case 'reviews':
      return NextResponse.json(await getReviewsReport(filters));
    default:
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
  }
}
