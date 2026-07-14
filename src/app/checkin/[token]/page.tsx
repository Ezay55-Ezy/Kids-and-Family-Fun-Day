import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { validateTicketCode, ScanResult } from '@/services/booking-service';
import { formatTime } from '@/lib/format';

export const metadata = {
  title: 'Ticket Check-In',
};

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    const { token } = await params;
    redirect(`/auth/login?callbackUrl=/checkin/${token}`);
  }

  const adminUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!adminUser || adminUser.role !== 'ADMIN') {
    redirect('/');
  }

  const { token } = await params;
  const outcome = await validateTicketCode(token);

  const isValid = outcome.result === ScanResult.VALID;
  const isAlreadyChecked = outcome.result === ScanResult.ALREADY_CHECKED_IN;
  const isCancelled = outcome.result === ScanResult.CANCELLED;
  const isError = !isValid && !isAlreadyChecked && !isCancelled;

  const bgClass = isValid ? 'bg-grass' : isAlreadyChecked ? 'bg-sun' : 'bg-coral';
  const iconBgClass = isValid ? 'bg-grass/20' : isAlreadyChecked ? 'bg-sun/20' : 'bg-coral/20';

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${bgClass}`}>
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${iconBgClass} mb-6`}>
          {isValid ? (
            <svg className="w-10 h-10 text-paper" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-paper" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </div>

        {/* Result text */}
        <h1 className="font-display text-3xl font-bold text-paper mb-2">
          {isValid && 'Valid \u2014 Checked In'}
          {isAlreadyChecked && 'Already Checked In'}
          {isCancelled && 'Cancelled \u2014 Invalid'}
          {isError && 'Not a Valid Ticket'}
        </h1>

        {/* Details */}
        {outcome.booking && (
          <>
            <p className="text-paper/80 text-xl mt-4 font-medium">
              {outcome.booking.attendeeName}
            </p>
            <p className="text-paper/60 text-base mt-1">
              {outcome.booking.eventTitle}
            </p>
          </>
        )}

        {isAlreadyChecked && outcome.booking?.checkedInAt && (
          <p className="text-paper/50 text-sm mt-3">
            First checked in at {formatTime(outcome.booking.checkedInAt)}
          </p>
        )}

        {isValid && (
          <p className="text-paper/50 text-sm mt-3">
            Access granted
          </p>
        )}

        {/* Scan another link */}
        <p className="mt-10 text-paper/40 text-xs">
          Scan the next ticket with your camera app
        </p>
      </div>
    </div>
  );
}
