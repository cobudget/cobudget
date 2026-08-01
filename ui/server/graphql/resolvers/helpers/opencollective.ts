import { UNAUTHORIZED } from "../../../../constants";
import { customOCGqlClient } from "utils/graphqlClient";

export const GET_COLLECTIVE = `
    query ($slug: String, $id: String, $limit: Int!, $offset: Int!){
      collective (slug:$slug, id: $id) {
        id
        slug
        name
        type
        stats {
          balance {
            currency
            valueInCents
          }
        }
        webhooks(limit: $limit, offset: $offset) {
          totalCount
          limit
          nodes {
            webhookUrl
          }
        }
      }
    }
`;

export const GET_PROJECT = `
    query ($slug: String, $id: String, $limit: Int!, $offset: Int!) {
        project (slug:$slug, id: $id) {
          id
          slug
          name
          type
          webhooks(limit: $limit, offset: $offset) {
            totalCount
            limit
            nodes {
              webhookUrl
            }
          }
          parent {
            id
            name
            slug
          }
          stats {
                balance {
                    currency
                    valueInCents
                }
            }
        }
    }
`;

export const GET_EXPENSES_IDS = `
  query Expenses($account: AccountReferenceInput, $limit: Int!, $offset: Int!) {
    expenses(account: $account, limit: $limit, offset: $offset) {
      nodes {
        id
      }
    }
  }
`;

export const GET_EXPENSES = `
  query Expenses($account: AccountReferenceInput, $limit: Int!, $offset: Int!) {
    expenses(account: $account, limit: $limit, offset: $offset) {
      nodes {
        description
        customData
        legacyId
        id
        createdByAccount {
          id
          name
        }
        invoiceInfo
        payoutMethod {
          data
          type
          name
        }
        amountV2 {
          currency
        }
        items {
          id
          amount
          amountV2 {
            value
            currency
            exchangeRate {
              value
            }
          }
          url
          description
          createdAt
          file {
            id
            name
            url
          }
        }
        status
        createdAt
      }
      totalCount
    }
  }
`;

export const GET_EXPENSES_COUNT = `
  query Expenses($account: AccountReferenceInput, $limit: Int) {
    expenses(account: $account, limit: $limit) {
      totalCount
    }
  }
`;

export const GET_EXPENSE = `
  query Expense($expense: ExpenseReferenceInput) {
    expense(expense: $expense) {
      id
      description
      legacyId
      createdAt
      amountV2 {
        currency
      }
      items {
        id
        amount
        amountV2 {
          value
          currency
          exchangeRate {
            value
          }
        }
        description
        createdAt
        file {
          id
          name
          url
        }
      }
      currency
      customData
      status
      createdAt
      payoutMethod {
        data
        id
        name
        type
      }
    }
  }
`;

const handleOCError = (err) => {
  const status = err.response?.status;
  if (status === 401) {
    return { error: { status: 401, message: UNAUTHORIZED } };
  }
  return {
    error: {
      status: status || 500,
      message: err.message || "Unknown Open Collective API error",
    },
  };
};

export const VALIDATE_TOKEN = `
  query {
    loggedInAccount {
      id
      slug
    }
  }
`;

export const validateOCToken = async (token: string) => {
  const graphqlClient = customOCGqlClient(token);
  try {
    const response = await graphqlClient.request(VALIDATE_TOKEN);
    if (!response?.loggedInAccount?.id) {
      return { error: { status: 401, message: UNAUTHORIZED } };
    }
    return response.loggedInAccount;
  } catch (err) {
    return handleOCError(err);
  }
};

export const getCollective = async (
  filter: { slug?: string; id?: string },
  token: string
) => {
  const graphqlClient = customOCGqlClient(token);
  try {
    const response = await graphqlClient.request(GET_COLLECTIVE, {
      ...filter,
      limit: 100,
      offset: 0,
    });
    return response.collective;
  } catch (err) {
    return handleOCError(err);
  }
};

export const getProject = async (
  filter: { slug?: string; id?: string },
  token: string
) => {
  const graphqlClient = customOCGqlClient(token);
  try {
    const response = await graphqlClient.request(GET_PROJECT, {
      ...filter,
      limit: 100,
      offset: 0,
    });
    return response.project;
  } catch (err) {
    return null;
  }
};

export const getCollectiveOrProject = async (
  filter: { slug?: string; id?: string },
  isProject,
  token: string
) => {
  return isProject ? getProject(filter, token) : getCollective(filter, token);
};

export const getExpense = async (id: number, token: string) => {
  const graphqlClient = customOCGqlClient(token);
  try {
    const response = await graphqlClient.request(GET_EXPENSE, {
      expense: { legacyId: id },
    });
    return response.expense;
  } catch (err) {
    return null;
  }
};

export const getExpenses = async (
  { slug, offset, limit }: { slug: string; offset: number; limit: number },
  token: string
) => {
  const graphqlClient = customOCGqlClient(token);
  try {
    const response = await graphqlClient.request(GET_EXPENSES, {
      account: {
        slug,
      },
      limit,
      offset,
    });
    return response.expenses.nodes || [];
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const getExpensesIds = async (
  { slug, offset, limit }: { slug: string; offset: number; limit: number },
  token: string
) => {
  const graphqlClient = customOCGqlClient(token);
  try {
    const response = await graphqlClient.request(GET_EXPENSES_IDS, {
      account: {
        slug,
      },
      limit,
      offset,
    });
    return {
      expensesIds: response.expenses.nodes || null,
      error: !response.expenses.nodes,
    };
  } catch (err) {
    return {
      error: true,
    };
  }
};

export const getExpensesCount = async (slug: string, token: string) => {
  try {
    const graphqlClient = customOCGqlClient(token);
    const response = await graphqlClient.request(GET_EXPENSES_COUNT, {
      account: {
        slug,
      },
      limit: 1000,
    });
    return {
      count: response.expenses.totalCount,
      error: "totalCount" in response,
    };
  } catch (error) {
    return { error };
  }
};
