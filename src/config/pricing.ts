export const pricingPlans = [
  {
    title: "PRO",
    description: "For small teams and projects",
    prices: {
      monthly: {
        amount: 3.49,
        link: process.env.NEXT_PUBLIC_PRO_PLAN_MONTHLY_LINK,
      },
      yearly: {
        amount: 3,
        link: process.env.NEXT_PUBLIC_PRO_PLAN_YEARLY_LINK,
      },
    },
    cta: "Start for free",
  },
];
