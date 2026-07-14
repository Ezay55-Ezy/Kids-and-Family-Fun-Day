import { notFound } from 'next/navigation';
import { getEvent, EventNotFoundError } from '@/services/event-service';
import EventForm from '@/components/events/EventForm';
import TicketTypeList from '@/components/ticket-types/TicketTypeList';

export const metadata = {
  title: 'Edit Event',
  description: 'Edit event details',
};

function formatDateForInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatTimeForInput(date: Date): string {
  return date.toISOString().slice(11, 16);
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;

  let event;
  try {
    event = await getEvent(id);
  } catch (error) {
    if (error instanceof EventNotFoundError) {
      notFound();
    }
    throw error;
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const initialData = {
    id: event.id,
    title: event.title,
    slug: event.slug,
    shortDescription: event.shortDescription || '',
    description: event.description,
    startDate: formatDateForInput(startDate),
    startTime: formatTimeForInput(startDate),
    endDate: formatDateForInput(endDate),
    endTime: formatTimeForInput(endDate),
    location: event.location,
    bannerImageUrl: event.bannerImageUrl || '',
    capacity: String(event.capacity),
    registrationOpenDate: event.registrationOpenDate
      ? event.registrationOpenDate.toISOString().slice(0, 16)
      : '',
    registrationCloseDate: event.registrationCloseDate
      ? event.registrationCloseDate.toISOString().slice(0, 16)
      : '',
    status: event.status,
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">Edit event</h2>
        <p className="text-ink/60 mt-1">Update the details for &ldquo;{event.title}&rdquo;.</p>
      </div>

      <EventForm initialData={initialData} mode="edit" />

      <div className="border-t border-ink/10 pt-8">
        <TicketTypeList eventId={event.id} />
      </div>
    </div>
  );
}
