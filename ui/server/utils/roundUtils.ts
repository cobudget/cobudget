import interator from "./interator";

export const getOCToken = (round) => {
  return round?.ocToken || process.env.OPENCOLLECTIVE_API_KEY;
};

export const getAccountsInsertRawQuery = (count: number) => {
  return `INSERT INTO "Account" () VALUES ${interator(count, () => "()").join(", ")};`;
}
