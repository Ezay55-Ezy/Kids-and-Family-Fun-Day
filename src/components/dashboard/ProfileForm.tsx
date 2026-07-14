'use client';

import { useState, useEffect, useCallback } from 'react';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { formatDate } from '@/lib/format';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  hasPassword: boolean;
  _count: {
    bookings: number;
    tickets: number;
    reviews: number;
  };
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrator',
  VENDOR: 'Vendor',
  CUSTOMER: 'Customer',
  SPONSOR: 'Sponsor',
};

const roleBadgeColors: Record<string, string> = {
  ADMIN: 'bg-coral/10 text-coral',
  VENDOR: 'bg-sky/10 text-sky',
  CUSTOMER: 'bg-grass/10 text-grass',
  SPONSOR: 'bg-sun/10 text-sun',
};

export default function ProfileForm() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setName(data.name);
        setPhone(data.phone || '');
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setSaving(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setProfileError(data.error || 'Failed to update profile');
        return;
      }

      setProfile((prev) => prev ? { ...prev, name: data.name, phone: data.phone, updatedAt: data.updatedAt } : prev);
      setProfileSuccess('Profile updated successfully');
    } catch {
      setProfileError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setChangingPassword(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || 'Failed to change password');
        return;
      }

      setPasswordSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPasswordError('Something went wrong. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 rounded-xl bg-ink/5" />
        <div className="h-48 rounded-xl bg-ink/5" />
        <div className="h-48 rounded-xl bg-ink/5" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-xl border border-ink/10 bg-paper p-12 text-center">
        <p className="text-ink/60">Could not load profile.</p>
      </div>
    );
  }

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile header */}
      <div className="rounded-xl border border-ink/10 bg-paper p-6 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-coral text-xl font-bold text-paper shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold text-ink truncate">{profile.name}</h3>
            <p className="text-sm text-ink/60 truncate">{profile.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeColors[profile.role] || 'bg-ink/10 text-ink'}`}>
                {roleLabels[profile.role] || profile.role}
              </span>
              <span className="text-xs text-ink/40">
                Member since {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-ink/10">
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-ink">{profile._count.bookings}</p>
            <p className="text-xs text-ink/50 mt-0.5">Bookings</p>
          </div>
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-ink">{profile._count.tickets}</p>
            <p className="text-xs text-ink/50 mt-0.5">Tickets</p>
          </div>
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-ink">{profile._count.reviews}</p>
            <p className="text-xs text-ink/50 mt-0.5">Reviews</p>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="rounded-xl border border-ink/10 bg-paper p-6 shadow-soft">
        <h3 className="font-display text-base font-semibold text-ink mb-4">Edit Profile</h3>

        {profileError && (
          <div className="mb-4 rounded-lg bg-coral/10 border border-coral/20 px-4 py-3 text-sm text-coral">
            {profileError}
          </div>
        )}
        {profileSuccess && (
          <div className="mb-4 rounded-lg bg-grass/10 border border-grass/20 px-4 py-3 text-sm text-grass">
            {profileSuccess}
          </div>
        )}

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label htmlFor="profile-name" className="label-base">Name</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-base"
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="label-base">Email</label>
            <input
              id="profile-email"
              type="email"
              value={profile.email}
              className="input-base bg-ink/5 cursor-not-allowed"
              disabled
            />
            <p className="mt-1.5 text-xs text-ink/40">Contact support to change your email address.</p>
          </div>

          <div>
            <label htmlFor="profile-phone" className="label-base">Phone <span className="text-ink/40 font-normal">(optional)</span></label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-base"
              placeholder="+254 7XX XXX XXX"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-ink/40">
              Last updated {formatDate(profile.updatedAt)}
            </p>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-sm"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      {profile.hasPassword && (
        <div className="rounded-xl border border-ink/10 bg-paper p-6 shadow-soft">
          <h3 className="font-display text-base font-semibold text-ink mb-4">Change Password</h3>

          {passwordError && (
            <div className="mb-4 rounded-lg bg-coral/10 border border-coral/20 px-4 py-3 text-sm text-coral">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="mb-4 rounded-lg bg-grass/10 border border-grass/20 px-4 py-3 text-sm text-grass">
              {passwordSuccess}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <PasswordInput
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <PasswordInput
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
              helperText="At least 8 characters with an uppercase letter and a number"
            />
            <PasswordInput
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={changingPassword}
                className="btn-primary text-sm"
              >
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
