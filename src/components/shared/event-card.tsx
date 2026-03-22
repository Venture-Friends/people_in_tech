import { format } from "date-fns";

export interface EventCardData {
  id: string;
  title: string;
  type: string;
  date: Date | string;
  startTime: string;
  location: string | null;
  isOnline: boolean;
  registrationUrl?: string | null;
  company: {
    name: string;
  } | null;
}

function getTypeBadgeStyle(type: string): string {
  switch (type) {
    case "WORKSHOP": return "border-blue-400/20 bg-blue-400/[0.06] text-blue-400";
    case "MEETUP": return "border-purple-400/20 bg-purple-400/[0.06] text-purple-400";
    case "WEBINAR": return "border-amber-400/20 bg-amber-400/[0.06] text-amber-400";
    case "TALENT_SESSION": return "border-primary/20 bg-primary/[0.06] text-primary";
    default: return "border-white/[0.04] bg-white/[0.03] text-white/40";
  }
}

function formatEventType(type: string): string {
  switch (type) {
    case "WORKSHOP": return "Workshop";
    case "MEETUP": return "Meetup";
    case "WEBINAR": return "Webinar";
    case "TALENT_SESSION": return "Talent Session";
    default: return type;
  }
}

export function EventCard({ event }: { event: EventCardData }) {
  const dateObj = typeof event.date === "string" ? new Date(event.date) : event.date;
  const dayNumber = format(dateObj, "dd");
  const monthShort = format(dateObj, "MMM").toUpperCase();

  return (
    <div className="h-full rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-[8px] p-[22px] transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.04] hover:-translate-y-[3px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)]">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Date block */}
        <div className="flex flex-col items-center justify-center rounded-[10px] bg-primary/[0.06] border border-primary/[0.1] w-[56px] h-[56px] shrink-0 self-center sm:self-auto">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            {monthShort}
          </span>
          <span className="font-display text-[22px] font-bold leading-none text-foreground">
            {dayNumber}
          </span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold text-foreground">
            {event.title}
          </h3>
          <p className="mt-1 text-xs font-medium text-primary/50">
            {event.company?.name || "POS4work"}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-md border px-2 py-0.5 text-[11px] ${getTypeBadgeStyle(event.type)}`}>
              {formatEventType(event.type)}
            </span>
            <span className="text-[11px] text-white/30">
              {event.isOnline ? "Online" : event.location || "TBA"} · {event.startTime}
            </span>
          </div>
          {event.registrationUrl && (
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-[13px] text-primary hover:underline"
            >
              {"View Event \u2192"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
