import React from "react";
import { CheckIcon } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import {
  Raleway as HeadingFont,
  Raleway_Dots as HeadingDotFont,
  Indie_Flower as HandWritingFont,
} from "next/font/google";
import { eq } from "drizzle-orm";

import { cn } from "~/lib/utils";
import BuyButton from "./_components/buy-button";
import Header from "../_components/header";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import PricingTable from "./_components/pricing-table";

const headingFont = HeadingFont({
  subsets: ["latin"],
  weight: ["400"],
});

const headingDotFont = HeadingDotFont({
  subsets: ["latin"],
  weight: ["400"],
});

const handWritingFont = HandWritingFont({
  subsets: ["latin"],
  weight: ["400"],
});

const FEATURES = [
  {
    content: "Block Reels & Shorts",
  },
  {
    content: "Hide Thumbnails",
  },
  {
    content: "Daily Activity Tracking",
  },
  {
    content: "Scheduled Blocking",
  },
  {
    content: "300+ Porn Sites Blocked",
  },
  {
    content: "Bulk Site Blocking",
  },
  {
    content: "Reminders & Alerts",
  },
  {
    content: "Time Limits",
  },
  {
    content: "Privacy-Focused",
  },
  {
    content: "... And more!",
  },
];

const PricingPage: React.FC = async () => {
  const { userId } = auth();

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId ?? ""),
  });

  const isSubscribed = !!user?.isSubscribed;

  return (
    <>
      <Header />
      <div className="pt-32 pb-48">
        <section className="mx-auto max-w-5xl">
          <div>
            <h1 className={cn("text-7xl font-bold", headingFont.className)}>
              We<span className={headingDotFont.className}>&apos;ve</span> got a
              plan <br /> that&apos;s{" "}
              <span className={headingDotFont.className}>perfect</span> for you
            </h1>
            <p
              className={cn(
                "mt-6 flex items-center gap-3 text-foreground/70 [&_span]:h-1 [&_span]:w-1 [&_span]:rounded-full [&_span]:bg-foreground/70",
                headingFont.className,
              )}
            >
              cheap <span /> affordable <span /> worthy
            </p>
          </div>
        </section>
        <PricingTable />
      </div>
    </>
  );
};

export default PricingPage;
