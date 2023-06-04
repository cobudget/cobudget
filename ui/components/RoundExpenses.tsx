import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { gql, useQuery } from "urql";
import FormattedCurrency from "./FormattedCurrency";

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

function RoundExpenses({ round }) {
  const router = useRouter();
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
  const buckets = data.bucketsPage.buckets;
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

  return (
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
                      <Link
                        href={`/${router.query.group}/${router.query.round}/${
                          bucketsMap[expense.bucketId].id
                        }`}
                      >
                        <span className="underline cursor-pointer">
                          {bucketsMap[expense.bucketId]?.title}
                        </span>
                      </Link>
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
  );
}

export default RoundExpenses;
