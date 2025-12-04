import { UNAUTHORIZED } from "../../../../constants";
import { customOCGqlClient } from "utils/graphqlClient";

export const GET_COLLECTIVE = `
    query ($slug: String, $id: String, $limit: Int, $account: AccountReferenceInput!){
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
        webhooks(limit: $limit, account: $account) {
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
    query ($slug: String, $id: String,  $limit: Int, $account: AccountReferenceInput!) {
        project (slug:$slug, id: $id) {
          id
          slug
          name
          type
          webhooks(limit: $limit, account: $account) {
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
  if (err.response.status == 401) {
    return { error: { status: 401, message: UNAUTHORIZED } };
  }
  return null;
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
      account: {
        slug: filter.slug,
        id: filter.id,
      },
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
      account: {
        slug: filter.slug,
        id: filter.id,
      },
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
