"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AboutTab } from "./about-tab";
import { RolesTab } from "./roles-tab";
import { EventsTab } from "./events-tab";
import { GalleryTab } from "./gallery-tab";
import type { EventCardData } from "@/components/shared/event-card";

interface JobListingData {
  id: string;
  title: string;
  location: string | null;
  type: string;
  externalUrl: string;
  postedAt: string;
}

interface GalleryImageData {
  id: string;
  url: string;
  caption: string | null;
  order: number;
}

interface CompanyTabsProps {
  description: string | null;
  technologies: string[];
  founded: number | null;
  size: string;
  locations: string[];
  industry: string;
  website: string | null;
  status: string;
  jobs: JobListingData[];
  events: EventCardData[];
  galleryImages: GalleryImageData[];
}

export function CompanyTabs({
  description,
  technologies,
  founded,
  size,
  locations,
  industry,
  website,
  status,
  jobs,
  events,
  galleryImages,
}: CompanyTabsProps) {
  const t = useTranslations("company");
  const isVerified = status === "VERIFIED";

  return (
    <Tabs defaultValue="about">
      <TabsList className="w-full justify-start border-b border-white/[0.04] bg-transparent">
        <TabsTrigger
          value="about"
          className="text-[13px] font-medium text-white/40 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors duration-150"
        >
          {t("about")}
        </TabsTrigger>
        <TabsTrigger
          value="roles"
          className="text-[13px] font-medium text-white/40 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors duration-150"
        >
          {t("openRoles")}
          {jobs.length > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-white/[0.06] px-1.5 text-[10px] font-medium text-muted-foreground">
              {jobs.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="events"
          className="text-[13px] font-medium text-white/40 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors duration-150"
        >
          {t("events")}
          {events.length > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-white/[0.06] px-1.5 text-[10px] font-medium text-muted-foreground">
              {events.length}
            </span>
          )}
        </TabsTrigger>
        {isVerified && (
          <TabsTrigger
            value="gallery"
            className="text-[13px] font-medium text-white/40 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors duration-150"
          >
            {t("gallery")}
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="about" className="mt-6">
        <AboutTab
          description={description}
          technologies={technologies}
          founded={founded}
          size={size}
          locations={locations}
          industry={industry}
          website={website}
        />
      </TabsContent>

      <TabsContent value="roles" className="mt-6">
        <RolesTab jobs={jobs} />
      </TabsContent>

      <TabsContent value="events" className="mt-6">
        <EventsTab events={events} />
      </TabsContent>

      {isVerified && (
        <TabsContent value="gallery" className="mt-6">
          <GalleryTab images={galleryImages} isVerified={isVerified} />
        </TabsContent>
      )}
    </Tabs>
  );
}
