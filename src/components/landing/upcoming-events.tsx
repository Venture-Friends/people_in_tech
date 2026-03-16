"use client";

import { useTranslations } from "next-intl";
import { EventCard, type EventCardData } from "@/components/shared/event-card";
import { SectionHeader } from "@/components/shared/section-header";

interface UpcomingEventsProps {
  events: EventCardData[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const t = useTranslations("landing");

  if (events.length === 0) return null;

  return (
    <section className="w-full py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title={t("upcomingEvents")} href="/events" />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
