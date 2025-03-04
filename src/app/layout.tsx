import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prompt & Response | A Collaborative Writing Platform",
  description:
    "Create prompts, share ideas, and collaborate with responses in a rich text environment",
  keywords: [
    "prompts",
    "responses",
    "creative writing",
    "collaboration",
    "rich text editor",
    "online writing",
  ], // Keywords for SEO purposes
  authors: [{ name: "Owen Read" }],
  creator: "Owen Read",
  publisher: "Owen Read",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Suppress as client and server side may not match due to use of next-themes
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
