import {
  Heading,
  Text,
} from "@react-email/components";
import * as React from "react";
import { Layout } from "./layout";

interface UnsubscribeConfirmProps {
  email: string;
}

export const UnsubscribeConfirm = ({ email }: UnsubscribeConfirmProps) => {
  return (
    <Layout previewText="You've been unsubscribed">
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
        You&apos;ve been unsubscribed
      </Heading>
      <Text
        style={{
          fontSize: "15px",
          color: "#8799b5",
          lineHeight: "1.6",
          margin: "0 0 16px 0",
        }}
      >
        The email address{" "}
        <strong style={{ color: "#f4f4f5" }}>{email}</strong> has been
        successfully unsubscribed from our mailing list.
      </Text>
      <Text
        style={{
          fontSize: "15px",
          color: "#8799b5",
          lineHeight: "1.6",
          margin: "0",
        }}
      >
        You will no longer receive promotional emails from People in Tech.
        You may still receive transactional emails related to your account
        activity.
      </Text>
    </Layout>
  );
};

export default UnsubscribeConfirm;
