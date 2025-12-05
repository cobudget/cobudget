import {
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl } from "react-intl";
import { gql, useMutation, useQuery } from "urql";
import { arraySortByStringKey } from "utils/sorting";
import usePaginatedQuery from "utils/usePaginatedQuery";
import ExpenseStatus from "./Bucket/Expenses/ExpenseStatus";
import RoundExpensesFilter from "./Bucket/Expenses/RoundExpensesFilter";
import Button from "./Button";
import FormattedCurrency from "./FormattedCurrency";
import HappySpinner from "./HappySpinner";
import IconButton from "./IconButton";
import { EditIcon, SortDownIcon, SortIcon, SortUpIcon } from "./Icons";
import LoadMore from "./LoadMore";
import { SelectField } from "./SelectInput";

const BUCKETS_QUERY = gql`
  query BucketsQuery(
    $roundSlug: String!
    $groupSlug: String!
    $limit: Int
    $offset: Int
    $status: [StatusType!]
  ) {
    bucketsPage(
      roundSlug: $roundSlug
      groupSlug: $groupSlug
      limit: $limit
      offset: $offset
      status: $status
    ) {
      buckets {
        id
        title
      }
    }
  }
`;

const EXPENSES_QUERY = gql`
  query ExpensesQuery(
    $roundId: String!
    $limit: Int
    $offset: Int
    $status: [ExpenseStatus!]
    $search: String
    $bucketId: String
    $sortBy: ExpenseSortByOptions
    $sortOrder: SortOrderOptions
  ) {
    expenses(
      roundId: $roundId
      limit: $limit
      offset: $offset
      status: $status
      search: $search
      bucketId: $bucketId
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      moreExist
      total
      expenses {
        id
        title
        amount
        currency
        status
        bucketId
        ocId
        createdAt
        ocMeta {
          legacyId
        }
        bucketId
      }
    }
  }
`;

const UPDATE_EXPENSE_BUCKET = gql`
  mutation UpdateExpense($id: String!, $bucketId: String!) {
    updateExpense(id: $id, bucketId: $bucketId) {
      id
      bucketId
    }
  }
`;

type ExpenseToEdit = {
  bucketId: string;
  id: string;
};

function RoundExpenses({ round, currentUser }) {
  const intl = useIntl();

  const isAdmin =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentGroupMember?.isAdmin;

  const router = useRouter();
  const [expenseToEdit, setExpenseToEdit] = useState<ExpenseToEdit>();
  const [expensesFilter, setExpensesFilter] = useState({
    roundId: round.id,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [, updateExpenseBucket] = useMutation(UPDATE_EXPENSE_BUCKET);
  const {
    data: expensesData,
    fetching: expensesFetching,
    fetchMore,
  } = usePaginatedQuery({
    query: EXPENSES_QUERY,
    variables: expensesFilter,
    toFullPage: (pagesMap) => {
      const pages: Array<{
        expenses: { expenses: any; total: number; moreExist: boolean };
      }> = Object.values(pagesMap);
      return pages.reduce(
        (acc, page) => {
          return {
            total: page.expenses.total,
            moreExists: page.expenses.moreExist,
            expenses: [...acc.expenses, ...page.expenses.expenses],
          };
        },
        {
          total: 0,
          expenses: [],
          moreExists: true,
        }
      );
    },
    limit: 100,
  });

  const [{ data, fetching }] = useQuery({
    query: BUCKETS_QUERY,
    variables: {
      groupSlug: router.query.group,
      roundSlug: router.query.round,
      offset: 0,
      limit: 1e4,
      status: [
        "PENDING_APPROVAL",
        "OPEN_FOR_FUNDING",
        "PARTIAL_FUNDING",
        "IDEA",
        "FUNDED",
        "CANCELED",
        "COMPLETED",
      ],
    },
  });
  const buckets = data?.bucketsPage?.buckets;
  const bucketsMap = useMemo(() => {
    if (buckets && buckets.length > 0) {
      const map = {};
      buckets.forEach((b) => {
        map[b.id] = b;
      });
      return map;
    } else {
      return {};
    }
  }, [buckets]);

  const handleBucketChange = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    if (typeof data.bucketId === "undefined") {
      return toast.error(
        intl.formatMessage({ defaultMessage: "Choose a bucket" })
      );
    }
    const response = await updateExpenseBucket(data);
    if (response.error) {
      toast.error(
        intl.formatMessage({ defaultMessage: "Failed to update bucket" })
      );
    } else {
      toast.success(
        intl.formatMessage({ defaultMessage: "Expense bucket updated" })
      );
      setExpenseToEdit(undefined);
    }
  };

  const sortedBuckets = useMemo(() => {
    if (buckets) {
      return arraySortByStringKey(buckets, "title");
    }
    return [];
  }, [buckets]);

  const expenses = useMemo(() => {
    return expensesData?.expenses || [];
  }, [expensesData]);

  const getSortIcon = (name: string) => {
    if (name === expensesFilter.sortBy) {
      if (expensesFilter.sortOrder === "asc") {
        return <SortUpIcon className="h-3 w-3 text-gray-500" />;
      } else {
        return <SortDownIcon className="h-3 w-3 text-gray-500" />;
      }
    } else {
      return <SortIcon className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <>
      <div className="page">
        <p className="text-2xl font-semibold">
          <FormattedMessage defaultMessage="Expenses" />
        </p>
        <div className="mt-4">
          <RoundExpensesFilter
            filters={expensesFilter}
            onFilterChange={(filter) => setExpensesFilter(filter)}
            round={round}
            buckets={sortedBuckets}
          />
        </div>
        {fetching ? (
          <div className="flex justify-center items-center mt-8">
            <HappySpinner />
          </div>
        ) : (
          <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <span
                        className="cursor-pointer select-none"
                        onClick={() => {
                          setExpensesFilter({
                            ...expensesFilter,
                            sortBy: "title",
                            sortOrder:
                              expensesFilter.sortOrder === "asc"
                                ? "desc"
                                : "asc",
                          });
                        }}
                      >
                        <FormattedMessage defaultMessage="Expense" />
                        <span className="float-right mt-2">
                          {getSortIcon("title")}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className="cursor-pointer select-none"
                        onClick={() => {
                          setExpensesFilter({
                            ...expensesFilter,
                            sortBy: "status",
                            sortOrder:
                              expensesFilter.sortOrder === "asc"
                                ? "desc"
                                : "asc",
                          });
                        }}
                      >
                        <FormattedMessage defaultMessage="Status" />
                        <span className="float-right mt-2">
                          {getSortIcon("status")}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className="cursor-pointer select-none"
                        onClick={() => {
                          setExpensesFilter({
                            ...expensesFilter,
                            sortBy: "amount",
                            sortOrder:
                              expensesFilter.sortOrder === "asc"
                                ? "desc"
                                : "asc",
                          });
                        }}
                      >
                        <FormattedMessage defaultMessage="Amount" />
                        <span className="float-right mt-2">
                          {getSortIcon("amount")}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className="cursor-pointer select-none"
                        onClick={() => {
                          setExpensesFilter({
                            ...expensesFilter,
                            sortBy: "bucketTitle",
                            sortOrder:
                              expensesFilter.sortOrder === "asc"
                                ? "desc"
                                : "asc",
                          });
                        }}
                      >
                        <FormattedMessage defaultMessage="Bucket" />
                        <span className="float-right mt-2">
                          {getSortIcon("bucketTitle")}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className="cursor-pointer select-none"
                        onClick={() => {
                          setExpensesFilter({
                            ...expensesFilter,
                            sortBy: "createdAt",
                            sortOrder:
                              expensesFilter.sortOrder === "asc"
                                ? "desc"
                                : "asc",
                          });
                        }}
                      >
                        <FormattedMessage defaultMessage="Date Created" />
                        <span className="float-right mt-2">
                          {getSortIcon("createdAt")}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {expense?.ocId ? (
                          <a
                            target="_blank"
                            className="underline"
                            href={
                              round?.ocCollective?.parent
                                ? `https://opencollective.com/${round?.ocCollective?.parent?.slug}/projects/${round?.ocCollective?.slug}/expenses/${expense?.ocMeta?.legacyId}`
                                : `https://opencollective.com/${round?.ocCollective?.slug}/expenses/${expense?.ocMeta?.legacyId}`
                            }
                            rel="noreferrer"
                          >
                            {expense.title}
                          </a>
                        ) : (
                          <span>{expense.title}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-block">
                          <ExpenseStatus
                            expense={expense}
                            currentUser={currentUser}
                          />
                        </span>
                      </TableCell>
                      <TableCell>
                        <FormattedCurrency
                          value={expense.amount}
                          currency={expense.currency || round.currency}
                        />
                      </TableCell>
                      <TableCell>
                        {expense.bucketId ? (
                          <Link
                            href={`/${router.query.group}/${
                              router.query.round
                            }/${bucketsMap[expense.bucketId]?.id}`}
                          >
                            <span className="underline cursor-pointer">
                              {bucketsMap[expense.bucketId]?.title}
                            </span>
                          </Link>
                        ) : isAdmin ? (
                          <i
                            onClick={() => setExpenseToEdit(expense)}
                            className="cursor-pointer"
                          >
                            Assign Bucket
                          </i>
                        ) : (
                          <i>No Bucket Assigned</i>
                        )}
                      </TableCell>
                      <TableCell>
                        {expense.createdAt
                          ? dayjs(expense.createdAt).format("DD/MM/YYYY")
                          : null}
                      </TableCell>
                      <TableCell>
                        {isAdmin && (
                          <div className="text-right">
                            <span
                              onClick={() => setExpenseToEdit(expense)}
                              className="ml-2"
                            >
                              <IconButton>
                                <EditIcon className="h-4 w-4" />
                              </IconButton>
                            </span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
        <LoadMore
          onClick={fetchMore}
          moreExist={expensesData?.moreExists}
          loading={expensesFetching}
          autoLoadMore={false}
        />
      </div>
      <Modal
        className="flex items-center justify-center p-4"
        open={!!expenseToEdit}
        onClose={() => setExpenseToEdit(undefined)}
      >
        <div className="z-50 inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <p>Edit Expense Bucket</p>
          <p className="text-lg font-medium">Expense</p>
          <div className="mt-4">
            <form onSubmit={handleBucketChange}>
              <input type="hidden" name="id" value={expenseToEdit?.id} />
              <span>
                <SelectField
                  name="bucketId"
                  label={intl.formatMessage({
                    defaultMessage: "Select Bucket",
                  })}
                  defaultValue={
                    expenseToEdit ? expenseToEdit?.bucketId : undefined
                  }
                >
                  <option
                    value=""
                    disabled
                    hidden
                    selected={!expenseToEdit?.bucketId}
                  >
                    {intl.formatMessage({ defaultMessage: "Choose bucket" })}
                  </option>
                  {sortedBuckets?.map((bucket) => (
                    <option key={bucket.id} value={bucket.id}>
                      {bucket.title}
                    </option>
                  ))}
                </SelectField>
              </span>
              <span className="mt-4 block">
                <Button className="w-full" type="submit">
                  <FormattedMessage defaultMessage="Save" />
                </Button>
                <Button
                  onClick={() => setExpenseToEdit(undefined)}
                  variant="secondary"
                  className="mt-2 w-full"
                >
                  <FormattedMessage defaultMessage="Cancel" />
                </Button>
              </span>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default RoundExpenses;
