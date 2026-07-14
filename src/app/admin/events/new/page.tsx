import EventForm from '@/components/events/EventForm';

export const metadata = {
  title: 'New Event',
  description: 'Create a new event',
};

export default async function NewEventPage() {

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">Create event</h2>
        <p className="text-ink/60 mt-1">Fill in the details below to create a new event.</p>
      </div>

      <EventForm mode="create" />
    </div>
  );
}
