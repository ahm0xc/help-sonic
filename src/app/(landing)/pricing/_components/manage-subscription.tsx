import React from "react";

import { Button } from "~/components/ui/button";
import { billingCustomerPortal } from "~/config/pricing";

const ManageSubscription: React.FC = () => {
  return (
    <div className="container max-w-5xl mb-12">
      <div className="p-8 rounded-2xl bg-secondary text-secondary-foreground border">
        <h4 className="text-2xl font-bold">Subscription status</h4>
        <p>You are subscribed to the Base plan.</p>
        <Button asChild className="mt-4">
          <a href={billingCustomerPortal.url} target="_blank" rel="noreferrer">
            Manage billing
          </a>
        </Button>
      </div>
    </div>
  );
};

export default ManageSubscription;
