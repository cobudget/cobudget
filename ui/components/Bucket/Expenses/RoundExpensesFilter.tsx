import { SelectField } from "components/SelectInput";
import React from "react";
import { useIntl } from "react-intl";

function RoundExpensesFilter({ onFilterChange, filters, round, buckets }) {
  const intl = useIntl();

  return (
    <div className="flex gap-2">
      <div className="flex-1 bg-white shadow-sm rounded-md border-transparent focus-within:border-gray-900 border-3 px-1 relative pr-10 flex items-center overflow-hidden">
        <input
          placeholder={intl.formatMessage({ defaultMessage: "Search..." })}
          className="appearance-none block px-3 py-2 w-full placeholder-gray-400 text-gray-600 focus:text-gray-800 focus:outline-none"
          value={filters.search}
          onChange={(e) =>
            onFilterChange({ ...filters, search: e.target.value })
          }
        />
      </div>
      <div>
        <SelectField
          color={round?.color}
          inputProps={{
            onChange: (e) => {
              if (e.target.value === "") {
                onFilterChange({ ...filters, bucketId: undefined });
              } else {
                onFilterChange({ ...filters, bucketId: e.target.value });
              }
            },
          }}
        >
          <option value="">
            {intl.formatMessage({ defaultMessage: "All Buckets" })}
          </option>
          {buckets?.map((bucket) => {
            return (
              <option key={bucket.id} value={bucket.id}>
                {bucket.title}
              </option>
            );
          })}
        </SelectField>
      </div>
    </div>
  );
}

export default RoundExpensesFilter;
