import React from "react";
import {
  Raleway as HeadingFont,
  Raleway_Dots as HeadingDotFont,
} from "next/font/google";

import { cn } from "~/lib/utils";
import Header from "../_components/header";
import PricingTable from "./_components/pricing-table";
import Footer from "../_components/footer";

const headingFont = HeadingFont({
  subsets: ["latin"],
  weight: ["400"],
});

const headingDotFont = HeadingDotFont({
  subsets: ["latin"],
  weight: ["400"],
});

const PricingPage: React.FC = async () => {
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
              convenient <span /> affordable <span /> worthy
            </p>
          </div>
        </section>
        <PricingTable />
      </div>
      <Footer />
    </>
  );
};

export default PricingPage;
