import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

function getTypeBadgeClass(type: string): string {
  switch (type) {
    case "WORKSHOP":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "MEETUP":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "WEBINAR":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "TALENT_SESSION":
      return "bg-primary/20 text-primary border-primary/30";
    default:
      return "bg-muted text-muted-foreground";
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
    <Card className="rounded-xl border-border bg-card transition-all hover:border-border/80 hover:bg-card/90">
      <CardContent className="flex gap-4">
        {/* Date block */}
        <div className="flex flex-col items-center justify-center rounded-lg bg-muted px-3 py-2">
          <span className="font-mono text-2xl font-bold text-primary">
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
            <Badge
              variant="outline"
              className={getTypeBadgeClass(event.type)}
            >
              {formatEventType(event.type)}
            </Badge>

            <span className="text-xs text-muted-foreground">
              {event.startTime}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="size-3" />
              {event.company?.name || "POS4work"}
            </span>
            {event.isOnline ? (
              <span className="flex items-center gap-1 text-secondary">
                <Globe className="size-3" />
                Online
              </span>
            ) : event.location ? (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {event.location}
              </span>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
