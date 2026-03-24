import {
  Button,
  Heading,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { Layout } from "./layout";

interface EmailVerificationProps {
  name: string;
  verifyUrl: string;
}

export const EmailVerification = ({ name, verifyUrl }: EmailVerificationProps) => {
  return (
    <Layout previewText="Verify your email address">
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
        Verify your email
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
        Please click the button below to verify your email address and complete
        your account setup.
      </Text>
      <Section style={{ textAlign: "center", margin: "32px 0 24px 0" }}>
        <Button
          href={verifyUrl}
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
          Verify Email
        </Button>
      </Section>
      <Text
        style={{
          fontSize: "13px",
          color: "#8799b5",
          lineHeight: "1.5",
          margin: "0",
          textAlign: "center" as const,
        }}
      >
        This link expires in 24 hours.
      </Text>
    </Layout>
  );
};

export default EmailVerification;
