import { notFound } from 'next/navigation';
import { curatedEvents } from '@/data/curated-events';
import { HistoricalEvent, CATEGORY_LABELS, CATEGORY_COLORS, PERIOD_LABELS } from '@/lib/types';
import EventDetail from './EventDetail';

// Generate static params for all events
export function generateStaticParams() {
  return curatedEvents.map((event) => ({ id: event.id }));
}

// Generate metadata for each event page
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = curatedEvents.find((e) => e.id === id);
  if (!event) return { title: 'Gebeurtenis niet gevonden' };

  return {
    title: `${event.title} — SectorHistory`,
    description: event.description.slice(0, 160),
  };
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = curatedEvents.find((e) => e.id === id);
  if (!event) notFound();

  // Find related events
  const relatedEvents: HistoricalEvent[] = (event.relatedEvents ?? [])
    .map((rid) => curatedEvents.find((e) => e.id === rid))
    .filter((e): e is HistoricalEvent => e !== undefined);

  // Find sub-events (parent-child)
  const subEvents: HistoricalEvent[] = curatedEvents.filter((e) => e.parentEventId === event.id);

  // Find parent event
  const parentEvent: HistoricalEvent | null = event.parentEventId
    ? curatedEvents.find((e) => e.id === event.parentEventId) ?? null
    : null;

  // Find events at nearby coordinates (within ~0.1 degrees)
  const nearbyEvents: HistoricalEvent[] = curatedEvents.filter(
    (e) =>
      e.id !== event.id &&
      e.id !== event.parentEventId &&
      !(event.relatedEvents ?? []).includes(e.id) &&
      Math.abs(e.coordinates[0] - event.coordinates[0]) < 0.1 &&
      Math.abs(e.coordinates[1] - event.coordinates[1]) < 0.1
  );

  return (
    <EventDetail
      event={event}
      relatedEvents={relatedEvents}
      subEvents={subEvents}
      parentEvent={parentEvent}
      nearbyEvents={nearbyEvents}
      allEvents={curatedEvents}
    />
  );
}
