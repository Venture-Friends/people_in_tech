"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { EventCard, type EventCardData } from "@/components/shared/event-card";
import { EventFilters } from "@/components/events/event-filters";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, ChevronUp, Bookmark, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface EventWithRegistration extends EventCardData {
  registrationUrl?: string | null;
  capacity?: number | null;
  registrationCount?: number;
  description?: string | null;
}

interface EventsClientProps {
  initialUpcoming: EventWithRegistration[];
  initialPast: EventWithRegistration[];
  initialSavedIds?: string[];
}

export function EventsClient({
  initialUpcoming,
  initialPast,
  initialSavedIds = [],
}: EventsClientProps) {
  const t = useTranslations("events");
  const { data: session } = useSession();

  const [upcomingEvents, setUpcomingEvents] =
    useState<EventWithRegistration[]>(initialUpcoming);
  const [pastEvents] = useState<EventWithRegistration[]>(initialPast);
  const [loading, setLoading] = useState(false);
  const [showPast, setShowPast] = useState(false);

  // Saved event ids
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(initialSavedIds));
  const [savingId, setSavingId] = useState<string | null>(null);

  // Filter state
  const [type, setType] = useState("ALL");
  const [dateRange, setDateRange] = useState("upcoming");
  const [online, setOnline] = useState("");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (type !== "ALL") params.set("type", type);
      params.set("dateRange", dateRange);
      if (online) params.set("online", online);

      const res = await fetch(`/api/events?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setUpcomingEvents(data.events);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  }, [type, dateRange, online]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  async function handleSave(eventId: string) {
    if (!session?.user) {
      toast.error("Please sign in to save events");
      return;
    }

    setSavingId(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}/save`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to save event");

      const data = await res.json();
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (data.saved) {
          next.add(eventId);
        } else {
          next.delete(eventId);
        }
        return next;
      });

      toast.success(data.saved ? "Event saved" : "Event unsaved");
    } catch {
      toast.error("Failed to save event");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Events" subtitle="Workshops, meetups, and talent sessions in Greek tech" />

      <EventFilters
        type={type}
        onTypeChange={setType}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        online={online}
        onOnlineChange={setOnline}
      />

      {/* Events grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : upcomingEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Calendar className="size-12 text-muted-foreground/40" />
          <p className="text-lg font-semibold text-foreground">
            No events found
          </p>
          <p className="text-sm text-muted-foreground">
            Try different filters or check back later
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event) => {
            const isSaved = savedIds.has(event.id);
            return (
              <div key={event.id} className="flex flex-col gap-2">
                <EventCard event={event} />
                <div className="flex items-center gap-2 px-1">
                  {/* Bookmark toggle */}
                  <button
                    type="button"
                    className="flex items-center justify-center size-8 rounded-lg border border-white/[0.08] bg-white/[0.05] transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                    onClick={() => handleSave(event.id)}
                    disabled={savingId === event.id}
                    title={isSaved ? "Unsave event" : "Save event"}
                  >
                    <Bookmark
                      className={`size-4 ${isSaved ? "fill-primary text-primary" : "text-white/40 hover:text-white/60"}`}
                    />
                  </button>

                  {/* View Event external link or disabled placeholder */}
                  {event.registrationUrl ? (
                    <a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button
                        size="sm"
                        variant="default"
                        className="w-full text-xs gap-1"
                      >
                        View Event
                        <ExternalLink className="size-3" />
                      </Button>
                    </a>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1 text-xs"
                      disabled
                    >
                      No link available
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Past events section */}
      {pastEvents.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowPast(!showPast)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPast ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
            {t("pastEvents")} ({pastEvents.length})
          </button>

          {showPast && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event) => (
                <div key={event.id} className="opacity-60">
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {pastEvents.length === 0 && showPast && (
        <p className="text-sm text-muted-foreground">{t("noPastEvents")}</p>
      )}
    </div>
  );
}
