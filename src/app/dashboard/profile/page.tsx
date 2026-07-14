import ProfileForm from '@/components/dashboard/ProfileForm';

export const metadata = {
  title: 'My Profile',
  description: 'View and edit your profile',
};

export default function ProfilePage() {
  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">My Profile</h2>
        <p className="text-ink/60 mt-1">Manage your account details and preferences.</p>
      </div>
      <ProfileForm />
    </div>
  );
}
