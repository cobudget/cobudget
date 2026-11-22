const currencies = [
  "EUR",
  "USD",
  "SEK",
  "NOK",
  "DKK",
  "JPY",
  "GBP",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "HKD",
  "NZD",
  "KRW",
  "SGD",
  "MXN",
  "INR",
  "RUB",
  "ZAR",
  "TRY",
  "BRL",
  "TWD",
  "PLN",
  "THB",
  "IDR",
  "HUF",
  "CZK",
  "ILS",
  "CLP",
  "PHP",
  "AED",
  "COP",
  "SAR",
  "MYR",
  "RON",
];

export default currencies;

// Pre-selected currency of the "New round" forms: DEFAULT_CURRENCY from the
// environment (e.g. GBP) when it is one of the supported codes, else EUR.
const configured = (process.env.DEFAULT_CURRENCY || "").trim().toUpperCase();
export const defaultCurrency = currencies.includes(configured)
  ? configured
  : "EUR";
