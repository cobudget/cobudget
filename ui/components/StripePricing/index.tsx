import { SelectField } from "components/SelectInput";
import { useEffect, useState } from "react";

export type StripePriceOption = {
  id: string;
  nickname: string | null;
  currency: string;
  unitAmount: number | null;
  interval: string | null;
  intervalCount: number | null;
  productName?: string;
  metadata?: Record<string, string>;
  trialPeriodDays?: number | null;
  default?: boolean | null;
};

type FetchState = {
  prices: StripePriceOption[];
  loading: boolean;
  error: Error | null;
};

const formatCurrency = (amount: number | null, currency: string) => {
  if (amount == null) return "";
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  } catch (err) {
    // fallback for unexpected currency codes
    return `${amount / 100} ${currency.toUpperCase()}`;
  }
};

const formatInterval = (
  interval: string | null,
  intervalCount: number | null
) => {
  if (!interval) return "";
  if (!intervalCount || intervalCount === 1) {
    return `per ${interval}`;
  }
  return `every ${intervalCount} ${interval}${intervalCount > 1 ? "s" : ""}`;
};

const getOptionLabel = (option: StripePriceOption) => {
  const amount = formatCurrency(option.unitAmount, option.currency);
  const intervalLabel = formatInterval(option.interval, option.intervalCount);
  const nickname = option.nickname ?? intervalLabel;
  return [
    nickname,
    amount && intervalLabel
      ? `${amount} • ${intervalLabel}`
      : amount || intervalLabel,
  ]
    .filter(Boolean)
    .join(" — ");
};

const intervalPriority: Record<string, number> = {
  day: 0,
  week: 1,
  month: 2,
  year: 3,
};

// 1st sort by interval (day < week < month < year)
// 2nd sort by intervalCount (e.g., 1 month < 3 months)
// 3rd sort by unitAmount (lowest to highest)
const sortPrices = (prices: StripePriceOption[]) =>
  [...prices].sort((a, b) => {
    const aInterval = a.interval ?? "";
    const bInterval = b.interval ?? "";
    const aPriority = intervalPriority[aInterval] ?? Number.MAX_SAFE_INTEGER;
    const bPriority = intervalPriority[bInterval] ?? Number.MAX_SAFE_INTEGER;

    if (aPriority !== bPriority) return aPriority - bPriority;

    const aCount = a.intervalCount ?? Number.MAX_SAFE_INTEGER;
    const bCount = b.intervalCount ?? Number.MAX_SAFE_INTEGER;
    if (aCount !== bCount) return aCount - bCount;

    const aAmount = a.unitAmount ?? Number.MAX_SAFE_INTEGER;
    const bAmount = b.unitAmount ?? Number.MAX_SAFE_INTEGER;
    return aAmount - bAmount;
  });

export const useStripeProductPrices = (): FetchState => {
  const [state, setState] = useState<FetchState>({
    prices: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchPrices = async () => {
      try {
        const response = await fetch("/api/stripe/product-prices");
        if (!response.ok) {
          throw new Error("Unable to load subscription options");
        }
        const data = await response.json();
        if (!data?.prices) {
          throw new Error("Unexpected response shape when loading prices");
        }

        if (isMounted) {
          setState({
            prices: sortPrices(data.prices),
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        if (isMounted) {
          setState({
            prices: [],
            loading: false,
            error: err as Error,
          });
        }
      }
    };

    fetchPrices();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
};

type StripePriceSelectProps = {
  options: StripePriceOption[];
  value: string | null;
  onChange: (priceId: string) => void;
  disabled?: boolean;
  name?: string;
  label?: string;
};

export const StripePriceSelect = ({
  options,
  value,
  onChange,
  disabled = false,
  name = "priceId",
  label,
}: StripePriceSelectProps) => {
  return (
    <SelectField
      name={name}
      label={label}
      color="green"
      inputProps={{
        value: value ?? "",
        onChange: (event) => onChange(event.target.value),
        disabled: disabled || !options.length,
      }}
    >
      <option value="" disabled>
        {disabled ? "Loading..." : "Select a plan"}
      </option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {getOptionLabel(option)}
        </option>
      ))}
    </SelectField>
  );
};
