import Label from "components/Label";
import {
  EXPENSE_SUBMITTED,
  EXPENSE_PAID,
  EXPENSE_REJECTED,
  OC_STATUS_MAP,
} from "../../../constants";
import React, { useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useMutation } from "urql";
import { Menu, MenuItem } from "@material-ui/core";
import { CheveronDownIcon } from "components/Icons";

const UPDATE_EXPENSE_STATUS = `
  mutation UPDATE_EXPENSE_STATUS ($id: String!, $status: ExpenseStatus!) {
    updateExpenseStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

function ExpenseStatus({ expense, currentUser }) {
  const intl = useIntl();

  const [{ fetching }, updateExpenseStatus] = useMutation(
    UPDATE_EXPENSE_STATUS
  );
  const [anchorEl, setAnchorEl] = useState();

  const status = {
    DRAFT: intl.formatMessage({ defaultMessage: "Draft" }),
    UNVERIFIED: intl.formatMessage({ defaultMessage: "Unverified" }),
    PENDING: intl.formatMessage({ defaultMessage: "Pending" }),
    INCOMPLETE: intl.formatMessage({ defaultMessage: "Incomplete" }),
    APPROVED: intl.formatMessage({ defaultMessage: "Approved" }),

    SUBMITTED: intl.formatMessage({ defaultMessage: "Submitted" }),
    PAID: intl.formatMessage({ defaultMessage: "Paid" }),
    REJECTED: intl.formatMessage({ defaultMessage: "Rejected" }),

    PROCESSING: intl.formatMessage({ defaultMessage: "Processing" }),
    ERROR: intl.formatMessage({ defaultMessage: "Error" }),
    SCHEDULED_FOR_PAYMENT: intl.formatMessage({
      defaultMessage: "Scheduled for payment",
    }),
    SPAM: intl.formatMessage({ defaultMessage: "Span" }),
    CANCELED: intl.formatMessage({ defaultMessage: "Canceled" }),
  };

  const className = useMemo(() => {
    if (expense.status === EXPENSE_SUBMITTED) return "bg-app-gray";
    else if (
      expense.status === EXPENSE_PAID ||
      expense.status === OC_STATUS_MAP.APPROVED
    )
      return "bg-app-green";
  }, [expense]);

  const editingAllowed =
    !expense.ocId &&
    (currentUser?.currentCollMember?.isAdmin ||
      currentUser?.currentCollMember?.isModerator);
  const handleClick = (e) => {
    if (editingAllowed || !fetching) {
      setAnchorEl(e.target);
    }
  };

  return expense ? (
    <>
      <span
        onClick={handleClick}
        className={"cursor-pointer " + (fetching ? "opacity-50" : "")}
      >
        <Label className={className + " flex"}>
          {status[expense.status]}
          {editingAllowed ? <CheveronDownIcon height={16} width={16} /> : null}
        </Label>
      </span>
      <Menu
        id="expense-status-setting"
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(undefined)}
        className="mt-8"
      >
        {expense?.status === EXPENSE_PAID ? (
          <MenuItem
            onClick={() => {
              setAnchorEl(undefined);
              updateExpenseStatus({
                id: expense.id,
                status: EXPENSE_SUBMITTED,
              });
            }}
          >
            <FormattedMessage defaultMessage="Mark as Unpaid" />
          </MenuItem>
        ) : expense?.status === EXPENSE_REJECTED ? (
          <MenuItem
            onClick={() => {
              setAnchorEl(undefined);
              updateExpenseStatus({
                id: expense.id,
                status: EXPENSE_SUBMITTED,
              });
            }}
          >
            <FormattedMessage defaultMessage="Reset Status" />
          </MenuItem>
        ) : (
          <>
            <MenuItem
              onClick={() => {
                setAnchorEl(undefined);
                updateExpenseStatus({ id: expense.id, status: EXPENSE_PAID });
              }}
            >
              <FormattedMessage defaultMessage="Mark as Paid" />
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(undefined);
                updateExpenseStatus({
                  id: expense.id,
                  status: EXPENSE_REJECTED,
                });
              }}
            >
              <span className="text-red">
                <FormattedMessage defaultMessage="Reject" />
              </span>
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  ) : null;
}

export default ExpenseStatus;
