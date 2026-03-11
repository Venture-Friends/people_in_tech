import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Globe, Building2 } from "lucide-react";
import { format } from "date-fns";

export interface EventCardData {
  id: string;
  title: string;
  type: string;
  date: Date | string;
  startTime: string;
  location: string | null;
  isOnline: boolean;
  company: {
    name: string;
  } | null;
}

function getTypeAccentBorder(type: string): string {
  switch (type) {
    case "WORKSHOP": return "border-l-blue-400";
    case "MEETUP": return "border-l-purple-400";
    case "WEBINAR": return "border-l-amber-400";
    case "TALENT_SESSION": return "border-l-primary";
    default: return "border-l-muted-foreground";
  }
}

function formatEventType(type: string): string {
  switch (type) {
    case "WORKSHOP":
      return "Workshop";
    case "MEETUP":
      return "Meetup";
    case "WEBINAR":
      return "Webinar";
    case "TALENT_SESSION":
      return "Talent Session";
    default:
      return type;
  }
}

export function EventCard({ event }: { event: EventCardData }) {
  const dateObj = typeof event.date === "string" ? new Date(event.date) : event.date;
  const dayNumber = format(dateObj, "dd");
  const monthShort = format(dateObj, "MMM").toUpperCase();

  return (
    <Card className="rounded-xl border-white/[0.06] bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-[oklch(0.16_0.01_260)]">
      <CardContent className="flex gap-4">
        {/* Date block */}
        <div className="flex flex-col items-center justify-center rounded-lg bg-surface-2 px-3 py-2">
          <span className="text-xl font-bold text-foreground">
            {dayNumber}
          </span>
          <span className="text-[10px] font-semibold tracking-wider text-muted-foreground">
            {monthShort}
          </span>
        </div>

        {/* Event details */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h3 className="truncate font-semibold text-foreground">
            {event.title}
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-md border-l-2 bg-white/[0.06] px-2 py-0.5 text-xs text-muted-foreground ${getTypeAccentBorder(event.type)}`}>
              {formatEventType(event.type)}
            </span>

            <span className="text-xs text-muted-foreground">
              {event.startTime}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="size-3.5" />
              {event.company?.name || "POS4work"}
            </span>
            {event.isOnline ? (
              <span className="flex items-center gap-1 text-secondary">
                <Globe className="size-3.5" />
                Online
              </span>
            ) : event.location ? (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {event.location}
              </span>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
