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
import { FormattedMessage, useIntl } from "react-intl";
import { gql, useQuery } from "urql";
import Button from "./Button";
import FormattedCurrency from "./FormattedCurrency";
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

type ExpenseToEdit = {
  bucketId: string;
};

function RoundExpenses({ round }) {
  const intl = useIntl();
  const router = useRouter();
  const [expenseToEdit, setExpenseToEdit] = useState<ExpenseToEdit>();
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
    alert(1);
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
                </TableRow>
              </TableHead>
              <TableBody>
                {round.expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.title}</TableCell>
                    <TableCell>
                      <FormattedCurrency
                        value={expense.amount / 100}
                        currency={round.currency}
                      />
                    </TableCell>
                    <TableCell>
                      {expense.bucketId ? (
                        <>
                          <Link
                            href={`/${router.query.group}/${
                              router.query.round
                            }/${bucketsMap[expense.bucketId]?.id}`}
                          >
                            <span className="underline cursor-pointer">
                              {bucketsMap[expense.bucketId]?.title}
                            </span>
                          </Link>
                          <span
                            onClick={() => setExpenseToEdit(expense)}
                            className="ml-2"
                          >
                            Edit
                          </span>
                        </>
                      ) : (
                        <i>Assign Bucket</i>
                      )}
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
              <span>
                <SelectField
                  label={intl.formatMessage({
                    defaultMessage: "Select Bucket",
                  })}
                  defaultValue={
                    expenseToEdit ? expenseToEdit?.bucketId : undefined
                  }
                >
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
              </span>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default RoundExpenses;
