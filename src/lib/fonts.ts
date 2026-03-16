import { Inter, Space_Grotesk } from "next/font/google";

export const inter = Inter({
  subsets: ["latin", "greek"],
  variable: "--font-inter",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});
