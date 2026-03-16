"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { EventCard, type EventCardData } from "@/components/shared/event-card";
import { EventFilters } from "@/components/events/event-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
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
}

export function EventsClient({
  initialUpcoming,
  initialPast,
}: EventsClientProps) {
  const t = useTranslations("events");
  const { data: session } = useSession();

  const [upcomingEvents, setUpcomingEvents] =
    useState<EventWithRegistration[]>(initialUpcoming);
  const [pastEvents] = useState<EventWithRegistration[]>(initialPast);
  const [loading, setLoading] = useState(false);
  const [showPast, setShowPast] = useState(false);

  // Registered event ids
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [registeringId, setRegisteringId] = useState<string | null>(null);

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

  async function handleRegister(eventId: string) {
    if (!session?.user) {
      toast.error("Please sign in to register for events");
      return;
    }

    setRegisteringId(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to register");

      const data = await res.json();
      setRegisteredIds((prev) => {
        const next = new Set(prev);
        if (data.registered) {
          next.add(eventId);
        } else {
          next.delete(eventId);
        }
        return next;
      });

      toast.success(
        data.registered
          ? "Registered for event"
          : "Registration cancelled"
      );
    } catch {
      toast.error("Failed to register");
    } finally {
      setRegisteringId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center pt-12 mb-9">
        <h1 className="font-display text-[42px] font-bold tracking-[-0.03em] text-foreground">
          Events
        </h1>
        <p className="mt-2 text-base text-white/[0.35]">
          Workshops, meetups, and talent sessions in Greek tech
        </p>
      </div>

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
          {upcomingEvents.map((event) => (
            <div key={event.id} className="flex flex-col gap-2">
              <EventCard event={event} />
              <div className="flex items-center gap-2 px-1">
                <Button
                  size="sm"
                  variant={registeredIds.has(event.id) ? "secondary" : "default"}
                  className="flex-1 text-xs"
                  disabled={registeringId === event.id}
                  onClick={() => handleRegister(event.id)}
                >
                  {registeredIds.has(event.id)
                    ? t("registered")
                    : t("register")}
                </Button>
                {event.registrationUrl && (
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    External link
                  </a>
                )}
              </div>
            </div>
          ))}
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
