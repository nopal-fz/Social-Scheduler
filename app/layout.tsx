import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "jadwalin",
  description: "Kalender jadwal post Threads, Instagram, dan TikTok.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
