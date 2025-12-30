import handler from "server/api-handler";
import { fetchConfiguredProductPrices } from "server/stripe/pricing";

export default handler().get(async (_req, res) => {
  const prices = await fetchConfiguredProductPrices();

  res.status(200).json({ prices });
});
