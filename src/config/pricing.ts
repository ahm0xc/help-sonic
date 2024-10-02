export const billingCustomerPortal = {
  url: "https://billing.stripe.com/p/login/test_9AQfZh1NP4eK1qgaEE",
};

export const pricingPlans = [
  {
    title: "Base",
    description: "For small teams and projects",
    price: 3.0,
    currency: "USD",
    frequency: "month",
    features: [
      "5GB Storage",
      "Unlimited Public Projects",
      "Community Access",
      "Unlimited Private Projects",
      "Dedicated Phone Support",
      "Free Subdomain",
    ],
    links: {
      dev: "https://buy.stripe.com/test_eVaeXX8jP73m3ni5kk",
      live: "https://buy.stripe.com/test_7sIdTH7Cicc71vqeUU",
    },
    cta: "Start now",
  },
];
