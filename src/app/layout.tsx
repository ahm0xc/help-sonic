import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { ClerkProvider } from "@clerk/nextjs";
import PlausibleProvider from "next-plausible";

import { cn } from "~/lib/utils";
import { Toaster } from "~/components/ui/sonner";
import QueryProvider from "~/components/query-provider";

import "./globals.css";
import CookieBanner from "~/components/cookie-banner";

const fontSans = GeistSans;

export const metadata: Metadata = {
  title: "Help sonic",
  description: "", // TODO: Add description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <PlausibleProvider domain="helpsonic.com" />
        </head>
        <body className={cn("antialiased font-sans", fontSans.variable)}>
          <QueryProvider>
            {children}
            <CookieBanner />
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
