import { useMemo } from "react";
import BucketCard from "components/BucketCard";
import FormattedCurrency from "components/FormattedCurrency";
import Markdown from "components/Markdown";
import type { PreparedRow } from "utils/bucketImport/prepareImport";

type Field = { id: string; name: string };

// "As it will appear": the card (the real BucketCard, fed a synthetic bucket)
// and a read-only page view. The page view is a thin render rather than the
// real Bucket components, which carry their own queries and edit hooks.
const BucketPreview = ({
  row,
  round,
  fields,
}: {
  row: PreparedRow;
  round: any;
  fields: Field[];
}) => {
  const { payload } = row;
  const image = payload.images?.[0]?.small ?? null;

  const bucket = useMemo(
    () => ({
      title: payload.title || "(no title)",
      summary: payload.summary,
      images: image ? [{ small: image, large: image }] : [],
      published: true,
      approved: true,
      status: "OPEN_FOR_FUNDING",
      minGoal: row.totalMinor,
      maxGoal: row.totalMinor,
      totalContributions: 0,
      noOfComments: 0,
    }),
    [payload.title, payload.summary, image, row.totalMinor]
  );

  const filled = payload.fieldValues
    .map((fv) => ({
      name: fields.find((f) => f.id === fv.fieldId)?.name ?? "",
      value: fv.value,
    }))
    .filter((f) => typeof f.value === "string" && f.value);

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] items-start">
        <div>
          <h4 className="font-medium text-sm mb-2">Card</h4>
          <div className="max-w-sm">
            <BucketCard
              bucket={bucket}
              round={{ ...round, grantingHasClosed: false }}
            />
          </div>
        </div>
        <div>
          <h4 className="font-medium text-sm mb-2">Page</h4>
          <div className="bg-white rounded-lg shadow p-4 space-y-3">
            {image && (
              <img
                src={image}
                alt=""
                className="w-full max-h-64 object-cover rounded"
              />
            )}
            <h2 className="text-2xl font-semibold">{bucket.title}</h2>
            {payload.summary && (
              <p className="text-gray-800">{payload.summary}</p>
            )}
            {filled.map((f) => (
              <div key={f.name}>
                <h3 className="font-medium text-lg">{f.name}</h3>
                <Markdown source={f.value as string} />
              </div>
            ))}
            <div>
              <h3 className="font-medium text-lg">Budget</h3>
              <table className="text-sm w-full">
                <tbody>
                  {payload.budgetItems.map((b, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-1 pr-2">{b.description}</td>
                      <td className="py-1 text-right">
                        <FormattedCurrency
                          value={b.amount}
                          currency={round.currency}
                        />
                      </td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td className="py-1">Total ask</td>
                    <td className="py-1 text-right">
                      <FormattedCurrency
                        value={row.totalMinor}
                        currency={round.currency}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Preview of the bucket as created: published and open for funding.
      </p>
    </div>
  );
};

export default BucketPreview;
