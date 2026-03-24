import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { Layout } from "./layout";

interface WeeklyDigestProps {
  name: string;
  newCompanies: number;
  newJobs: number;
  newEvents: number;
  digestUrl: string;
  unsubscribeUrl?: string;
}

export const WeeklyDigest = ({
  name,
  newCompanies,
  newJobs,
  newEvents,
  digestUrl,
  unsubscribeUrl,
}: WeeklyDigestProps) => {
  return (
    <Layout
      previewText={`Your weekly digest: ${newCompanies} new companies, ${newJobs} new jobs`}
      unsubscribeUrl={unsubscribeUrl}
    >
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
        Your weekly digest
      </Heading>
      <Text
        style={{
          fontSize: "15px",
          color: "#8799b5",
          lineHeight: "1.6",
          margin: "0 0 24px 0",
        }}
      >
        Hi {name}, here&apos;s what happened this week in Greek tech:
      </Text>

      {/* Stats Grid */}
      <Section style={{ margin: "0 0 24px 0" }}>
        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{ borderCollapse: "collapse" }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  padding: "16px",
                  textAlign: "center" as const,
                  width: "33%",
                }}
              >
                <Text
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#9fef00",
                    margin: "0 0 4px 0",
                    lineHeight: "1",
                  }}
                >
                  {newCompanies}
                </Text>
                <Text
                  style={{
                    fontSize: "12px",
                    color: "#8799b5",
                    margin: "0",
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.05em",
                  }}
                >
                  Companies
                </Text>
              </td>
              <td style={{ width: "8px" }} />
              <td
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  padding: "16px",
                  textAlign: "center" as const,
                  width: "33%",
                }}
              >
                <Text
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#9fef00",
                    margin: "0 0 4px 0",
                    lineHeight: "1",
                  }}
                >
                  {newJobs}
                </Text>
                <Text
                  style={{
                    fontSize: "12px",
                    color: "#8799b5",
                    margin: "0",
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.05em",
                  }}
                >
                  Jobs
                </Text>
              </td>
              <td style={{ width: "8px" }} />
              <td
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  padding: "16px",
                  textAlign: "center" as const,
                  width: "33%",
                }}
              >
                <Text
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#9fef00",
                    margin: "0 0 4px 0",
                    lineHeight: "1",
                  }}
                >
                  {newEvents}
                </Text>
                <Text
                  style={{
                    fontSize: "12px",
                    color: "#8799b5",
                    margin: "0",
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.05em",
                  }}
                >
                  Events
                </Text>
              </td>
            </tr>
          </tbody>
        </table>
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
          href={digestUrl}
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
          Explore This Week
        </Button>
      </Section>
    </Layout>
  );
};

export default WeeklyDigest;
