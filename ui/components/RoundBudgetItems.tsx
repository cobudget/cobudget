import React, { useState } from "react";
import RoundBudgetItemsFilter from "./RoundBudgetItemsFilter";
import LoadMore from "./LoadMore";

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
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Minimum Budget
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Stretch Budget
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Bucket
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Bucket Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {budgetItems.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">{item.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">${item.minBudget}</td>
                <td className="px-6 py-4 whitespace-nowrap">${item.stretchBudget}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.bucketName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.bucketStatus}</td>
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
