import { render } from "@react-email/components";
import type { TemplateName } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const templateImporters: Record<TemplateName, () => Promise<{ default: (props: any) => React.ReactElement }>> = {
  welcome: () => import("./templates/welcome"),
  "email-verification": () => import("./templates/email-verification"),
  "password-reset": () => import("./templates/password-reset"),
  "claim-submitted": () => import("./templates/claim-submitted"),
  "claim-approved": () => import("./templates/claim-approved"),
  "claim-rejected": () => import("./templates/claim-rejected"),
  "claim-admin-alert": () => import("./templates/claim-admin-alert"),
  "weekly-digest": () => import("./templates/weekly-digest"),
  "event-announcement": () => import("./templates/event-announcement"),
  newsletter: () => import("./templates/newsletter"),
  "unsubscribe-confirm": () => import("./templates/unsubscribe-confirm"),
};

export async function renderEmail(
  template: TemplateName,
  data: Record<string, unknown>
): Promise<string> {
  const importer = templateImporters[template];
  if (!importer) {
    throw new Error(`Unknown email template: ${template}`);
  }

  const mod = await importer();
  const Component = mod.default;
  const element = Component(data);
  const html = await render(element);
  return html;
}
