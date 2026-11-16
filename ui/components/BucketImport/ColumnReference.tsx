import {
  baseColumns,
  budgetColumnPattern,
  normalizeName,
} from "utils/bucketImport/config";

type Field = { name: string; options?: string[] | null; limit?: number | null };

// Column reference: required/optional, limits and allowed values, generated
// from the same config the parser/validator use (so it cannot drift).
const ColumnReference = ({ fields }: { fields: Field[] }) => {
  const fieldFor = (name?: string) =>
    name
      ? fields.find((f) => normalizeName(f.name) === normalizeName(name))
      : null;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600 border-b">
            <th className="py-1 pr-4">Column</th>
            <th className="py-1 pr-4">Required</th>
            <th className="py-1 pr-4">Maps to</th>
            <th className="py-1">Notes</th>
          </tr>
        </thead>
        <tbody>
          {baseColumns.map((c) => {
            const field = fieldFor(c.fieldName);
            return (
              <tr key={c.column} className="border-b align-top">
                <td className="py-1 pr-4 font-mono">{c.column}</td>
                <td className="py-1 pr-4">{c.required ? "Yes" : "No"}</td>
                <td className="py-1 pr-4">
                  {c.target === "field"
                    ? `Custom field "${c.fieldName}"${
                        field ? "" : " (missing in this round!)"
                      }`
                    : c.target}
                </td>
                <td className="py-1">
                  {c.description}
                  {field?.options?.length ? (
                    <div className="text-gray-600">
                      Allowed values (exact): {field.options.join(" | ")}
                    </div>
                  ) : null}
                  {field?.limit ? (
                    <div className="text-gray-600">
                      Max {field.limit} characters.
                    </div>
                  ) : null}
                </td>
              </tr>
            );
          })}
          <tr className="align-top">
            <td className="py-1 pr-4 font-mono">
              {"budget_item_N"}
              <br />
              {"budget_amount_N"}
            </td>
            <td className="py-1 pr-4">At least one</td>
            <td className="py-1 pr-4">Budget item (expense)</td>
            <td className="py-1">
              Add as many pairs as needed (N = 1, 2, 3, ...; matching{" "}
              <span className="font-mono">
                {String(budgetColumnPattern.item.source)}
              </span>
              ). Amount in the round&apos;s currency, up to 2 decimals, no
              currency symbol. The total ask is the sum of the amounts.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ColumnReference;
