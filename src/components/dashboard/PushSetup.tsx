'use client';

import { useEffect, useRef } from 'react';

interface PushSetupProps {
  vapidPublicKey: string;
}

export default function PushSetup({ vapidPublicKey }: PushSetupProps) {
  const registered = useRef(false);

  useEffect(() => {
    if (registered.current) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (Notification.permission === 'denied') return;

    registered.current = true;

    async function setup() {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');

        if (Notification.permission === 'granted') {
          await subscribe(reg, vapidPublicKey);
        } else if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            await subscribe(reg, vapidPublicKey);
          }
        }
      } catch {
        // silently fail — push is best-effort
      }
    }

    setup();
  }, [vapidPublicKey]);

  return null;
}

async function subscribe(reg: ServiceWorkerRegistration, key: string) {
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
  });

  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub.toJSON()),
  });
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array(rawData.split('').map((c) => c.charCodeAt(0)));
}
