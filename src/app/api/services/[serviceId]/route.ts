import { NextResponse } from 'next/server';
import { getPublicServiceById, ServiceNotFoundError } from '@/services/vendor-service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;

  try {
    const service = await getPublicServiceById(serviceId);
    return NextResponse.json({ service });
  } catch (error) {
    if (error instanceof ServiceNotFoundError) {
      return NextResponse.json({ error: 'Service not found.' }, { status: 404 });
    }
    console.error('[SERVICE_DETAIL_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to load service details.' },
      { status: 500 }
    );
  }
}
