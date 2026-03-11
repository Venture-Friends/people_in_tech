import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["100.99.60.38"],
};

export default withNextIntl(nextConfig);
