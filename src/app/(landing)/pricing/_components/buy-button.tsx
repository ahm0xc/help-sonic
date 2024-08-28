"use client";

import { useUser } from "@clerk/nextjs";

import { Button } from "~/components/ui/button";
import { pricingPlans } from "~/config/pricing";

export default function BuyButton({ isSubscribed }: { isSubscribed: boolean }) {
  const { user, isLoaded } = useUser();
  return (
    <Button
      type="button"
      size="lg"
      className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xl h-14 rounded-xl"
      disabled={isSubscribed || !isLoaded}
      asChild
    >
      <a
        href={getFormattedPaymentLink(
          pricingPlans[0].link,
          user?.emailAddresses[0].emailAddress ?? "",
        )}
      >
        {isSubscribed ? (
          <span>You are already subscribed</span>
        ) : (
          <span>{pricingPlans[0].cta}</span>
        )}
      </a>
    </Button>
  );
}

function getFormattedPaymentLink(link: string, email: string) {
  const url = new URL(link);
  url.searchParams.set("prefilled_email", email);

  return url.toString();
}
