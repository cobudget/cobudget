import {
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl } from "react-intl";
import { gql, useMutation, useQuery } from "urql";
import Button from "./Button";
import FormattedCurrency from "./FormattedCurrency";
import IconButton from "./IconButton";
import { EditIcon } from "./Icons";
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

function RoundExpenses({ round }) {
  const intl = useIntl();
  const router = useRouter();
  const [expenseToEdit, setExpenseToEdit] = useState<ExpenseToEdit>();
  const [, updateExpenseBucket] = useMutation(UPDATE_EXPENSE_BUCKET);
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

  return (
    <>
      <div className="page">
        <p className="text-2xl font-semibold">
          <FormattedMessage defaultMessage="Expenses" />
        </p>
        <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <FormattedMessage defaultMessage="Expense" />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage defaultMessage="Amount" />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage defaultMessage="Bucket" />
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {round.expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.title}</TableCell>
                    <TableCell>
                      <FormattedCurrency
                        value={expense.amount}
                        currency={round.currency}
                      />
                    </TableCell>
                    <TableCell>
                      {expense.bucketId ? (
                        <Link
                          href={`/${router.query.group}/${router.query.round}/${
                            bucketsMap[expense.bucketId]?.id
                          }`}
                        >
                          <span className="underline cursor-pointer">
                            {bucketsMap[expense.bucketId]?.title}
                          </span>
                        </Link>
                      ) : (
                        <i
                          onClick={() => setExpenseToEdit(expense)}
                          className="cursor-pointer"
                        >
                          Assign Bucket
                        </i>
                      )}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
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
                  {buckets?.map((bucket) => (
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
