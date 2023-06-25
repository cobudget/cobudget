/**
 * OpenCollective webhook types related to expense
 */

export const OC_EXPENSE_APPROVED = "collective.expense.approved";
export const OC_EXPENSE_UNAPPROVED = "collective.expense.unapproved";
export const OC_EXPENSE_REJECTED = "collective.expense.rejected";
export const OC_EXPENSE_CREATED = "collective.expense.created";
export const OC_EXPENSE_UPDATED = "collective.expense.updated";

export const UNAUTHORIZED = "UNAUTHORIZED";
export const UNAUTHORIZED_STATUS = 401;

export const TOKEN_STATUS = {
  PROVIDED: "PROVIDED",
  EMPTY: "EMPTY",
};

export const OC_STATUS_MAP = {
  DRAFT: "DRAFT",
  UNVERIFIED: "UNVERIFIED",
  PENDING: "SUBMITTED",
  INCOMPLETE: "INCOMPLETE",
  APPROVED: "APPROVED",
  SUBMITTED: "SUBMITTED",
  PAID: "PAID",
  REJECTED: "REJECTED",
  PROCESSING: "PROCESSING",
  ERROR: "ERROR",
  SCHEDULED_FOR_PAYMENT: "SCHEDULED_FOR_PAYMENT",
  SPAM: "SPAM",
  CANCELED: "CANCELED",
};
