import { Inter, Space_Grotesk, Noto_Sans } from "next/font/google";

export const inter = Inter({
  subsets: ["latin", "greek"],
  variable: "--font-inter",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const notoSans = Noto_Sans({
  subsets: ["greek"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans",
});
