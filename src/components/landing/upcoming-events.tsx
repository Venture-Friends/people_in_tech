"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { EventCard, type EventCardData } from "@/components/shared/event-card";

interface UpcomingEventsProps {
  events: EventCardData[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const t = useTranslations("landing");

  if (events.length === 0) return null;

  return (
    <section className="w-full py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight">
            {t("upcomingEvents")}
          </h2>
          <Link
            href="/events"
            className="text-[13px] font-medium text-primary/60 hover:text-primary transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
