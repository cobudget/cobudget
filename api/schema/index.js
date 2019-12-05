import { gql } from 'apollo-server-micro';

const schema = gql`
  type Query {
    currentUser: User
    events: [Event!]
    event(slug: String!): Event
    dream(eventId: ID!, slug: String!): Dream
  }

  type Mutation {
    createEvent(slug: String!, title: String!, description: String): Event!
    createDream(
      eventId: ID!
      title: String!
      description: String
      budgetDescription: String
      minFunding: Int
    ): Dream
    sendMagicLink(email: String!): Boolean
  }

  type Event {
    id: ID!
    slug: String!
    title: String!
    description: String
    # logo: String
    memberships: [Membership!]
    dreams: [Dream!]
    # flags: [Flag!]
    # questions: [Question!]
    # reactions: [Emoji] #requried or not? ui implications?
    # visibility: Visibility
    # registrationPolicy: RegistrationPolicy
    # grantingPeriods: [GrantingPeriod]
    # currency: Currency! # scalar? # can't change after first submission closes
    # useGrantlings: Boolean! # can't change after first submission close
    # membershipContribution: Int
    # grantlingValue: Int # can't change after first submission close?
    # totalBudget: Int
    # amountLeft: Int
    # grantlingValue: Int
  }

  type User {
    id: ID!
    email: String! # emailVerified create Email type for keeping track of email verification etc?
    memberships: [Membership]
    name: String
    avatar: String
  }

  type Membership {
    id: ID!
    event: Event!
    user: User!
    # isActive: Boolean!
    # isApproved: Boolean!
    isAdmin: Boolean!
    # isGuide: Boolean!
    # favorites: [Dream]
  }

  type Dream {
    id: ID!
    slug: String!
    title: String!
    description: String
    event: Event
    images: [String]
    team: [User]!
    minFunding: Int #real currency
    maxFunding: Int
    budgetDescription: String
    # isApprovedForGranting: Boolean # should this be per granting period?
    # answers: [QuestionAnswer]
    # funding: Int!
    # raisedFlags: [Flag]
    # reactions: [Reaction]
    # tags: [Tag]
  }

  # enum Visibility {
  #   PUBLIC
  #   PRIVATE # only for paid
  #   HIDDEN # only for paid
  # }

  # enum RegistrationPolicy {
  #   OPEN
  #   REQUEST_TO_JOIN
  #   INVITE_ONLY
  # }

  # type GrantingPeriod {
  #   event: Event!
  #   submissionCloses: Date
  #   grantingStarts: Date
  #   grantingCloses: Date # when this happens. all grants to non-funded projects go back into the pool
  #   name: String
  #   budget: Int
  #   distributeGrants: DistributeGrantStrategy
  # }

  # enum DistributeGrantStrategy {
  #   DISTRIBUTE_EQUALLY # is this possible?
  #   DISTRIBUTE_TO_ACTIVE_USERS
  #   COMITTEE
  # }

  # type Emoji {
  #   unicode: String!
  #   event: Event!
  # }

  # type Reaction {
  #   emoji: Emoji!
  #   by: Member!
  #   # createdAt
  # }

  # type Comment {
  #   dream: Dream!
  #   by: Member!
  #   createdAt: Date!
  # }

  # type Flag {
  #   title: String!
  #   description: String!
  # }

  # type FlagEvent {
  #   flag: Flag!
  #   flagger: Member!
  # }

  # type Favorite {
  #   dream: Dream!
  #   by: Member!
  # }

  # type Grant {
  #   dream: Dream!
  #   amount: Int!
  # }

  # type QuestionAnswer {
  #   question: Question
  #   answer: String
  # }

  # type Question {
  #   richtext: String
  #   isRequired: Boolean!
  # }

  # type Image {}
`;

export default schema;
