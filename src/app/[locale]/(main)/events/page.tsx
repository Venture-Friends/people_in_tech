import { setRequestLocale, getTranslations } from "next-intl/server";
import { getSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { EventsClient } from "@/components/events/events-client";
import type { EventCardData } from "@/components/shared/event-card";

interface EventWithExtra extends EventCardData {
  registrationUrl?: string | null;
  capacity?: number | null;
  registrationCount?: number;
  description?: string | null;
}

async function getEvents(): Promise<{
  upcoming: EventWithExtra[];
  past: EventWithExtra[];
}> {
  const now = new Date();

  const [upcoming, past] = await Promise.all([
    prisma.event.findMany({
      where: { date: { gte: now } },
      orderBy: { date: "asc" },
      take: 50,
      include: {
        company: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { registrations: true },
        },
      },
    }),
    prisma.event.findMany({
      where: { date: { lt: now } },
      orderBy: { date: "desc" },
      take: 20,
      include: {
        company: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { registrations: true },
        },
      },
    }),
  ]);

  function mapEvent(e: typeof upcoming[number]): EventWithExtra {
    return {
      id: e.id,
      title: e.title,
      type: e.type,
      date: e.date.toISOString(),
      startTime: e.startTime,
      location: e.location,
      isOnline: e.isOnline,
      company: e.company,
      registrationUrl: e.registrationUrl,
      capacity: e.capacity,
      registrationCount: e._count.registrations,
      description: e.description,
    };
  }

  return {
    upcoming: upcoming.map(mapEvent),
    past: past.map(mapEvent),
  };
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("events");
  const { upcoming, past } = await getEvents();

  // Fetch saved event IDs for logged-in user
  let savedEventIds: string[] = [];
  const session = await getSession();
  if (session?.user) {
    const savedEvents = await prisma.savedEvent.findMany({
      where: { userId: session.user.id },
      select: { eventId: true },
    });
    savedEventIds = savedEvents.map((s) => s.eventId);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <EventsClient
        initialUpcoming={upcoming}
        initialPast={past}
        initialSavedIds={savedEventIds}
      />
    </div>
  );
}
