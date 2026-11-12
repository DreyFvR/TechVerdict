import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechVerdict AI",
  description: "AI-powered smartphone and laptop comparison assistant for Indian buyers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
