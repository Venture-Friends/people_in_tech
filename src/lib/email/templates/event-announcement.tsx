import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { Layout } from "./layout";

interface EventAnnouncementProps {
  name: string;
  eventTitle: string;
  eventDate: string;
  eventUrl: string;
  unsubscribeUrl?: string;
}

export const EventAnnouncement = ({
  name,
  eventTitle,
  eventDate,
  eventUrl,
  unsubscribeUrl,
}: EventAnnouncementProps) => {
  return (
    <Layout previewText={`New event: ${eventTitle}`} unsubscribeUrl={unsubscribeUrl}>
      <Heading
        as="h1"
        style={{
          fontSize: "22px",
          fontWeight: "700",
          color: "#f4f4f5",
          margin: "0 0 16px 0",
          lineHeight: "1.3",
        }}
      >
        New event announcement
      </Heading>
      <Text
        style={{
          fontSize: "15px",
          color: "#8799b5",
          lineHeight: "1.6",
          margin: "0 0 24px 0",
        }}
      >
        Hi {name}, a new event has been posted that you might be interested in:
      </Text>

      <Section
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          padding: "20px 24px",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.05)",
          margin: "0 0 24px 0",
        }}
      >
        <Text
          style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#f4f4f5",
            margin: "0 0 8px 0",
            lineHeight: "1.3",
          }}
        >
          {eventTitle}
        </Text>
        <Text
          style={{
            fontSize: "14px",
            color: "#9fef00",
            margin: "0",
            lineHeight: "1.5",
          }}
        >
          {eventDate}
        </Text>
      </Section>

      <Hr
        style={{
          borderColor: "rgba(255,255,255,0.05)",
          borderWidth: "1px",
          margin: "8px 0 24px 0",
        }}
      />

      <Section style={{ textAlign: "center", margin: "16px 0" }}>
        <Button
          href={eventUrl}
          style={{
            backgroundColor: "#9fef00",
            color: "#0a0e1a",
            padding: "12px 24px",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "15px",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          View Event
        </Button>
      </Section>
    </Layout>
  );
};

export default EventAnnouncement;
