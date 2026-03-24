import {
  Button,
  Heading,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { Layout } from "./layout";

interface PasswordResetProps {
  name: string;
  resetUrl: string;
}

export const PasswordReset = ({ name, resetUrl }: PasswordResetProps) => {
  return (
    <Layout previewText="Reset your password">
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
        Reset your password
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
        We received a request to reset your password. Click the button below to
        choose a new one.
      </Text>
      <Section style={{ textAlign: "center", margin: "32px 0 24px 0" }}>
        <Button
          href={resetUrl}
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
          Reset Password
        </Button>
      </Section>
      <Text
        style={{
          fontSize: "13px",
          color: "#8799b5",
          lineHeight: "1.5",
          margin: "0 0 8px 0",
          textAlign: "center" as const,
        }}
      >
        This link expires in 1 hour.
      </Text>
      <Text
        style={{
          fontSize: "13px",
          color: "#8799b5",
          lineHeight: "1.5",
          margin: "0",
          textAlign: "center" as const,
        }}
      >
        If you didn&apos;t request this, you can safely ignore this email.
      </Text>
    </Layout>
  );
};

export default PasswordReset;
