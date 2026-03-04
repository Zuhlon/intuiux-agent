import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IntuiUX Agent — AI-Powered UX Pipeline",
  description: "Transform transcriptions into interactive prototypes. AI-powered UX pipeline: Ideas → Competitor Analysis → CJM → Userflow → Prototype → Testing Plan.",
  keywords: ["UX", "AI", "Design", "Prototype", "Customer Journey", "Userflow", "Next.js", "LLM"],
  authors: [{ name: "IntuiUX Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "IntuiUX Agent",
    description: "AI-powered UX Pipeline — From transcription to prototype in minutes",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IntuiUX Agent",
    description: "AI-powered UX Pipeline — From transcription to prototype in minutes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
