import Stripe from "stripe";
import stripe from "./index";

type SanitizedPrice = {
  id: string;
  nickname: string | null;
  currency: string;
  unitAmount: number | null;
  interval: Stripe.Price.Recurring.Interval | null;
  intervalCount: number | null;
  productName: string | undefined;
  metadata: Stripe.Metadata;
  trialPeriodDays: number | null | undefined;
};

const getConfiguredProductId = () => {
  const productId = process.env.STRIPE_PRODUCT_ID;
  if (!productId) {
    throw new Error("STRIPE_PRODUCT_ID is not configured");
  }
  return productId;
};

const sanitizePrice = (price: Stripe.Price): SanitizedPrice => {
  const product =
    typeof price.product === "string" ? undefined : price.product?.name;

  return {
    id: price.id,
    nickname: price.nickname,
    currency: price.currency,
    unitAmount: price.unit_amount ?? null,
    interval: price.recurring?.interval ?? null,
    intervalCount: price.recurring?.interval_count ?? null,
    productName: product,
    metadata: price.metadata,
    trialPeriodDays: price.recurring?.trial_period_days,
    default: price.product?.default_price === price.id,
  };
};

export const fetchConfiguredProductPrices = async (): Promise<
  SanitizedPrice[]
> => {
  const productId = getConfiguredProductId();

  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
    expand: ["data.product"],
  });

  return prices.data
    .filter((price) => price.type === "recurring")
    .map(sanitizePrice);
};

export const getConfiguredProductPrice = async (
  priceId: string
): Promise<Stripe.Price> => {
  const productId = getConfiguredProductId();

  const price = await stripe.prices.retrieve(priceId, {
    expand: ["product"],
  });

  const priceProductId =
    typeof price.product === "string" ? price.product : price.product.id;

  if (!price.active) {
    throw new Error("Price is not active");
  }

  if (price.type !== "recurring") {
    throw new Error("Price must be recurring");
  }

  if (priceProductId !== productId) {
    throw new Error("Invalid price for configured Stripe product");
  }

  return price;
};

export type { SanitizedPrice as StripeProductPrice };
