import {
  Button,
  Heading,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { Layout } from "./layout";

interface WelcomeEmailProps {
  name: string;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hiringpartners.gr";

export const WelcomeEmail = ({ name }: WelcomeEmailProps) => {
  return (
    <Layout previewText={`Welcome to Hiring Partners, ${name}!`}>
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
        Welcome to Hiring Partners, {name}!
      </Heading>
      <Text
        style={{
          fontSize: "15px",
          color: "#8799b5",
          lineHeight: "1.6",
          margin: "0 0 24px 0",
        }}
      >
        We&apos;re excited to have you on board. Hiring Partners is your gateway
        to discovering the best tech companies in Greece — from innovative
        startups to established industry leaders. Explore company profiles,
        open roles, and upcoming events all in one place.
      </Text>
      <Section style={{ textAlign: "center", margin: "32px 0 16px 0" }}>
        <Button
          href={`${appUrl}/discover`}
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
          Start Exploring
        </Button>
      </Section>
    </Layout>
  );
};

export default WelcomeEmail;
