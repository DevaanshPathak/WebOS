import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebOS 1",
  description:
    "A browser-based desktop OS simulation with an embedded-systems and homelab aesthetic."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
