import {
  Heading,
  Section,
} from "@react-email/components";
import * as React from "react";
import { Layout } from "./layout";

interface NewsletterProps {
  content: string;
  unsubscribeUrl?: string;
}

export const Newsletter = ({ content, unsubscribeUrl }: NewsletterProps) => {
  return (
    <Layout previewText="People in Tech Newsletter" unsubscribeUrl={unsubscribeUrl}>
      <Heading
        as="h1"
        style={{
          fontSize: "22px",
          fontWeight: "700",
          color: "#f4f4f5",
          margin: "0 0 24px 0",
          lineHeight: "1.3",
        }}
      >
        Newsletter
      </Heading>
      <Section
        style={{
          fontSize: "15px",
          color: "#8799b5",
          lineHeight: "1.6",
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </Section>
    </Layout>
  );
};

export default Newsletter;
