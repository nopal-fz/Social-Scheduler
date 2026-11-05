import localFont from "next/font/local";
import type { Metadata } from "next";

import "./globals.css";

const sans = localFont({
  src: "../design/assets/fonts/host-grotesk-latin.woff2",
  weight: "400 700",
  variable: "--font-sans",
  display: "swap",
});

const mono = localFont({
  src: "../design/assets/fonts/jetbrains-mono-latin.woff2",
  weight: "400 500",
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "jadwalin",
  description: "Kalender jadwal post Threads, Instagram, dan TikTok.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
