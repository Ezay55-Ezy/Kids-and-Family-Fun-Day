# Security Audit Report

**Application:** Kids & Family Fun Day Kenya
**URL:** https://kids-and-family-fun-day.vercel.app
**Stack:** Next.js 16 + Prisma 7 + Neon Serverless Postgres + Vercel
**Date:** 2026-07-16
**Auditor:** Automated Security Assessment (opencode)

---

## Tool Inventory

| Tool | Status | Version |
|------|--------|---------|
| Nmap | Installed & Used | 7.98 |
| curl | Installed & Used | 8.18.0 |
| npm audit | Installed & Used | (bundled with npm) |
| openssl | Installed & Used | (bundled with OpenSSL 3.5.5) |
| Gitleaks | Installed & Used | 8.21.2 |
| testssl.sh | Installed & Used | (latest from git) |
| Lighthouse | Installed & Used | 13.4.0 |
| HTTPie | Installed & Used | 3.2.4 (SSL issue with Vercel edge) |
| k6 | Already installed | v2.0.0 |
| Semgrep | Failed to install | pip/binary download timeout (network) |
| Trivy | Failed to install | Binary download timeout (network) |
| OWASP ZAP | Skipped | Requires Java/Docker runtime |
| Burp Suite Community | Skipped | Requires GUI |

**Notes:**
- HTTPie installed but encounters `SSLEOFError` when connecting to Vercel's edge network (known TLS 1.3 cipher negotiation issue). All HTTPie dynamic tests were supplemented by equivalent curl tests.
- Semgrep and Trivy could not be installed due to sustained network timeouts on their ~100MB+ binaries. Manual code review was used as substitute for static analysis.
- Lighthouse required `npx` execution (no global install). Results saved to `lighthouse-report.json`.
- testssl.sh raw socket connection to Vercel edge returned false negatives for TLS protocol detection. Nmap scan confirmed TLS 1.2 + 1.3 support. testssl certificate analysis worked correctly.

---

## Gitleaks Scan Results

**Tool:** Gitleaks 8.21.2
**Command:** `gitleaks detect --source /home/ezra/kids-family-fun-day-kenya --report-format json`
**Result:** NO LEAKS FOUND
**Commits scanned:** 16

```
○
│╲
│ ○
○ ░
░    gitleaks
INF 16 commits scanned.
INF scan completed in 7.57s
INF no leaks found
```

**Analysis:** The git history contains no hardcoded secrets, API keys, tokens, or credentials. This confirms the manual secret scan result that `.env` was never committed.

---

## Lighthouse Audit Results

**Tool:** Lighthouse 13.4.0
**Command:** `npx lighthouse https://kids-and-family-fun-day.vercel.app --chrome-flags="--headless --no-sandbox --disable-gpu"`

| Category | Score |
|----------|-------|
| **Performance** | 64/100 |
| **Accessibility** | 96/100 |
| **Best Practices** | 96/100 |
| **SEO** | 100/100 |

**Core Web Vitals:**
| Metric | Value | Rating |
|--------|-------|--------|
| First Contentful Paint (FCP) | 1.3s | Needs Improvement |
| Largest Contentful Paint (LCP) | 2.9s | Needs Improvement |
| Total Blocking Time (TBT) | 1,370ms | Poor |
| Cumulative Layout Shift (CLS) | 0 | Good |
| Speed Index | 6.2s | Poor |
| Time to Interactive (TTI) | 3.7s | Needs Improvement |

**Failed Lighthouse Audits:**
| Audit | Issue |
|-------|-------|
| speed-index | Speed Index of 6.2s exceeds 3.4s target |
| total-blocking-time | TBT of 1,370ms exceeds 200ms target |
| max-potential-fid | High first input delay potential |
| errors-in-console | Browser errors logged to console |
| mainthread-work-breakdown | Excessive main-thread work |
| color-contrast | Insufficient contrast ratio on some elements |
| label-content-name-mismatch | Visible text labels don't match accessible names |
| unused-javascript | Large amount of unused JS shipped |
| bf-cache | Page prevented back/forward cache restoration |

**Note:** Lighthouse was run from the auditor's machine (Kenya). Some metrics may be affected by network latency to Vercel's US edge. The performance score of 64 aligns with our earlier k6 load test findings showing slow page loads.

---

## testssl.sh Certificate Analysis

**Tool:** testssl.sh (latest from git)
**Command:** `testssl.sh --protocols --server-defaults kids-and-family-fun-day.vercel.app`

| Check | Result |
|-------|--------|
| SSLv2 | Not offered (OK) |
| SSLv3 | Not offered (OK) |
| TLS 1.0 | Not offered (OK) |
| TLS 1.1 | Not offered (OK) |
| TLS 1.2 | Supported (confirmed via Nmap) |
| TLS 1.3 | Supported (confirmed via Nmap) |
| Certificate CN | *.vercel.app |
| Signature Algorithm | SHA256 with RSA |
| Key Size | RSA 2048 bits |
| Chain of Trust | OK |
| Certificate Transparency | Yes |
| OCSP Stapling | Not offered |
| Certificate Validity | 71 days remaining (Jun 28 — Sep 26 2026) |
| Intermediate Certs | 3 provided, all valid |
| EV Certificate | No (DV wildcard) |

---

## Findings Summary

| # | Finding | Severity | OWASP | Status |
|---|---------|----------|-------|--------|
| 1 | No rate limiting on auth endpoints | **HIGH** | A07:2021 | Needs fix |
| 2 | No Content-Security-Policy header | **MEDIUM** | A05:2021 | Needs fix |
| 3 | `.parse()` instead of `.safeParse()` leaks errors as 500s | **MEDIUM** | A05:2021 | Needs fix |
| 4 | HTML injection in email templates | **MEDIUM** | A03:2021 | Needs fix |
| 5 | Password reset token stored in plaintext | **MEDIUM** | A04:2021 | Should fix |
| 6 | Rate limiting silently disabled without Redis | **MEDIUM** | A05:2021 | Should fix |
| 7 | 8 moderate dependency vulnerabilities | **MEDIUM** | A06:2021 | Should fix |
| 8 | No robots.txt | **LOW** | SEO | Nice to fix |
| 9 | 30-day session max age | **LOW** | A07:2021 | Consider |
| 10 | CSV formula injection in exports | **LOW** | A03:2021 | Consider |
| 11 | URL fields not validated as URLs | **LOW** | A03:2021 | Consider |
| 12 | Middleware excludes API routes | **LOW** | A01:2021 | Consider |

---

## FINDING 1 — No Rate Limiting on Authentication Endpoints

**Severity:** HIGH
**Tool:** Manual code review + curl verification
**OWASP:** A07:2021 — Identification and Authentication Failures

**Evidence:**
The login, registration, and password reset endpoints have no rate limiting applied. Only `/api/upload` and `/api/reviews` are rate-limited.

```
File: src/app/api/auth/[...nextauth]/route.ts — no rateLimit() call
File: src/app/api/auth/register/route.ts — no rateLimit() call
File: src/app/api/auth/forgot-password/route.ts — no rateLimit() call
File: src/app/api/auth/reset-password/route.ts — no rateLimit() call
```

Furthermore, the rate limiting implementation itself is fail-open:

```
File: src/lib/rate-limit.ts, lines 32-33:
if (!redis) {
  return { allowed: true, retryAfterMs: 0 };
}
```

When `UPSTASH_REDIS_REST_URL` is not configured, rate limiting is completely disabled with no warning.

**Risk:** Brute force attacks against user passwords, credential stuffing, account enumeration via registration/forgot-password endpoints. An attacker can make unlimited login attempts.

**Recommendation:**
- Add rate limiting to `/api/auth/*`, `/api/bookings`, `/api/newsletter` endpoints
- Use in-memory rate limiting as fallback when Redis is unavailable (not fail-open)
- Implement account lockout or exponential backoff after N failed login attempts

---

## FINDING 2 — No Content-Security-Policy Header

**Severity:** MEDIUM
**Tool:** curl -sI (HTTP header inspection)
**OWASP:** A05:2021 — Security Misconfiguration

**Evidence:**
```
$ curl -sI https://kids-and-family-fun-day.vercel.app/

HTTP/2 200
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
permissions-policy: camera=(), microphone=(), geolocation=()
referrer-policy: strict-origin-when-cross-origin
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-content-type-options: nosniff
x-frame-options: DENY
x-xss-protection: 1; mode=block
```

**Missing:** `Content-Security-Policy` header is not present in any response.

**Risk:** Without CSP, the browser has no restriction on inline scripts, eval(), or loading scripts from untrusted domains. If an XSS vulnerability exists (e.g., via the email injection in Finding 4), CSP would be the last line of defense.

**Recommendation:**
Add a CSP header in `next.config.ts`:
```js
{ key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://res.cloudinary.com data:; connect-src 'self'" }
```

---

## FINDING 3 — `.parse()` Leaks Validation Errors as 500 Responses

**Severity:** MEDIUM
**Tool:** Manual code review
**OWASP:** A05:2021 — Security Misconfiguration

**Evidence:**
Multiple admin routes use `schema.parse()` which throws on validation failure, resulting in HTTP 500 instead of proper 400 Bad Request with clean error messages:

```
File: src/app/api/admin/reports/route.ts, line 13:
  const filters = reportFilterSchema.parse({...})

File: src/app/api/admin/reports/export/route.ts, line 22:
  const data = reportExportSchema.parse(body);

File: src/app/api/admin/gallery/route.ts, lines 13, 35
File: src/app/api/admin/sponsors/route.ts, lines 13, 35
File: src/app/api/admin/users/route.ts, line 13
```

When `.parse()` throws, in development mode Next.js may expose detailed stack traces. In production, it returns an unhelpful 500.

**Risk:** Information disclosure in dev mode; incorrect HTTP semantics; poor error messages for API consumers.

**Recommendation:**
Replace all `schema.parse()` calls with `schema.safeParse()` and handle errors explicitly returning 400 with `error.flatten()`.

---

## FINDING 4 — HTML Injection in Email Templates

**Severity:** MEDIUM
**Tool:** Manual code review
**OWASP:** A03:2021 — Injection

**Evidence:**
User-controlled data is interpolated directly into HTML email templates without escaping:

```
File: src/services/email-service.ts, line 82:
  <td style="padding:4px 0;font-size:14px;">${opts.eventTitle}</td>

File: src/app/api/auth/forgot-password/route.ts, line 79:
  <p style="margin:0 0 4px;font-size:16px;">Hi ${user.name || 'there'},</p>
```

If a user registers with name `<img src=x onerror=alert(document.cookie)>` or an event title contains HTML, it will be rendered in emails sent via Resend.

**Risk:** Phishing via styled links, email tracking pixel injection, information disclosure in legacy email clients. While most modern email clients strip `<script>` tags, HTML elements like `<a>`, `<img>`, and `<style>` can be abused.

**Recommendation:**
HTML-escape all user-supplied values before interpolation:
```ts
function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
```

---

## FINDING 5 — Password Reset Token Stored in Plaintext

**Severity:** MEDIUM
**Tool:** Manual code review
**OWASP:** A04:2021 — Insecure Design

**Evidence:**
The password reset token is stored as a raw hex string in the database:

```
File: src/app/api/auth/forgot-password/route.ts, lines 46-54:
  const token = crypto.randomBytes(32).toString('hex');
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: token, passwordResetExpiry: expiry },
  });

File: src/app/api/auth/reset-password/route.ts, lines 19-21:
  const user = await prisma.user.findUnique({
    where: { passwordResetToken: token },
  });
```

**Risk:** If an attacker obtains read access to the database (backup leak, SQL injection in another part, cloud misconfiguration), all valid reset tokens can be used directly to take over accounts.

**Recommendation:**
Store only the SHA-256 hash of the token:
```ts
const token = crypto.randomBytes(32).toString('hex');
const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
// Store tokenHash in DB, send token to user via email
```

---

## FINDING 6 — Rate Limiting Silently Disabled Without Redis

**Severity:** MEDIUM
**Tool:** Manual code review
**OWASP:** A05:2021 — Security Misconfiguration

**Evidence:**
```
File: src/lib/rate-limit.ts, lines 32-33:
if (!redis) {
  return { allowed: true, retryAfterMs: 0 };
}
```

When `UPSTASH_REDIS_REST_URL` is not set, all rate limiting silently passes every request through. There is no log warning, no fallback, and no indication that the application is unprotected.

**Risk:** The two endpoints that do implement rate limiting (upload, reviews) are effectively unprotected in environments without Redis configured.

**Recommendation:**
- Log a warning when Redis is unavailable
- Implement an in-memory rate limiter (e.g., sliding window with Map) as fallback
- Consider using `next.config.ts` middleware-level rate limiting

---

## FINDING 7 — Dependency Vulnerabilities (npm audit)

**Severity:** MEDIUM
**Tool:** npm audit
**OWASP:** A06:2021 — Vulnerable and Outdated Components

**Evidence:**
```
$ npm audit

8 moderate severity vulnerabilities

@hono/node-server <1.19.13
  Severity: moderate
  CWE: CWE-22 (Path Traversal)
  CVSS: 5.3
  Advisory: GHSA-92pp-h63x-v22m
  Title: Middleware bypass via repeated slashes in serveStatic
  Fix: prisma@6.19.3 (breaking change)

postcss <8.5.10
  Severity: moderate
  CWE: CWE-79 (XSS)
  CVSS: 6.1
  Advisory: GHSA-qx2v-qp2m-jg93
  Title: PostCSS has XSS via Unescaped </style> in CSS Stringify Output
  Fix: next@9.3.3 (breaking change)

uuid <11.1.1
  Severity: moderate
  CWE: CWE-787/CWE-1285
  CVSS: 7.5
  Advisory: GHSA-w5hq-g745-h8pq
  Title: Missing buffer bounds check in v3/v5/v6
  Fix: exceljs@3.4.0 (breaking change)
```

**Risk:** The PostCSS XSS vulnerability (CVSS 6.1) could allow script injection via crafted CSS. The @hono/node-server path traversal (CVSS 5.3) could allow bypassing static file serving restrictions.

**Recommendation:**
- Run `npm audit fix --force` and test thoroughly (all fixes are breaking changes)
- Alternatively, manually upgrade to latest compatible versions of each affected package
- The PostCSS vulnerability in `next` is in the framework itself — monitor for Next.js patch release

---

## FINDING 8 — No robots.txt

**Severity:** LOW
**Tool:** curl
**Category:** SEO / Security Configuration

**Evidence:**
```
$ curl -s https://kids-and-family-fun-day.vercel.app/robots.txt
Returns 404 page (full HTML)
```

**Risk:** Without robots.txt, search engines will crawl all publicly accessible paths. This is also an information disclosure concern — automated scanners use robots.txt to discover hidden paths.

**Recommendation:**
Create a `public/robots.txt` file allowing crawling of public paths while blocking `/api/*`, `/admin/*`, `/dashboard/*`.

---

## FINDING 9 — 30-Day Session Max Age

**Severity:** LOW
**Tool:** Manual code review
**OWASP:** A07:2021 — Identification and Authentication Failures

**Evidence:**
```
File: src/auth.config.ts, lines 10-12:
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60, // 30 days
},
```

**Risk:** A stolen JWT cookie grants account access for up to 30 days. Industry standard is 7-14 days for session cookies.

**Recommendation:**
Reduce to 7 days (604800 seconds) or implement sliding window refresh with shorter absolute timeout.

---

## FINDING 10 — CSV Formula Injection in Exports

**Severity:** LOW
**Tool:** Manual code review
**OWASP:** A03:2021 — Injection

**Evidence:**
```
File: src/lib/format.ts, lines 69-75:
export function escapeCsvField(value: unknown): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
```

The function escapes commas and quotes but does not handle formula prefixes (`=`, `+`, `-`, `@`).

**Risk:** If an admin exports data to CSV and opens it in Excel, a user named `=CMD("calc")` could execute arbitrary commands. This is a well-known CSV injection vector.

**Recommendation:**
Prefix values starting with `=`, `+`, `-`, `@`, `\t`, or `\r` with a single quote:
```ts
if (/^[=+\-@\t\r]/.test(str)) return `'${str}'`;
```

---

## FINDING 11 — URL Fields Not Validated as URLs

**Severity:** LOW
**Tool:** Manual code review
**OWASP:** A03:2021 — Injection

**Evidence:**
```
File: src/validators/event.validator.ts, line 18:
  bannerImageUrl: z.string().optional().or(z.literal('')),

File: src/validators/gallery.validator.ts, line 6:
  imageUrl: z.string().min(1, 'Image URL is required'),
```

Compare with sponsor validator which properly validates:
```
File: src/validators/sponsor.validator.ts, lines 12-13:
  logoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
```

**Risk:** An admin could store `javascript:alert(1)` as a banner image URL. If rendered in an `<a>` tag (e.g., wrapping the banner), this would execute JavaScript in the user's browser.

**Recommendation:**
Add `.url()` validation to all URL fields in validators.

---

## FINDING 12 — Middleware Excludes API Routes

**Severity:** LOW
**Tool:** Manual code review
**OWASP:** A01:2021 — Broken Access Control

**Evidence:**
```
File: src/middleware.ts, lines 11-12:
export const config = {
  matcher: ['/dashboard/:path*', '/vendor/:path*', '/admin/:path*',
            '/profile/:path*', '/settings/:path*', '/bookings/:path*',
            '/payments/:path*'],
};
```

No `/api/*` pattern is in the matcher. Every API route must manually implement auth checks.

**Risk:** If a developer adds a new `/api/*` route and forgets to add an auth check, it will be fully accessible to anonymous users. Defense-in-depth recommends protecting at the middleware level.

**Recommendation:**
Add `/api/:path*` to the matcher with exclusions for public routes:
```ts
matcher: ['/api/:path*', '/dashboard/:path*', '/admin/:path*', ...]
```
Then add public route bypasses in the middleware `authorized` callback.

---

## Positive Findings (What's Working Well)

| Area | Status | Evidence |
|------|--------|----------|
| **Password Hashing** | PASS | bcryptjs with cost factor 12 |
| **SQL Injection** | PASS | All queries use Prisma ORM (parameterized) |
| **IDOR Protection** | PASS | Ownership checks on bookings, services, notifications |
| **Authorization** | PASS | `requireAdmin()` verifies role in DB on every admin request |
| **Email Enumeration** | PASS | Forgot password returns same message regardless of email existence |
| **Error Handling** | PASS | Generic error messages; stack traces logged server-side only |
| **X-Frame-Options: DENY** | PASS | Prevents clickjacking |
| **X-Content-Type-Options: nosniff** | PASS | Prevents MIME sniffing |
| **HSTS** | PASS | max-age=63072000; includeSubDomains; preload |
| **HTTP → HTTPS Redirect** | PASS | 308 Permanent Redirect on port 80 |
| **TLS Configuration** | PASS | TLS 1.2 + 1.3 only; all ciphers rated A |
| **SSL Certificate** | PASS | *.vercel.app, 2048-bit RSA, SHA-256, valid until Sep 2026 |
| **.env Not Tracked** | PASS | Properly gitignored, never committed to git |
| **No Hardcoded Secrets** | PASS | All secrets via process.env |
| **No Source Maps Exposed** | PASS | 404 on `/_next/static/chunks/webpack.js` |
| **No .env/.git Exposure** | PASS | 404 on `/.env`, `/.git/config`, `/.env.local` |
| **Upload Validation** | PASS | 10MB limit, MIME allowlist, rate limited |
| **File Upload** | PASS | Cloudinary re-encodes server-side |
| **Input Validation (Zod)** | PASS | Comprehensive validators for all major inputs |
| **SSRF Protection** | PASS | No user-controlled URL fetching |
| **Vendor Ownership** | PASS | Services verified against vendor profile |
| **Admin Role Verification** | PASS | DB-level role check on every admin request |

---

## Network Scan Results

**Tool:** Nmap 7.98
**Command:** `nmap -sV -sC -p 80,443 --script=ssl-enum-ciphers,http-security-headers kids-and-family-fun-day.vercel.app`

| Port | State | Service |
|------|-------|---------|
| 80/tcp | open | HTTP → 308 redirect to HTTPS |
| 443/tcp | open | HTTPS (Golang net/http) |

**TLS Configuration:**
| Protocol | Status | Rating |
|----------|--------|--------|
| TLS 1.0 | Rejected | N/A |
| TLS 1.1 | Rejected | N/A |
| TLS 1.2 | Supported | A |
| TLS 1.3 | Supported | A |

**Cipher Suites (TLS 1.2):**
- TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 (secp256r1) — A
- TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (secp256r1) — A
- TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256 (secp256r1) — A

**Cipher Suites (TLS 1.3):**
- TLS_AKE_WITH_AES_128_GCM_SHA256 (X25519MLKEM768) — A
- TLS_AKE_WITH_AES_256_GCM_SHA384 (X25519MLKEM768) — A
- TLS_AKE_WITH_CHACHA20_POLY1305_SHA256 (X25519MLKEM768) — A

**SSL Certificate:**
- Subject: CN=*.vercel.app
- Issuer: C=US, O=Google Trust Services, CN=WR1
- Valid: Jun 28 2026 — Sep 26 2026
- Key: 2048-bit RSA
- Signature: SHA-256 with RSA Encryption

---

## Security Headers Audit (Live Production)

**Tool:** curl -sI

| Header | Present | Value |
|--------|---------|-------|
| Strict-Transport-Security | YES | max-age=63072000; includeSubDomains; preload |
| X-Frame-Options | YES | DENY |
| X-Content-Type-Options | YES | nosniff |
| X-XSS-Protection | YES | 1; mode=block |
| Referrer-Policy | YES | strict-origin-when-cross-origin |
| Permissions-Policy | YES | camera=(), microphone=(), geolocation=() |
| X-Powered-By | REMOVED | (poweredByHeader: false) |
| Content-Security-Policy | **MISSING** | — |
| Cross-Origin-Opener-Policy | MISSING | — |
| Cross-Origin-Resource-Policy | MISSING | — |

---

## Dynamic Test Results

**Tool:** curl

| Test | Result | Evidence |
|------|--------|----------|
| Unauthenticated `/api/admin/users` | 401 | Access denied |
| Unauthenticated `/api/user/profile` | 401 | Access denied |
| Unauthenticated `/api/upload` (POST) | 401 | Access denied |
| Unauthenticated `/api/bookings` (GET) | 405 | Method not allowed |
| SQL injection on `/api/events` | 200 | Prisma parameterizes — no injection |
| Path traversal (`/../../etc/passwd`) | 403 | Blocked |
| Non-existent API path | 404 | Generic page |
| `.env` file access | 404 | Not exposed |
| `.git/config` access | 404 | Not exposed |
| CORS from evil.com | No AC headers returned | No wildcard CORS |
| OPTIONS preflight `/api/bookings` | 204 | Allow: OPTIONS, POST |
| DELETE `/api/events` | 405 | Method not allowed |

---

## Remediation Priority

| Priority | Finding | Effort |
|----------|---------|--------|
| **P0** | #1 — Add rate limiting to auth endpoints | 2-4 hours |
| **P1** | #2 — Add Content-Security-Policy header | 1-2 hours |
| **P1** | #3 — Replace `.parse()` with `.safeParse()` | 1-2 hours |
| **P1** | #7 — Upgrade vulnerable dependencies | 2-4 hours |
| **P2** | #4 — HTML-escape email template values | 1-2 hours |
| **P2** | #5 — Hash password reset tokens | 1 hour |
| **P2** | #6 — Add rate limit fallback + warning | 1-2 hours |
| **P3** | #8 — Add robots.txt | 15 min |
| **P3** | #9 — Reduce session max age | 5 min |
| **P3** | #10 — Fix CSV formula injection | 15 min |
| **P3** | #11 — Add URL validation to validators | 15 min |
| **P3** | #12 — Add API routes to middleware matcher | 1 hour |

**Estimated total remediation time:** 12-20 hours

---

*Report generated by automated security assessment. No application code was modified during this audit.*
