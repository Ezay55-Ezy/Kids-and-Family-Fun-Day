import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF9F6',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: '#0F766E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 800,
            }}
          >
            KF
          </div>
        </div>
        <div
          style={{
            fontSize: '52px',
            fontWeight: 800,
            color: '#0f172a',
            textAlign: 'center',
            lineHeight: '1.1',
            maxWidth: '900px',
            padding: '0 60px',
          }}
        >
          Kids &amp; Family Fun Day
        </div>
        <div
          style={{
            fontSize: '24px',
            color: '#64748b',
            marginTop: '16px',
            textAlign: 'center',
          }}
        >
          Kenya&apos;s Premier Family Festival Platform
        </div>
        <div
          style={{
            fontSize: '18px',
            color: '#0F766E',
            marginTop: '32px',
            fontWeight: 600,
          }}
        >
          kidsfamilyfunday.co.ke
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
