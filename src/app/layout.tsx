import type { Metadata, Viewport } from 'next';
import { Sora, Manrope, IBM_Plex_Mono } from 'next/font/google';
import ThemeProvider from '@/components/dashboard/ThemeProvider';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: {
    default: 'Kids & Family Fun Day Kenya',
    template: '%s | Kids & Family Fun Day Kenya',
  },
  description:
    'Kenya\'s premier outdoor family festival. Buy tickets online, discover family events, secure M-Pesa payments, and fast registration.',
  keywords: [
    'Kids events Kenya',
    'Family fun day',
    'Family festival Kenya',
    'M-Pesa tickets',
    'Online ticket booking Kenya',
    'Family activities Nairobi',
  ],
  authors: [{ name: 'Kids & Family Fun Day Kenya' }],
  creator: 'Kids & Family Fun Day Kenya',
  publisher: 'Kids & Family Fun Day Kenya',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://kidsfamilyfunday.co.ke'),
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: 'https://kidsfamilyfunday.co.ke',
    siteName: 'Kids & Family Fun Day Kenya',
    title: 'Kids & Family Fun Day Kenya',
    description:
      'Kenya\'s premier outdoor family festival. Buy tickets online, discover family events, secure M-Pesa payments, and fast registration.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Kids & Family Fun Day Kenya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kids & Family Fun Day Kenya',
    description:
      'Kenya\'s premier outdoor family festival. Buy tickets online, discover family events, secure M-Pesa payments.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#0F766E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVars = `${sora.variable} ${manrope.variable} ${ibmPlexMono.variable}`;

  return (
    <html lang="en" className={fontVars}>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}