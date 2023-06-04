import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import React from "react";
import { FormattedMessage } from "react-intl";
import FormattedCurrency from "./FormattedCurrency";

function RoundExpenses({ round }) {
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
