//BACKED ERRORS
export const MAGIC_LINK_LIMIT = `Only 1 email can be sent per ${Math.ceil(
  parseInt(process.env.MAGIC_LINK_TIME_LIMIT) / 60
)} minutes. Please try again later.`;
export const GRAPHQL_COLLECTIVE_NOT_FOUND = "Collective not found";
export const GRAPHQL_PROJECT_NOT_FOUND = "Project not found";
export const GRAPHQL_EXPENSE_COCREATOR_ONLY = "Only cocreators can add expense";
export const GRAPHQL_NOT_LOGGED_IN = "You need to login to continue";
export const GRAPHQL_EXPENSE_NOT_FOUND = "Expense not found";
export const GRAPHQL_EXPENSE_NOT_SUBMITTED_BY_CURRENT_USER =
  "Expense not submitted by current user";
export const GRAPHQL_ROUND_NOT_FOUND = "Round not found";
export const GRAPHQL_ADMIN_AND_MODERATOR_ONLY =
  "Only admins and moderators can perform this action";
export const GRAPHQL_EXPENSE_RECEIPT_NOT_FOUND = "Expense receipt not found";

export const ROUND_IS_PRIVATE = "The round is private";

//FRONTEND ERRORS
export const COLLECTIVE_NOT_FOUND = "Collective not found";

//EXPENSES
export const GRAPHQL_COLLECTIVE_NOT_VERIFIED = "Collective not verified";
export const GRAPHQL_OC_NOT_INTEGRATED =
  "Opencollective is not integrated for this round";
