import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  getVendorProfile,
  getVendorServiceById,
  updateVendorService,
  archiveVendorService,
  publishVendorService,
  unpublishVendorService,
  ServiceNotFoundError,
  ServiceOwnershipMismatchError,
  VendorNotActiveError,
} from '@/services/vendor-service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendor = await getVendorProfile(session.user.id);
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor profile not found.' }, { status: 404 });
  }

  const { serviceId } = await params;

  try {
    const service = await getVendorServiceById(serviceId, vendor.id);
    return NextResponse.json({ service });
  } catch (error) {
    if (error instanceof ServiceNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ServiceOwnershipMismatchError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendor = await getVendorProfile(session.user.id);
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor profile not found.' }, { status: 404 });
  }

  const { serviceId } = await params;
  const json = await request.json();
  const { action } = json;

  try {
    if (action === 'publish') {
      await publishVendorService(serviceId, vendor.id);
      return NextResponse.json({ message: 'Service published.' });
    }

    if (action === 'unpublish') {
      await unpublishVendorService(serviceId, vendor.id);
      return NextResponse.json({ message: 'Service unpublished.' });
    }

    if (action === 'archive') {
      await archiveVendorService(serviceId, vendor.id);
      return NextResponse.json({ message: 'Service archived.' });
    }

    const { name, shortDescription, description, category, price, pricingType, imageUrl } = json;

    if (name !== undefined && (!name || typeof name !== 'string')) {
      return NextResponse.json({ error: 'Invalid name.' }, { status: 400 });
    }
    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
      return NextResponse.json({ error: 'Invalid price.' }, { status: 400 });
    }

    const service = await updateVendorService(serviceId, vendor.id, {
      name: name?.trim(),
      shortDescription: shortDescription?.trim(),
      description: description?.trim(),
      category,
      price: price !== undefined ? Number(price) : undefined,
      pricingType,
      imageUrl,
    });

    return NextResponse.json({ service });
  } catch (error) {
    if (error instanceof ServiceNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ServiceOwnershipMismatchError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof VendorNotActiveError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('[VENDOR_SERVICE_UPDATE_FAILURE]', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
