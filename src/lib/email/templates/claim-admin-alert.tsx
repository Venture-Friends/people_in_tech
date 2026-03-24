import {
  Button,
  Heading,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { Layout } from "./layout";

interface ClaimAdminAlertProps {
  claimantName: string;
  companyName: string;
  adminUrl: string;
}

export const ClaimAdminAlert = ({
  claimantName,
  companyName,
  adminUrl,
}: ClaimAdminAlertProps) => {
  return (
    <Layout previewText={`New company claim: ${companyName}`}>
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
        New company claim
      </Heading>
      <Text
        style={{
          fontSize: "15px",
          color: "#8799b5",
          lineHeight: "1.6",
          margin: "0 0 8px 0",
        }}
      >
        A new claim has been submitted and requires your review.
      </Text>
      <Section
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          padding: "16px 20px",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.05)",
          margin: "16px 0 24px 0",
        }}
      >
        <Text
          style={{
            fontSize: "14px",
            color: "#8799b5",
            margin: "0 0 4px 0",
            lineHeight: "1.5",
          }}
        >
          <strong style={{ color: "#f4f4f5" }}>Company:</strong> {companyName}
        </Text>
        <Text
          style={{
            fontSize: "14px",
            color: "#8799b5",
            margin: "0",
            lineHeight: "1.5",
          }}
        >
          <strong style={{ color: "#f4f4f5" }}>Claimant:</strong>{" "}
          {claimantName}
        </Text>
      </Section>
      <Section style={{ textAlign: "center", margin: "32px 0 16px 0" }}>
        <Button
          href={adminUrl}
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
          Review in Admin Panel
        </Button>
      </Section>
    </Layout>
  );
};

export default ClaimAdminAlert;
