import { prisma } from '@/lib/prisma';
import { formatDate, formatTime, formatCurrency } from '@/lib/format';
import { Resend } from 'resend';

let resend: Resend;
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

const FROM =
  process.env.EMAIL_FROM ?? 'onboarding@resend.dev';
const SENDER_NAME = 'Kids & Family Fun Day Kenya';

function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_CHECKIN_BASE_URL ??
    process.env.AUTH_URL ??
    'http://localhost:3000'
  );
}

function confirmationHtml(opts: {
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  items: { name: string; qty: number; unitPrice: string; subtotal: string }[];
  totalAmount: string;
  walletUrl: string;
}) {
  const itemsRows = opts.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #E7E5E4;">${item.name}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #E7E5E4; text-align: center;">${item.qty}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #E7E5E4; text-align: right;">${item.unitPrice}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #E7E5E4; text-align: right;">${item.subtotal}</td>
        </tr>`,
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#F5F5F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F5F4;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:8px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background-color:#0F766E;padding:32px 32px 24px;text-align:center;">
            <h1 style="margin:0;font-size:22px;font-weight:700;color:#FCA311;">Booking Confirmed</h1>
            <p style="margin:6px 0 0;font-size:14px;color:#FFFFFF;">Kids &amp; Family Fun Day Kenya</p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px;color:#292524;">
          <p style="margin:0 0 4px;font-size:16px;">Hi ${opts.userName},</p>
          <p style="margin:0 0 20px;font-size:14px;color:#57534E;">Your booking has been confirmed. Here are the details:</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:4px 0;font-size:14px;"><strong>Event:</strong></td><td style="padding:4px 0;font-size:14px;">${opts.eventTitle}</td></tr>
            <tr><td style="padding:4px 0;font-size:14px;"><strong>Date:</strong></td><td style="padding:4px 0;font-size:14px;">${opts.eventDate}</td></tr>
            <tr><td style="padding:4px 0;font-size:14px;"><strong>Time:</strong></td><td style="padding:4px 0;font-size:14px;">${opts.eventTime}</td></tr>
            <tr><td style="padding:4px 0;font-size:14px;"><strong>Venue:</strong></td><td style="padding:4px 0;font-size:14px;">${opts.eventLocation}</td></tr>
          </table>

          <h2 style="margin:24px 0 8px;font-size:15px;font-weight:600;color:#292524;">Tickets</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <thead>
              <tr style="background-color:#F5F5F4;">
                <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;text-transform:uppercase;color:#57534E;">Type</th>
                <th style="padding:8px 12px;text-align:center;font-size:12px;font-weight:600;text-transform:uppercase;color:#57534E;">Qty</th>
                <th style="padding:8px 12px;text-align:right;font-size:12px;font-weight:600;text-transform:uppercase;color:#57534E;">Unit Price</th>
                <th style="padding:8px 12px;text-align:right;font-size:12px;font-weight:600;text-transform:uppercase;color:#57534E;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <p style="margin:16px 0 24px;text-align:right;font-size:16px;font-weight:700;color:#292524;">Total: ${opts.totalAmount}</p>

          <p style="margin:0 0 8px;font-size:14px;color:#57534E;">
            View your tickets and manage your booking in your
            <a href="${opts.walletUrl}" style="color:#FCA311;text-decoration:underline;">Ticket Wallet</a>.
          </p>
          <p style="margin:0;font-size:12px;color:#A8A29E;">
            You will need to log in to access your wallet.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr>
          <td style="background-color:#0F766E;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#A8A29E;">
              &copy; 2026 Kids &amp; Family Fun Day Kenya. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function cancellationHtml(opts: {
  userName: string;
  eventTitle: string;
  eventDate: string;
  bookingRef: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#F5F5F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F5F4;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:8px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background-color:#0F766E;padding:32px 32px 24px;text-align:center;">
            <h1 style="margin:0;font-size:22px;font-weight:700;color:#FCA311;">Booking Cancelled</h1>
            <p style="margin:6px 0 0;font-size:14px;color:#FFFFFF;">Kids &amp; Family Fun Day Kenya</p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px;color:#292524;">
          <p style="margin:0 0 4px;font-size:16px;">Hi ${opts.userName},</p>
          <p style="margin:0 0 20px;font-size:14px;color:#57534E;">
            Your booking for <strong>${opts.eventTitle}</strong> has been cancelled as requested.
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:4px 0;font-size:14px;"><strong>Event:</strong></td><td style="padding:4px 0;font-size:14px;">${opts.eventTitle}</td></tr>
            <tr><td style="padding:4px 0;font-size:14px;"><strong>Date:</strong></td><td style="padding:4px 0;font-size:14px;">${opts.eventDate}</td></tr>
            <tr><td style="padding:4px 0;font-size:14px;"><strong>Reference:</strong></td><td style="padding:4px 0;font-size:14px;">${opts.bookingRef}</td></tr>
          </table>

          <p style="margin:20px 0 0;font-size:14px;color:#57534E;">
            If you did not request this cancellation, please contact us immediately.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr>
          <td style="background-color:#0F766E;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#A8A29E;">
              &copy; 2026 Kids &amp; Family Fun Day Kenya. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendBookingConfirmationEmail(bookingId: string): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true, startDate: true, endDate: true, location: true } },
        items: {
          include: { ticketType: { select: { name: true, price: true } } },
        },
      },
    });

    if (!booking) {
      console.error('[EMAIL] Booking not found for confirmation:', bookingId);
      return;
    }
    if (!booking.user.email) {
      console.error('[EMAIL] User has no email for confirmation:', booking.userId);
      return;
    }

    const eventTitle = booking.event?.title ?? '(Unknown event)';
    const eventDate = booking.event ? formatDate(booking.event.startDate) : '(Unknown date)';
    const eventTime = booking.event
      ? `${formatTime(booking.event.startDate)} - ${formatTime(booking.event.endDate)}`
      : '';
    const eventLocation = booking.event?.location ?? '(Unknown location)';
    const totalAmount = formatCurrency(Number(booking.totalAmount));

    const items = booking.items.map((item) => ({
      name: item.ticketType.name,
      qty: item.quantity,
      unitPrice: formatCurrency(Number(item.ticketType.price)),
      subtotal: formatCurrency(Number(item.subtotal)),
    }));

    const walletUrl = `${getBaseUrl()}/dashboard/tickets`;

    const html = confirmationHtml({
      userName: booking.user.name ?? 'Valued Customer',
      eventTitle,
      eventDate,
      eventTime,
      eventLocation,
      items,
      totalAmount,
      walletUrl,
    });

    const { error } = await getResend().emails.send({
      from: `${SENDER_NAME} <${FROM}>`,
      to: booking.user.email,
      subject: `Booking Confirmed — ${eventTitle}`,
      html,
    });

    if (error) {
      console.error('[EMAIL] Failed to send confirmation:', error);
    }
  } catch (err) {
    console.error('[EMAIL] Unexpected error sending confirmation:', err);
  }
}

export async function sendBookingCancellationEmail(bookingId: string): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true, startDate: true } },
      },
    });

    if (!booking) {
      console.error('[EMAIL] Booking not found for cancellation:', bookingId);
      return;
    }
    if (!booking.user.email) {
      console.error('[EMAIL] User has no email for cancellation:', booking.userId);
      return;
    }

    const eventTitle = booking.event?.title ?? '(Unknown event)';
    const eventDate = booking.event ? formatDate(booking.event.startDate) : '(Unknown date)';

    const html = cancellationHtml({
      userName: booking.user.name ?? 'Valued Customer',
      eventTitle,
      eventDate,
      bookingRef: booking.ticketCode,
    });

    const { error } = await getResend().emails.send({
      from: `${SENDER_NAME} <${FROM}>`,
      to: booking.user.email,
      subject: `Booking Cancelled — ${eventTitle}`,
      html,
    });

    if (error) {
      console.error('[EMAIL] Failed to send cancellation:', error);
    }
  } catch (err) {
    console.error('[EMAIL] Unexpected error sending cancellation:', err);
  }
}
