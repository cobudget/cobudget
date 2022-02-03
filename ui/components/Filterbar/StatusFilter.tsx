import { Popover } from "@headlessui/react";
import { gql, useQuery } from "urql";

export const BUCKET_STATUS_QUERY = gql`
  query BucketStatus($collectionSlug: String!, $orgSlug: String) {
    collection(collectionSlug: $collectionSlug, orgSlug: $orgSlug) {
      id
      bucketStatusCount {
        PENDING_APPROVAL
        OPEN_FOR_FUNDING
        FUNDED
        CANCELED
        COMPLETED
      }
    }
  }
`;
export default function StatusFilter({
  onChangeStatus,
  statusFilter = [],
  color,
  collection,
  currentOrg,
  className = "",
}) {
  const [
    {
      data: { collection: { bucketStatusCount } } = {
        collection: { bucketStatusCount: {} },
      },
      fetching,
      error,
    },
  ] = useQuery({
    query: BUCKET_STATUS_QUERY,
    variables: {
      collectionSlug: collection.slug,
      orgSlug: currentOrg?.slug ?? "c",
    },
  });
  console.log({ bucketStatusCount, error, fetching });
  const items = [
    {
      type: "PENDING_APPROVAL",
      placeholder: `Pending approval`,
    },
    {
      type: "OPEN_FOR_FUNDING",
      placeholder: "Open for funding",
    },
    {
      type: "FUNDED",
      placeholder: "Funded",
    },
    {
      type: "COMPLETED",
      placeholder: "Delivered",
    },
    {
      type: "CANCELED",
      placeholder: "Canceled",
    },
  ]
    .filter((item) => !!bucketStatusCount[item.type])
    .map((item) => ({
      type: item.type,
      value: statusFilter.includes(item.type),
      placeholder: `${item.placeholder} (${bucketStatusCount[item.type]})`,
    }));

  return (
    <div className={className}>
      <Popover className="relative">
        <Popover.Button
          className={`w-full flex items-center bg-gray-100 border-3 border-gray-100 rounded py-3 px-4 pr-8 relative focus:outline-none focus:ring focus:ring-${color}`}
        >
          Filter by status{" "}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 flex items-center px-2 text-gray-700">
            <svg className="h-4 w-4" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </Popover.Button>

        <Popover.Panel className="absolute z-10 w-56 bg-white p-4 rounded-lg shadow mt-2">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.type}>
                <label className="flex space-x-1.5 items-center">
                  <input
                    type="checkbox"
                    checked={item.value}
                    onChange={() => {
                      if (item.value) {
                        // remove from filter
                        onChangeStatus(
                          statusFilter.filter((status) => status !== item.type)
                        );
                      } else {
                        // add to filter
                        onChangeStatus([...statusFilter, item.type]);
                      }
                    }}
                  ></input>
                  <span>{item.placeholder}</span>
                </label>
              </li>
            ))}
          </ul>
        </Popover.Panel>
      </Popover>
    </div>
  );
}
