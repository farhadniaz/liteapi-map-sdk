export const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
    CHF: "CHF"
  };
  return symbols[currency] || currency;
};
