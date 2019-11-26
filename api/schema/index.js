import { gql } from 'apollo-server';

const schema = gql`
  type Query {
    user(id: ID!): User
    users: [User!]
    currentUser: User
    events: [Event!]
    event(slug: String!): Event
    dream(slug: String!): Dream
  }

  type Mutation {
    createEvent(slug: String!, title: String!, description: String): Event!
    createDream(
      eventSlug: String!
      title: String!
      description: String
      budget: String
      minGrant: Int
    ): Dream
    createUser(name: String, email: String): User # hack
    dropStuff: Boolean
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
    team: [User!]!
    budget: String
    minGrant: Int
  }
  # type Image {}
`;

export default schema;
