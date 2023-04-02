import Label from "components/Label";
import { EXPENSE_SUBMITTED, EXPENSE_PAID } from "../../../constants";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

function ExpenseStatus({ expense }) {
  const intl = useIntl();

  const status = {
    SUBMITTED: intl.formatMessage({ defaultMessage: "Submitted" }),
    PAID: intl.formatMessage({ defaultMessage: "Paid" }),
    REJECTED: intl.formatMessage({ defaultMessage: "Rejected" }),
  };

  const className = useMemo(() => {
    if (expense.status === EXPENSE_SUBMITTED) return "bg-app-gray";
    else if (expense.status === EXPENSE_PAID) return "bg-app-green";
  }, [expense]);

  return expense ? (
    <Label className={className}>{status[expense.status]}</Label>
  ) : null;
}

export default ExpenseStatus;
