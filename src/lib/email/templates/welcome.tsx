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
    <Layout previewText={`Welcome to People in Tech, ${name}!`}>
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
        Welcome to People in Tech, {name}!
      </Heading>
      <Text
        style={{
          fontSize: "15px",
          color: "#8799b5",
          lineHeight: "1.6",
          margin: "0 0 24px 0",
        }}
      >
        We&apos;re excited to have you on board. Welcome
        to Greece&apos;s tech talent pool — browse company profiles, save roles, and let employers discover you.
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
          Explore the Talent Pool
        </Button>
      </Section>
    </Layout>
  );
};

export default WelcomeEmail;
