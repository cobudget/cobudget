import { CURRENCY_CACHE } from "../../../../constants";
import cache from "memory-cache";

export async function getExchangeRates() {
  let currencies = cache.get(CURRENCY_CACHE);
  if (!currencies) {
    const data = await fetch(
      `https://api.getgeoapi.com/v2/currency/convert?api_key=${process.env.CURRENCY_API_KEY}&from=USD`
    );
    currencies = await data.json();
    cache.put(CURRENCY_CACHE, null, 60 * 60 * 1000); //invalidate cache after 1 hour
  }
  return currencies;
}

async function getExchangeRate(currency: string) {
  let currencies = cache.get(CURRENCY_CACHE);
  if (!currencies) {
    const data = await fetch(
      `https://api.getgeoapi.com/v2/currency/convert?api_key=${process.env.CURRENCY_API_KEY}&from=USD`
    );
    currencies = await data.json();
    cache.put(CURRENCY_CACHE, null, 60 * 60 * 1000); //invalidate cache after 1 hour
  }
  return currencies.rates[currency];
}

export default getExchangeRate;
