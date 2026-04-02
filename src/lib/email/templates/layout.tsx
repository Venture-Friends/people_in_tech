import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from "@react-email/components";
import * as React from "react";

const colors = {
  background: "#0a0e1a",
  card: "#111827",
  accent: "#9fef00",
  textPrimary: "#f4f4f5",
  textSecondary: "#8799b5",
  border: "rgba(255,255,255,0.05)",
};

const fontFamily = "system-ui, -apple-system, sans-serif";

interface LayoutProps {
  children: React.ReactNode;
  previewText?: string;
  unsubscribeUrl?: string;
}

export const Layout = ({ children, previewText, unsubscribeUrl }: LayoutProps) => {
  return (
    <Html lang="en">
      <Head />
      {previewText && <Preview>{previewText}</Preview>}
      <Body
        style={{
          backgroundColor: colors.background,
          fontFamily,
          margin: "0",
          padding: "0",
        }}
      >
        <Container
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            padding: "40px 20px",
          }}
        >
          {/* Header */}
          <Section style={{ textAlign: "center", marginBottom: "32px" }}>
            <Text
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: colors.accent,
                margin: "0",
                letterSpacing: "-0.025em",
              }}
            >
              People in Tech
            </Text>
          </Section>

          {/* Card */}
          <Section
            style={{
              backgroundColor: colors.card,
              borderRadius: "12px",
              padding: "32px",
              border: `1px solid ${colors.border}`,
            }}
          >
            {children}
          </Section>

          {/* Footer */}
          <Section style={{ textAlign: "center", marginTop: "32px" }}>
            <Hr
              style={{
                borderColor: colors.border,
                borderWidth: "1px",
                marginBottom: "24px",
              }}
            />
            <Text
              style={{
                fontSize: "13px",
                color: colors.textSecondary,
                margin: "0 0 8px 0",
              }}
            >
              People in Tech — POS4work
            </Text>
            {unsubscribeUrl && (
              <Text
                style={{
                  fontSize: "12px",
                  color: colors.textSecondary,
                  margin: "0",
                }}
              >
                <Link
                  href={unsubscribeUrl}
                  style={{
                    color: colors.textSecondary,
                    textDecoration: "underline",
                  }}
                >
                  Unsubscribe
                </Link>
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default Layout;
