import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth-utils';
import {
  getVendorById,
  approveVendor,
  activateVendor,
  rejectVendor,
  VendorNotFoundError,
  VendorNotPendingReviewError,
  VendorNotAwaitingPaymentError,
} from '@/services/vendor-service';

async function authorize() {
  const session = await auth();
  if (!session?.user?.id) return null;
  try { await requireAdmin(session.user.id); return session; } catch { return null; }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const session = await authorize();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { vendorId } = await params;

  try {
    const vendor = await getVendorById(vendorId);
    return NextResponse.json({ vendor });
  } catch (error) {
    if (error instanceof VendorNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    throw error;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const session = await authorize();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { vendorId } = await params;
  const json = await request.json();
  const { action, reason } = json;

  if (!action || !['approve', 'reject', 'activate'].includes(action)) {
    return NextResponse.json(
      { error: 'Invalid action. Must be "approve", "reject", or "activate".' },
      { status: 400 }
    );
  }

  if (action === 'reject' && (!reason || typeof reason !== 'string' || !reason.trim())) {
    return NextResponse.json(
      { error: 'Rejection reason is required.' },
      { status: 400 }
    );
  }

  try {
    if (action === 'approve') {
      await approveVendor(vendorId, session.user.id);
      return NextResponse.json({ message: 'Vendor application approved. Awaiting payment.' });
    } else if (action === 'activate') {
      await activateVendor(vendorId, session.user.id);
      return NextResponse.json({ message: 'Vendor account activated.' });
    } else {
      await rejectVendor(vendorId, reason.trim(), session.user.id);
      return NextResponse.json({ message: 'Vendor application rejected.' });
    }
  } catch (error) {
    if (error instanceof VendorNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof VendorNotPendingReviewError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof VendorNotAwaitingPaymentError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error('[VENDOR_REVIEW_FAILURE]', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
