import graphqlClient from "utils/graphqlClient";

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
        items {
          amount
          url
          description
          createdAt
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
      description
      createdAt
      items {
        amount
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

export const getCollective = async (filter: { slug?: string; id?: string }) => {
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

export const getProject = async (filter: { slug?: string; id?: string }) => {
  try {
    const response = await graphqlClient.request(GET_PROJECT, filter);
    return response.project;
  } catch (err) {
    return null;
  }
};
