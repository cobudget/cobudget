import React, { useState, useMemo, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import RoundBudgetItemsFilter from "./RoundBudgetItemsFilter";
import LoadMore from "./LoadMore";
import Label from "./Label";
import getStatusColor from "../utils/getStatusColor";
import { SortDownIcon, SortIcon, SortUpIcon } from "./Icons";
import { gql, useQuery } from "urql";
import Link from "next/link";

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

const BUDGET_ITEMS_QUERY = gql`
  query BudgetItems(
    $roundId: ID!
    $search: String
    $bucketId: ID
    $status: [StatusType]
    $minBudget: Int
    $stretchBudget: Int
    $offset: Int
    $limit: Int
    $orderBy: String
    $orderDir: SortOrderOptions
  ) {
    budgetItems(
      roundId: $roundId
      search: $search
      bucketId: $bucketId
      status: $status
      minBudget: $minBudget
      stretchBudget: $stretchBudget
      offset: $offset
      limit: $limit
      orderBy: $orderBy
      orderDir: $orderDir
    ) {
      total
      moreExist
      budgetItems {
        id
        description
        minBudget
        stretchBudget
        bucket {
          id
          title
          status
        }
      }
      error
    }
  }
`;

function RoundBudgetItems({ round, currentUser, currentGroup }) {
  const [filters, setFilters] = useState({
    search: "",
    status: [] as string[],
    minBudget: "",
    stretchBudget: "",
  });

  const [offset, setOffset] = useState(0);
  const limit = 10;
  
  // Sort state
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: string }>({
    key: "description",
    direction: "asc",
  });

  // Convert sort config to GraphQL variables
  const orderBy = sortConfig.key === "minBudget" 
    ? "minBudget" 
    : sortConfig.key === "stretchBudget" 
      ? "stretchBudget" 
      : sortConfig.key === "description" 
        ? "description" 
        : "createdAt";
  
  const orderDir = sortConfig.direction as "asc" | "desc";

  // Parse numeric filters - convert dollars to cents (multiply by 100)
  const minBudgetNum = filters.minBudget ? parseInt(filters.minBudget) * 100 : undefined;
  const stretchBudgetNum = filters.stretchBudget ? parseInt(filters.stretchBudget) * 100 : undefined;

  // Fetch budget items from GraphQL
  const [{ data, fetching, error }, refetchBudgetItems] = useQuery({
    query: BUDGET_ITEMS_QUERY,
    variables: {
      roundId: round?.id,
      search: filters.search || undefined,
      status: filters.status.length > 0 ? filters.status : undefined,
      minBudget: minBudgetNum,
      stretchBudget: stretchBudgetNum,
      offset,
      limit,
      orderBy,
      orderDir,
    },
    pause: !round?.id,
  });

  // Transform the data for display - convert cents to dollars (divide by 100)
  const budgetItems = useMemo(() => {
    if (!data?.budgetItems?.budgetItems) return [];
    
    return data.budgetItems.budgetItems.map(item => ({
      id: item.id,
      description: item.description,
      minBudget: item.minBudget != null ? item.minBudget / 100 : item.minBudget,
      stretchBudget: item.stretchBudget != null ? item.stretchBudget / 100 : item.stretchBudget,
      bucket: item.bucket,  // added for linking
      bucketName: item.bucket?.title || "Unknown",
      bucketStatus: item.bucket?.status || "UNKNOWN",
    }));
  }, [data]);

  // Reset offset when filters change
  useEffect(() => {
    setOffset(0);
  }, [filters, sortConfig]);

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

  const handleLoadMore = () => {
    if (data?.budgetItems?.moreExist && !fetching) {
      setOffset(prev => prev + limit);
    }
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

      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          Error loading budget items: {error.message}
        </div>
      )}

      {/* API error message */}
      {data?.budgetItems?.error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          {data.budgetItems.error}
        </div>
      )}

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
              {fetching && !budgetItems.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading budget items...
                  </TableCell>
                </TableRow>
              ) : budgetItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No budget items found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                budgetItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.minBudget}</TableCell>
                    <TableCell>{item.stretchBudget != null ? item.stretchBudget : '-'}</TableCell>
                    <TableCell>
                      {item.bucket ? (
                        <Link href={`/${currentGroup.slug}/${round.slug}/${item.bucket.id}`} passHref shallow>
                          <span className="underline cursor-pointer text-black">{item.bucketName}</span>
                        </Link>
                      ) : (
                        item.bucketName
                      )}
                    </TableCell>
                    <TableCell>
                      <Label className={`${getStatusColor(item.bucketStatus, item)} inline-block w-auto`}>
                        {bucketStatusLabels[item.bucketStatus] || item.bucketStatus}
                      </Label>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Load More button */}
      <div className="mt-4">
        <LoadMore
          moreExist={data?.budgetItems?.moreExist || false}
          loading={fetching}
          onClick={handleLoadMore}
          autoLoadMore={false}
        />
      </div>
    </div>
  );
}

export default RoundBudgetItems;
