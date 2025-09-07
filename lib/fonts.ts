// lib/fonts.ts
import { Geist, Geist_Mono, Orbitron, Exo_2 } from "next/font/google";

// Main fonts
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Futuristic fonts for headings - using Google Fonts instead of local files
export const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: '--font-orbitron',
});

export const exo = Exo_2({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: '--font-exo',
});
