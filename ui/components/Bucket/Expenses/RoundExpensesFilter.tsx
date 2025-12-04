import MultiSelect from "components/MultiSelect";
import { SelectField } from "components/SelectInput";
import {
  EXPENSE_APPROVED,
  EXPENSE_ERROR,
  EXPENSE_INCOMPLETE,
  EXPENSE_PAID,
  EXPENSE_REJECTED,
  EXPENSE_SUBMITTED,
} from "../../../constants";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

function RoundExpensesFilter({ onFilterChange, filters, round, buckets }) {
  const intl = useIntl();

  const expenseStatusTypes = useMemo(() => {
    return [
      {
        value: EXPENSE_SUBMITTED,
        label: intl.formatMessage({ defaultMessage: "Submitted" }),
      },
      {
        value: EXPENSE_APPROVED,
        label: intl.formatMessage({ defaultMessage: "Approved" }),
      },
      {
        value: EXPENSE_INCOMPLETE,
        label: intl.formatMessage({ defaultMessage: "Incomplete" }),
      },
      {
        value: EXPENSE_PAID,
        label: intl.formatMessage({ defaultMessage: "Paid" }),
      },
      {
        value: EXPENSE_REJECTED,
        label: intl.formatMessage({ defaultMessage: "Rejected" }),
      },
      {
        value: EXPENSE_ERROR,
        label: intl.formatMessage({ defaultMessage: "Error" }),
      },
    ];
  }, [intl]);

  return (
    <div className="grid sm:grid-cols-5 grid-cold-4 gap-2">
      <div className="sm:col-span-3 col-span-2 flex flex-1 bg-white shadow-sm rounded-md border-transparent focus-within:border-gray-900 border-3 px-1 relative pr-10 items-center overflow-hidden">
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
      <div>
        <MultiSelect
          items={expenseStatusTypes}
          onChange={(status) => {
            if (status.length === 0) {
              onFilterChange({ ...filters, status: undefined });
            } else {
              onFilterChange({ ...filters, status });
            }
          }}
          value={filters.status || []}
          color={round?.color}
          label={intl.formatMessage({ defaultMessage: "Filter by status" })}
        />
      </div>
    </div>
  );
}

export default RoundExpensesFilter;
