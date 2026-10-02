import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/auth-provider";
import { PublicationProvider } from "@/lib/publication-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZineBook — Make your PDF feel like a real magazine",
  description:
    "Turn documents, portfolios and publications into realistic digital magazines with custom covers, physical materials and natural page turning.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <AuthProvider>
          <PublicationProvider>{children}</PublicationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
