import Stripe from "stripe";

if (typeof window !== "undefined")
  throw new Error(
    "Don't import this file in the browser as it will expose full control over your Stripe account."
  );

const stripe = process.env.STRIPE_API_KEY
  ? new Stripe(process.env.STRIPE_API_KEY, {
      apiVersion: "2020-08-27",
    })
  : null;

export default stripe;
