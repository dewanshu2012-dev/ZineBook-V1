import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { PublicationProvider } from "@/lib/publication-store";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZineBook — Make your PDF feel like a real magazine",
  description:
    "Turn documents, portfolios and publications into realistic digital magazines with custom covers, physical materials and natural page turning.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} flex min-h-full flex-col bg-paper text-ink`}
      >
        <PublicationProvider>{children}</PublicationProvider>
      </body>
    </html>
  );
}
