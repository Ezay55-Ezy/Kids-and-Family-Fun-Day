import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { registerVendor, VendorAlreadyExistsError } from '@/services/vendor-service';

const vendorRegisterSchema = z.object({
  businessName: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(500).optional(),
  price: z.number().positive(),
  serviceName: z.string().trim().min(3).max(100),
  serviceDescription: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json();
  const parsed = vendorRegisterSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const vendor = await registerVendor({
      userId: session.user.id,
      ...parsed.data,
    });

    return NextResponse.json(
      { message: 'Vendor application submitted.', vendor },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof VendorAlreadyExistsError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error('[VENDOR_REGISTRATION_FAILURE]', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
