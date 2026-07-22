import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  getVendorProfile,
  getVendorServices,
  createVendorService,
  VendorNotFoundError,
  VendorNotActiveError,
} from '@/services/vendor-service';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendor = await getVendorProfile(session.user.id);
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor profile not found.' }, { status: 404 });
  }

  const services = await getVendorServices(vendor.id);
  return NextResponse.json({ services });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendor = await getVendorProfile(session.user.id);
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor profile not found.' }, { status: 404 });
  }

  const json = await request.json();
  const { name, shortDescription, description, category, price, pricingType, imageUrl } = json;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Service name is required.' }, { status: 400 });
  }
  if (!description || typeof description !== 'string' || !description.trim()) {
    return NextResponse.json({ error: 'Description is required.' }, { status: 400 });
  }
  if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
    return NextResponse.json({ error: 'Valid price is required.' }, { status: 400 });
  }
  if (name.trim().length > 100) {
    return NextResponse.json({ error: 'Name must be 100 characters or less.' }, { status: 400 });
  }
  if (description.trim().length > 2000) {
    return NextResponse.json({ error: 'Description must be 2000 characters or less.' }, { status: 400 });
  }

  try {
    const service = await createVendorService(vendor.id, {
      name: name.trim(),
      shortDescription: shortDescription?.trim() || undefined,
      description: description.trim(),
      category: category || undefined,
      price: Number(price),
      pricingType: pricingType || undefined,
      imageUrl: imageUrl || undefined,
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    if (error instanceof VendorNotActiveError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('[VENDOR_SERVICE_CREATE_FAILURE]', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
