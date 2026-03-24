import {
  Heading,
  Text,
} from "@react-email/components";
import * as React from "react";
import { Layout } from "./layout";

interface ClaimSubmittedProps {
  name: string;
  companyName: string;
}

export const ClaimSubmitted = ({ name, companyName }: ClaimSubmittedProps) => {
  return (
    <Layout previewText={`Claim submitted for ${companyName}`}>
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
        Claim submitted
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
          margin: "0 0 16px 0",
        }}
      >
        We&apos;ve received your claim for{" "}
        <strong style={{ color: "#f4f4f5" }}>{companyName}</strong>. Our team
        is reviewing your submission and will get back to you shortly.
      </Text>
      <Text
        style={{
          fontSize: "15px",
          color: "#8799b5",
          lineHeight: "1.6",
          margin: "0",
        }}
      >
        We&apos;re reviewing your claim for {companyName}. You&apos;ll receive
        another email once a decision has been made.
      </Text>
    </Layout>
  );
};

export default ClaimSubmitted;
