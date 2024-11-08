"use client";

import { SignInButton, useUser } from "@clerk/nextjs";

import { Button } from "~/components/ui/button";
import { pricingPlans } from "~/config/pricing";
import { cn } from "~/lib/utils";

export default function BuyButton({
  isSubscribed,
  link,
}: {
  isSubscribed: boolean;
  link: string;
}) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  if (!user) {
    return (
      <SignInButton>
        <Button
          type="button"
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xl h-14 rounded-xl"
        >
          Sign In
        </Button>
      </SignInButton>
    );
  }

  return (
    <Button
      type="button"
      size="lg"
      className={cn(
        "bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xl h-14 rounded-xl",
        isSubscribed && "from-neutral-900 to-neutral-950",
      )}
      asChild
    >
      <a
        href={
          isSubscribed
            ? process.env.NEXT_PUBLIC_BILLING_PORTAL_URL!
            : getFormattedPaymentLink(
                link!,
                user?.emailAddresses[0].emailAddress ?? "",
              )
        }
      >
        {isSubscribed ? (
          <span>Manage Subscription</span>
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
