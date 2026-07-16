import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { forgotPasswordSchema } from '@/validators/auth.validator';
import { Resend } from 'resend';
import { checkRateLimit } from '@/lib/rate-limit';

let resend: Resend;
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}
const FROM = process.env.EMAIL_FROM ?? 'onboarding@resend.dev';
const SENDER_NAME = 'Kids & Family Fun Day Kenya';

function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_CHECKIN_BASE_URL ??
    process.env.AUTH_URL ??
    'http://localhost:3000'
  );
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
  const rateLimit = await checkRateLimit(`forgot-password:${ip}`, 3, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimit.retryAfterMs / 1000)) } },
    );
  }

  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please enter a valid email address' },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, name: true, email: true, passwordHash: true },
  });

  if (!user || !user.passwordHash) {
    // Return success even if user not found to prevent email enumeration
    return NextResponse.json({
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: tokenHash,
      passwordResetExpiry: expiry,
    },
  });

  const resetUrl = `${getBaseUrl()}/auth/reset-password?token=${rawToken}`;

  try {
    await getResend().emails.send({
      from: `${SENDER_NAME} <${FROM}>`,
      to: user.email,
      subject: 'Reset Your Password',
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#F5F5F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F5F4;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background-color:#0F766E;padding:32px 32px 24px;text-align:center;">
            <h1 style="margin:0;font-size:22px;font-weight:700;color:#FFFFFF;">Reset Your Password</h1>
            <p style="margin:6px 0 0;font-size:14px;color:#FFFFFFCC;">Kids &amp; Family Fun Day Kenya</p>
          </td>
        </tr>
        <tr><td style="padding:32px;color:#1F2937;">
          <p style="margin:0 0 4px;font-size:16px;">Hi ${user.name || 'there'},</p>
          <p style="margin:0 0 20px;font-size:14px;color:#6B7280;">
            We received a request to reset your password. Click the button below to set a new one. This link expires in 1 hour.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr><td style="background-color:#0F766E;border-radius:8px;">
              <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;color:#FFFFFF;font-size:16px;font-weight:600;text-decoration:none;">
                Reset Password
              </a>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;font-size:13px;color:#6B7280;text-align:center;">
            If the button doesn&apos;t work, copy and paste this link into your browser:
          </p>
          <p style="margin:4px 0 0;font-size:12px;color:#0F766E;text-align:center;word-break:break-all;">
            ${resetUrl}
          </p>
          <p style="margin:24px 0 0;font-size:13px;color:#9CA3AF;">
            If you didn&apos;t request this, you can safely ignore this email. Your password will not change.
          </p>
        </td></tr>
        <tr>
          <td style="background-color:#0F766E;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#FFFFFF99;">
              &copy; 2026 Kids &amp; Family Fun Day Kenya. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
  } catch (error) {
    console.error('[FORGOT_PASSWORD_EMAIL]', error);
    // Still return success to prevent email enumeration
  }

  return NextResponse.json({
    message: 'If an account with that email exists, a reset link has been sent.',
  });
}
