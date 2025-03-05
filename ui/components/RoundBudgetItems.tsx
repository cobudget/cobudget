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

      {/* Table of budget items */}
      <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
        <table className="table-fixed w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Minimum Budget</th>
              <th className="px-4 py-2">Stretch Budget</th>
              <th className="px-4 py-2">Bucket</th>
              <th className="px-4 py-2">Bucket Status</th>
            </tr>
          </thead>
          <tbody>
            {budgetItems.map((item) => (
              <tr key={item.id} className="bg-gray-100 even:bg-white">
                <td className="px-4 py-2">{item.description}</td>
                <td className="px-4 py-2">${item.minBudget}</td>
                <td className="px-4 py-2">${item.stretchBudget}</td>
                <td className="px-4 py-2">{item.bucketName}</td>
                <td className="px-4 py-2">{item.bucketStatus}</td>
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
