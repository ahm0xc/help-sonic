import React from "react";

import PricingTable from "./_components/pricing-table";
import { Button } from "~/components/ui/button";
import { billingCustomerPortal } from "~/config/pricing";

const PricingPage: React.FC = () => {
  return (
    <main className="flex min-h-screen flex-col items-center gap-8 p-24">
      <Button asChild>
        <a href={billingCustomerPortal.url} target="_blank" rel="noreferrer">
          Billing portal
        </a>
      </Button>
      <PricingTable />
    </main>
  );
};

export default PricingPage;
