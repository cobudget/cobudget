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
    query ($slug: String, $id: String) {
        project (slug:$slug, id: $id) {
          id
          slug
          name
          type
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

export const GET_EXPENSES = `
  query Expenses($account: AccountReferenceInput, $limit: Int!) {
    expenses(account: $account, limit: $limit) {
      nodes {
        description
        customData
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
      }
      totalCount
    }
  }
`;

export const GET_EXPENSE = `
  query Expense($expense: ExpenseReferenceInput) {
    expense(expense: $expense) {
      id
      description
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
      payoutMethod {
        data
        id
        name
        type
      }
    }
  }
`;

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
    return null;
  }
};

export const getProject = async (
  filter: { slug?: string; id?: string },
  token: string
) => {
  const graphqlClient = customOCGqlClient(token);
  try {
    const response = await graphqlClient.request(GET_PROJECT, filter);
    return response.project;
  } catch (err) {
    return null;
  }
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

export const getExpenses = async (slug: string, token: string) => {
  const graphqlClient = customOCGqlClient(token);
  try {
    const response = await graphqlClient.request(GET_EXPENSES, {
      account: {
        slug,
      },
      limit: 1e3,
    });
    return response.expenses.nodes || [];
  } catch (err) {
    return [];
  }
};
