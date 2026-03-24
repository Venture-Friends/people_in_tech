import {
  Button,
  Heading,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { Layout } from "./layout";

interface ClaimApprovedProps {
  name: string;
  companyName: string;
  dashboardUrl: string;
}

export const ClaimApproved = ({
  name,
  companyName,
  dashboardUrl,
}: ClaimApprovedProps) => {
  return (
    <Layout previewText={`Your claim for ${companyName} has been approved!`}>
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
        Claim approved!
      </Heading>
      <Text
        style={{
          fontSize: "15px",
          color: "#8799b5",
          lineHeight: "1.6",
          margin: "0 0 8px 0",
        }}
      >
        Hi {name},
      </Text>
      <Text
        style={{
          fontSize: "15px",
          color: "#8799b5",
          lineHeight: "1.6",
          margin: "0 0 24px 0",
        }}
      >
        Your claim for{" "}
        <strong style={{ color: "#f4f4f5" }}>{companyName}</strong> has been
        approved! You can now manage your company profile, post jobs, and
        engage with the community.
      </Text>
      <Section style={{ textAlign: "center", margin: "32px 0 16px 0" }}>
        <Button
          href={dashboardUrl}
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
          Go to Dashboard
        </Button>
      </Section>
    </Layout>
  );
};

export default ClaimApproved;
