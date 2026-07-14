import SponsorForm from '../SponsorForm';

export const metadata = {
  title: 'New Sponsor · Admin',
};

export default function NewSponsorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">New Sponsor</h1>
        <p className="mt-1 font-body text-ink/60">Add a new sponsor to the platform</p>
      </div>
      <SponsorForm />
    </div>
  );
}
