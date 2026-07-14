'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from './ThemeProvider';

interface Settings {
  emailNotifications: boolean;
  pushNotifications: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  emailNotifications: true,
  pushNotifications: true,
};

function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem('settings');
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: Settings) {
  localStorage.setItem('settings', JSON.stringify(settings));
}

export default function SettingsForm() {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);
  const [pushStatus, setPushStatus] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setPushStatus(
      !('serviceWorker' in navigator) || !('PushManager' in window)
        ? 'unsupported'
        : (Notification.permission as 'granted' | 'denied' | 'default')
    );
    setMounted(true);
  }, []);

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 rounded-xl bg-ink/5" />
        <div className="h-32 rounded-xl bg-ink/5" />
        <div className="h-32 rounded-xl bg-ink/5" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Notifications */}
      <div className="rounded-xl border border-ink/10 bg-paper p-6 shadow-soft">
        <h3 className="font-display text-base font-semibold text-ink mb-1">Notifications</h3>
        <p className="text-sm text-ink/50 mb-5">Choose how you want to be notified.</p>

        <div className="space-y-4">
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-ink">Email notifications</p>
              <p className="text-xs text-ink/50 mt-0.5">Booking confirmations, cancellations, and event updates</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.emailNotifications}
              onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 focus:ring-offset-paper ${
                settings.emailNotifications ? 'bg-coral' : 'bg-ink/20'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-paper shadow-sm transition-transform duration-200 mt-0.5 ${
                  settings.emailNotifications ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>

          <div className="border-t border-ink/5" />

          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-ink">Push notifications</p>
              <p className="text-xs text-ink/50 mt-0.5">
                {pushStatus === 'unsupported'
                  ? 'Not supported in this browser'
                  : pushStatus === 'denied'
                    ? 'Blocked by browser settings'
                    : 'Real-time alerts on your device'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.pushNotifications && pushStatus === 'granted'}
              disabled={pushStatus === 'unsupported' || pushStatus === 'denied'}
              onClick={() => {
                if (pushStatus === 'default') {
                  Notification.requestPermission().then((perm) => {
                    setPushStatus(perm as typeof pushStatus);
                    updateSetting('pushNotifications', perm === 'granted');
                  });
                } else {
                  updateSetting('pushNotifications', !settings.pushNotifications);
                }
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 focus:ring-offset-paper disabled:opacity-40 disabled:cursor-not-allowed ${
                settings.pushNotifications && pushStatus === 'granted' ? 'bg-coral' : 'bg-ink/20'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-paper shadow-sm transition-transform duration-200 mt-0.5 ${
                  settings.pushNotifications && pushStatus === 'granted' ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Appearance */}
      <div className="rounded-xl border border-ink/10 bg-paper p-6 shadow-soft">
        <h3 className="font-display text-base font-semibold text-ink mb-1">Appearance</h3>
        <p className="text-sm text-ink/50 mb-5">Customize how the app looks.</p>

        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <div>
            <p className="text-sm font-medium text-ink">Dark mode</p>
            <p className="text-xs text-ink/50 mt-0.5">Switch between light and dark theme</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={theme === 'dark'}
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 focus:ring-offset-paper ${
              theme === 'dark' ? 'bg-coral' : 'bg-ink/20'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-paper shadow-sm transition-transform duration-200 mt-0.5 ${
                theme === 'dark' ? 'translate-x-5.5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </label>
      </div>

      {/* Account */}
      <div className="rounded-xl border border-coral/20 bg-paper p-6 shadow-soft">
        <h3 className="font-display text-base font-semibold text-ink mb-1">Account</h3>
        <p className="text-sm text-ink/50 mb-5">Manage your account data.</p>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink">Export your data</p>
              <p className="text-xs text-ink/50 mt-0.5">Download a copy of your bookings, tickets, and profile data</p>
            </div>
            <button type="button" className="btn-secondary text-sm whitespace-nowrap" disabled>
              Coming Soon
            </button>
          </div>

          <div className="border-t border-ink/5" />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-coral">Delete account</p>
              <p className="text-xs text-ink/50 mt-0.5">Permanently delete your account and all associated data</p>
            </div>
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-coral/30 bg-transparent px-4 py-2 text-sm font-medium text-coral transition-colors hover:bg-coral/5"
              >
                Delete Account
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-ghost text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-coral px-4 py-2 text-sm font-semibold text-paper transition-all hover:bg-coral/80"
                  disabled
                >
                  Confirm Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
