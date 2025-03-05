import React, { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import RoundBudgetItemsFilter from "./RoundBudgetItemsFilter";
import LoadMore from "./LoadMore";
import Label from "./Label";
import getStatusColor from "../utils/getStatusColor";
import { SortDownIcon, SortIcon, SortUpIcon } from "./Icons";

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
  
  const getSortIcon = (column: string) => {
    if (sortConfig.key === column) {
      return sortConfig.direction === "asc" ? (
        <SortUpIcon className="h-3 w-3 text-gray-500" />
      ) : (
        <SortDownIcon className="h-3 w-3 text-gray-500" />
      );
    }
    return <SortIcon className="h-3 w-3 text-gray-500" />;
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

      {/* Budget Items table — reusing the same Material‑UI components as in the Expenses table */}
      <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <span
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("description")}
                  >
                    Description
                    <span className="float-right mt-2">{getSortIcon("description")}</span>
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("minBudget")}
                  >
                    Minimum Budget
                    <span className="float-right mt-2">{getSortIcon("minBudget")}</span>
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("stretchBudget")}
                  >
                    Stretch Budget
                    <span className="float-right mt-2">{getSortIcon("stretchBudget")}</span>
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("bucketName")}
                  >
                    Bucket
                    <span className="float-right mt-2">{getSortIcon("bucketName")}</span>
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("bucketStatus")}
                  >
                    Bucket Status
                    <span className="float-right mt-2">{getSortIcon("bucketStatus")}</span>
                  </span>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedBudgetItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>${item.minBudget}</TableCell>
                  <TableCell>${item.stretchBudget}</TableCell>
                  <TableCell>{item.bucketName}</TableCell>
                  <TableCell>
                    <Label className={`${getStatusColor(item.bucketStatus, item)} inline-block w-auto`}>
                      {bucketStatusLabels[item.bucketStatus] || item.bucketStatus}
                    </Label>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
