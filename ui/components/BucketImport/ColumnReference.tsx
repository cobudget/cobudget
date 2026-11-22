import { budgetColumnPattern } from "utils/fieldKey";
import { buildColumns, skippedFields } from "utils/bucketImport/columns";
import type { ImportFieldDef } from "utils/bucketImport/types";

// Column reference: generated from the round's fields (the same model the
// parser, the template and the validator use, so it cannot drift).
const ColumnReference = ({ fields }: { fields: ImportFieldDef[] }) => {
  const columns = buildColumns(fields);
  const skipped = skippedFields(fields);

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
          {columns.map((c) => (
            <tr key={c.column} className="border-b align-top">
              <td className="py-1 pr-4 font-mono">{c.column}</td>
              <td className="py-1 pr-4">{c.required ? "Yes" : "No"}</td>
              <td className="py-1 pr-4">
                {c.field ? `Form item "${c.field.name}"` : c.target}
              </td>
              <td className="py-1">{c.description}</td>
            </tr>
          ))}
          <tr className="align-top">
            <td className="py-1 pr-4 font-mono">
              {"budget-item-N"}
              <br />
              {"budget-amount-N"}
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
      {skipped.length > 0 && (
        <p className="text-xs text-gray-600 mt-2">
          Not importable (no column): {skipped.map((f) => f.name).join(", ")}.
        </p>
      )}
    </div>
  );
};

export default ColumnReference;
