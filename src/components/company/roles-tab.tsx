"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { AuthGate } from "@/components/shared/auth-gate";
import { authClient } from "@/lib/auth-client";

const ANONYMOUS_ROLE_LIMIT = 2;

interface JobListingData {
  id: string;
  title: string;
  location: string | null;
  type: string;
  externalUrl: string;
  postedAt: string;
}

function getTypeBadgeStyle(type: string): string {
  switch (type) {
    case "REMOTE":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "HYBRID":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "ONSITE":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function formatType(type: string): string {
  switch (type) {
    case "REMOTE":
      return "Remote";
    case "HYBRID":
      return "Hybrid";
    case "ONSITE":
      return "Onsite";
    default:
      return type;
  }
}

interface RolesTabProps {
  jobs: JobListingData[];
  companyName?: string;
}

export function RolesTab({ jobs, companyName }: RolesTabProps) {
  const t = useTranslations("company");
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Briefcase className="mb-4 size-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">{t("noRoles")}</p>
      </div>
    );
  }

  const shouldGate = !isAuthenticated && jobs.length > ANONYMOUS_ROLE_LIMIT;
  const visible = shouldGate ? jobs.slice(0, ANONYMOUS_ROLE_LIMIT) : jobs;

  return (
    <div className="space-y-3">
      {visible.map((job) => (
        <Card key={job.id}>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground">{job.title}</h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={getTypeBadgeStyle(job.type)}>
                  {formatType(job.type)}
                </Badge>
                {job.location && (
                  <span className="text-sm text-muted-foreground">
                    {job.location}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {format(new Date(job.postedAt), "MMM d, yyyy")}
                </span>
              </div>
            </div>
            <a
              href={job.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
                {t("viewOnSite")}
                <ExternalLink className="size-3.5" />
              </Button>
            </a>
          </CardContent>
        </Card>
      ))}

      {shouldGate && (
        <AuthGate message={`Sign up to see all open roles${companyName ? ` at ${companyName}` : ""}`} />
      )}
    </div>
  );
}
