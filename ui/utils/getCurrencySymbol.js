function getCurrencySymbol (currency) {
  const currencies = {
    "EUR": "€",
    "USD": "$",
    "SEK": "kr",
    "NOK": "kr",
    "DKK": "kr",
    "JPY": "¥",
    "GBP": "£",
    "AUD": "A$",
    "CAD": "C$",
    "CHF": "CHf",
    "CNY": "¥",
    "HKD": "HK$",
    "NZD": "NZ$",
    "KRW": "₩",
    "SGD": "S$",
    "MXN": "MX$",
    "INR": "₹",
    "RUB": "₽",
    "ZAR": "R",
    "TRY": "₺",
    "BRL": "R$",
    "TWD": "NT$",
    "PLN": "zł",
    "THB": "฿",
    "IDR": "Rp",
    "HUF": "Ft",
    "CZK": "Kč",
    "ILS": "₪",
    "CLP": "$",
    "PHP": "₱",
    "AED": "د.إ",
    "COP": "COL$",
    "SAR": "SR",
    "MYR": "RM",
    "RON": "lei",
  };

  return currencies[currency] || currency;
      
}

export default getCurrencySymbol;