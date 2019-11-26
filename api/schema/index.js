import { gql } from 'apollo-server';

const schema = gql`
  type Query {
    user(id: ID!): User
    currentUser: User
    events: [Event!]
    event(slug: String!): Event
  }

  type Mutation {
    createEvent(slug: String!, title: String!, description: String): Event!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    memberships: [Membership!]
  }

  # type Email {}

  type Membership {
    id: ID!
    user: User!
    event: Event!
    isAdmin: Boolean!
  }

  type Event {
    id: ID!
    slug: String!
    title: String!
    description: String
    members: [Membership!]
    dreams: [Dream!]
  }

  type Dream {
    id: ID!
    slug: String!
    title: String!
    description: String
    images: [String!]
    team: [Membership!]!
    budget: String
    minGrant: Int
  }
  # type Image {}
`;

export default schema;
