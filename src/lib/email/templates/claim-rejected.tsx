import {
  Heading,
  Hr,
  Text,
} from "@react-email/components";
import * as React from "react";
import { Layout } from "./layout";

interface ClaimRejectedProps {
  name: string;
  companyName: string;
  reason?: string;
}

export const ClaimRejected = ({
  name,
  companyName,
  reason,
}: ClaimRejectedProps) => {
  return (
    <Layout previewText={`Update on your claim for ${companyName}`}>
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
        Claim not approved
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
        Your claim for{" "}
        <strong style={{ color: "#f4f4f5" }}>{companyName}</strong> was not
        approved.
      </Text>
      {reason && (
        <>
          <Hr
            style={{
              borderColor: "rgba(255,255,255,0.05)",
              borderWidth: "1px",
              margin: "16px 0",
            }}
          />
          <Text
            style={{
              fontSize: "14px",
              color: "#8799b5",
              lineHeight: "1.6",
              margin: "0 0 4px 0",
              fontWeight: "600",
            }}
          >
            Reason:
          </Text>
          <Text
            style={{
              fontSize: "14px",
              color: "#f4f4f5",
              lineHeight: "1.6",
              margin: "0",
              backgroundColor: "rgba(255,255,255,0.03)",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {reason}
          </Text>
        </>
      )}
      <Text
        style={{
          fontSize: "13px",
          color: "#8799b5",
          lineHeight: "1.5",
          margin: "24px 0 0 0",
        }}
      >
        If you believe this was a mistake, please contact our support team.
      </Text>
    </Layout>
  );
};

export default ClaimRejected;
