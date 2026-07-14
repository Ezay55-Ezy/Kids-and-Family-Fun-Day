import SettingsForm from '@/components/dashboard/SettingsForm';

export const metadata = {
  title: 'Settings',
  description: 'Manage your notification and appearance preferences',
};

export default function SettingsPage() {
  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">Settings</h2>
        <p className="text-ink/60 mt-1">Manage your preferences and account settings.</p>
      </div>
      <SettingsForm />
    </div>
  );
}
