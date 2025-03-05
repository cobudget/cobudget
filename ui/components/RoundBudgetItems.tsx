import React, { useState, useMemo } from "react";
import RoundBudgetItemsFilter from "./RoundBudgetItemsFilter";
import LoadMore from "./LoadMore";
import Label from "./Label";
import getStatusColor from "../utils/getStatusColor";

// Mapping of bucket statuses to their display labels (as used in BucketCard)
const bucketStatusLabels = {
  PENDING_APPROVAL: "Draft",
  IDEA: "Idea",
  OPEN_FOR_FUNDING: "Funding",
  FUNDED: "Funded",
  PARTIAL_FUNDING: "Partial Funding",
  CANCELED: "Canceled",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

function RoundBudgetItems({ round, currentUser }) {
  const [filters, setFilters] = useState({
    search: "",
    bucketId: "",
    status: [] as string[],
    minBudget: "",
    stretchBudget: "",
  });

  // Dummy data for now
  const [budgetItems, setBudgetItems] = useState([
    {
      id: "1",
      description: "Development Team",
      minBudget: 2000,
      stretchBudget: 3500,
      bucketName: "Bucket A",
      bucketStatus: "OPEN_FOR_FUNDING",
    },
    {
      id: "2",
      description: "Marketing Campaign",
      minBudget: 1500,
      stretchBudget: 2000,
      bucketName: "Bucket B",
      bucketStatus: "FUNDED",
    },
    {
      id: "3",
      description: "Conference Sponsorship",
      minBudget: 500,
      stretchBudget: 750,
      bucketName: "Bucket C",
      bucketStatus: "PENDING_APPROVAL",
    },
  ]);

  // Sorting state: key is the column to sort by, direction is "asc" or "desc"
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: string }>({
    key: null,
    direction: "asc",
  });
  
  // Toggle sort order for a given column key
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };
  
  // Compute the sorted items: sorts numerically when applicable, otherwise uses string comparison
  const sortedBudgetItems = useMemo(() => {
    if (!sortConfig.key) return budgetItems;
    return [...budgetItems].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      return sortConfig.direction === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [budgetItems, sortConfig]);

  const handleLoadMore = () => {
    // Append additional dummy items
    const moreDummy = [
      {
        id: "4",
        description: "Community Workshops",
        minBudget: 1000,
        stretchBudget: 1200,
        bucketName: "Bucket D",
        bucketStatus: "PENDING_APPROVAL",
      },
      {
        id: "5",
        description: "Design & Branding",
        minBudget: 800,
        stretchBudget: 1000,
        bucketName: "Bucket E",
        bucketStatus: "OPEN_FOR_FUNDING",
      },
    ];
    setBudgetItems((prev) => [...prev, ...moreDummy]);
  };

  return (
    <div className="page">
      <h2 className="text-2xl font-semibold">Budget Items</h2>

      {/* Render filters */}
      <div className="mt-4">
        <RoundBudgetItemsFilter
          filters={filters}
          onChangeFilters={setFilters}
          round={round}
        />
      </div>

      {/* Table of budget items (using same design as expenses page) */}
      <div className="mt-4 shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("description")}
              >
                Description {sortConfig.key === "description" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("minBudget")}
              >
                Minimum Budget {sortConfig.key === "minBudget" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("stretchBudget")}
              >
                Stretch Budget {sortConfig.key === "stretchBudget" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("bucketName")}
              >
                Bucket {sortConfig.key === "bucketName" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("bucketStatus")}
              >
                Bucket Status {sortConfig.key === "bucketStatus" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedBudgetItems.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">{item.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">${item.minBudget}</td>
                <td className="px-6 py-4 whitespace-nowrap">${item.stretchBudget}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.bucketName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Label className={`${getStatusColor(item.bucketStatus, item)} inline-block w-auto`}>
                    {bucketStatusLabels[item.bucketStatus] || item.bucketStatus}
                  </Label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load More button */}
      <div className="mt-4">
        <LoadMore
          moreExist={true}
          loading={false}
          onClick={handleLoadMore}
          autoLoadMore={false}
        />
      </div>
    </div>
  );
}

export default RoundBudgetItems;
