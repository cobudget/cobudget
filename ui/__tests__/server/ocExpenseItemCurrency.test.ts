import { describe, it, expect, vi } from "vitest";

vi.mock("server/prisma", () => ({ default: {} }));
vi.mock("server/graphql/resolvers/helpers", () => ({ getExpense: vi.fn() }));
vi.mock("server/graphql/resolvers/helpers/getExchangeRate", () => ({
  convertAmount: vi.fn(),
  getExchangeRates: vi.fn(),
}));
vi.mock("server/utils/roundUtils", () => ({ getOCToken: vi.fn() }));

import {
  ocItemAmountInExpenseCurrency,
  ocItemToCobudgetReceipt,
} from "server/webhooks/ochandlers";

const item = (value: number, currency: string, rate?: number) => ({
  id: `ei_${currency}${value}`,
  description: `${value} ${currency}`,
  amount: Math.round(value * 100), // OC's legacy field: item currency, not expense currency
  amountV2: {
    value,
    currency,
    exchangeRate: rate ? { value: rate } : null,
  },
});

describe("ocItemAmountInExpenseCurrency", () => {
  it("passes through items already in the expense currency", () => {
    expect(ocItemAmountInExpenseCurrency(item(4708, "CZK"))).toBe(470800);
  });

  it("converts foreign-currency items into the expense currency", () => {
    // OC expense #335596: €262.00 on a CZK expense is Kč 6,382.09, not Kč 262.
    expect(ocItemAmountInExpenseCurrency(item(262, "EUR", 24.359113))).toBe(
      638209
    );
    // kr 5,195.57 DKK -> Kč 16,863.68
    expect(ocItemAmountInExpenseCurrency(item(5195.57, "DKK", 3.24578))).toBe(
      1686368
    );
  });

  it("handles rates that shrink the amount", () => {
    // A SEK item on a EUR expense: 1,000.00 SEK -> €86.96
    expect(ocItemAmountInExpenseCurrency(item(1000, "SEK", 0.08696))).toBe(8696);
  });

  it("falls back to the legacy amount when amountV2 is absent", () => {
    expect(
      ocItemAmountInExpenseCurrency({ amount: 1234, description: "legacy" })
    ).toBe(1234);
  });

  it("reproduces the OC total for expense #335596", () => {
    // The nine mixed-currency items that were previously stored at face value.
    const items = [
      item(4708, "CZK"),
      item(262, "EUR", 24.359113),
      item(286, "EUR", 24.163219),
      item(4627, "CZK"),
      item(5195.57, "DKK", 3.24578),
      item(594, "DKK", 3.24437),
      item(558.44, "DKK", 3.24578),
      item(279, "CZK"),
      item(510, "CZK"),
      item(304, "CZK"),
      item(4684, "CZK"),
      item(990, "CZK"),
      item(472, "CZK"),
      item(659, "CZK"),
      item(43, "DKK", 3.23651),
      item(175, "DKK", 3.24),
      item(180, "DKK", 3.23889),
      item(80, "EUR", 24.279),
      item(3000, "CZK"),
      item(1972, "CZK"),
    ];

    const total = items.reduce(
      (sum, i) => sum + ocItemAmountInExpenseCurrency(i),
      0
    );

    // OC reports Kč 59,332.46; the old code summed these to Kč 29,579.01.
    expect(total / 100).toBeCloseTo(59332.46, 0);
    expect(total).toBeGreaterThan(2957901);
  });
});

describe("ocItemToCobudgetReceipt", () => {
  it("stores the converted amount on the receipt", () => {
    const receipt = ocItemToCobudgetReceipt(
      {
        ...item(262, "EUR", 24.359113),
        createdAt: "2026-06-13T00:00:00.000Z",
        file: { url: "https://example.com/receipt.pdf" },
      },
      { id: "expense-1" }
    );

    expect(receipt).toMatchObject({
      amount: 638209,
      expenseId: "expense-1",
      ocExpenseReceiptId: "ei_EUR262",
      attachment: "https://example.com/receipt.pdf",
    });
  });
});
