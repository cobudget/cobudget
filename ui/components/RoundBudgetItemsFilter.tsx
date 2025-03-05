import React from "react";
import MultiSelect from "./MultiSelect";
import { SelectField } from "./SelectInput";

function RoundBudgetItemsFilter({
  filters,
  onChangeFilters,
  round,
}: {
  filters: {
    search: string;
    bucketId: string;
    status: string[];
    minBudget: string;
    stretchBudget: string;
  };
  onChangeFilters: (newFilters: any) => void;
  round?: any;
}) {
  const statusOptions = [
    { value: "PENDING_APPROVAL", label: "Pending Approval" },
    { value: "OPEN_FOR_FUNDING", label: "Open for Funding" },
    { value: "FUNDED", label: "Funded" },
    { value: "COMPLETED", label: "Completed" },
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {/* Search input */}
      <div className="bg-white shadow-sm rounded-md px-1 max-w-[150px]">
        <input
          type="text"
          placeholder="Search..."
          className="appearance-none block px-3 py-2 w-full placeholder-gray-400 text-gray-600 focus:text-gray-800 focus:outline-none"
          value={filters.search}
          onChange={(e) =>
            onChangeFilters({ ...filters, search: e.target.value })
          }
        />
      </div>

      {/* Bucket filter */}
      <div>
        <SelectField
          color={round?.color}
          inputProps={{
            value: filters.bucketId,
            onChange: (e) =>
              onChangeFilters({ ...filters, bucketId: e.target.value }),
          }}
        >
          <option value="">All Buckets</option>
          <option value="bucketA">Bucket A</option>
          <option value="bucketB">Bucket B</option>
          <option value="bucketC">Bucket C</option>
        </SelectField>
      </div>

      {/* Status multi-select */}
      <div>
        <MultiSelect
          items={statusOptions}
          onChange={(status) => onChangeFilters({ ...filters, status })}
          value={filters.status}
          color={round?.color}
          label="Filter by Status"
        />
      </div>

      {/* Minimum Budget filter */}
      <div className="max-w-[150px]">
        <input
          type="number"
          placeholder="Min. Budget"
          className="appearance-none block px-3 py-2 w-full placeholder-gray-400 text-gray-600 focus:outline-none bg-white shadow-sm rounded-md"
          value={filters.minBudget}
          onChange={(e) =>
            onChangeFilters({ ...filters, minBudget: e.target.value })
          }
        />
      </div>

      {/* Stretch Budget filter */}
      <div className="max-w-[150px]">
        <input
          type="number"
          placeholder="Stretch Budget"
          className="appearance-none block px-3 py-2 w-full placeholder-gray-400 text-gray-600 focus:outline-none bg-white shadow-sm rounded-md"
          value={filters.stretchBudget}
          onChange={(e) =>
            onChangeFilters({ ...filters, stretchBudget: e.target.value })
          }
        />
      </div>
    </div>
  );
}

export default RoundBudgetItemsFilter;
