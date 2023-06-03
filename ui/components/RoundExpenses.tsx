import { Table, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import React from "react";
import { FormattedMessage } from "react-intl";

function RoundExpenses ({ round }) {
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
                    </Table>
                </TableContainer>
            </div>
        </div>
    )
}

export default RoundExpenses;
