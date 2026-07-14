import { NextResponse } from 'next/server';
import { getPublicVendorProfile, VendorNotFoundError } from '@/services/vendor-service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const { vendorId } = await params;

  try {
    const vendor = await getPublicVendorProfile(vendorId);
    return NextResponse.json({ vendor });
  } catch (error) {
    if (error instanceof VendorNotFoundError) {
      return NextResponse.json({ error: 'Vendor not found.' }, { status: 404 });
    }
    console.error('[VENDOR_PROFILE_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to load vendor profile.' },
      { status: 500 }
    );
  }
}
