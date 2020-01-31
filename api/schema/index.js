const { gql } = require('apollo-server-micro');

const schema = gql`
  type Query {
    currentMember: Member
    events: [Event!]
    event(slug: String!): Event
    dream(eventId: ID!, slug: String!): Dream
    dreams(eventId: ID!): [Dream]
    members: [Member]
  }

  type Mutation {
    createEvent(
      adminEmail: String!
      slug: String!
      title: String!
      currency: String!
      description: String
      registrationPolicy: RegistrationPolicy!
    ): Event!
    editEvent(
      slug: String
      title: String
      currency: String
      registrationPolicy: RegistrationPolicy
      totalBudget: Int
      grantValue: Int
      grantsPerMember: Int
    ): Event!
    createDream(
      eventId: ID!
      title: String!
      slug: String!
      description: String
      minGoal: Int
      maxGoal: Int
      images: [ImageInput]
    ): Dream
    editDream(
      dreamId: ID!
      title: String
      slug: String
      description: String
      minGoal: Int
      maxGoal: Int
      images: [ImageInput]
    ): Dream

    sendMagicLink(email: String!, eventId: ID!): Boolean
    updateProfile(name: String, avatar: String): Member
    inviteMembers(emails: String!): [Member]
    updateMember(memberId: ID!, isApproved: Boolean, isAdmin: Boolean): Member
    deleteMember(memberId: ID!): Member

    grant(dreamId: ID!, value: Int!): Grant
    openGranting(eventId: ID!): Event
    closeGranting(eventId: ID!): Event
  }

  type Event {
    id: ID!
    slug: String!
    title: String!
    description: String
    # logo: String
    members: [Member!]!
    numberOfApprovedMembers: Int
    dreams: [Dream!]
    # flags: [Flag!]
    # questions: [Question!]
    # reactions: [Emoji] #requried or not? ui implications?
    # visibility: Visibility
    registrationPolicy: RegistrationPolicy!
    # grantingPeriods: [GrantingPeriod]
    currency: String! # scalar? # can't change after first submission closes
    # useGrantlings: Boolean! # can't change after first submission close
    totalBudget: Int
    grantValue: Int
    grantsPerMember: Int
    grantingOpened: Date
    grantingClosed: Date
    grantingOpen: Boolean
  }

  scalar Date

  enum RegistrationPolicy {
    OPEN
    REQUEST_TO_JOIN
    INVITE_ONLY
  }

  type Member {
    id: ID!
    event: Event!
    email: String!
    name: String
    avatar: String
    # user: User!
    # isActive: Boolean!
    isAdmin: Boolean!
    isApproved: Boolean!
    verifiedEmail: Boolean!
    createdAt: Date
    availableGrants: Int
    # isGuide: Boolean!
    # favorites: [Dream]
  }

  type Dream {
    id: ID!
    event: Event!
    slug: String!
    title: String!
    description: String
    images: [Image!]
    members: [Member]!
    minGoalGrants: Int
    maxGoalGrants: Int
    minGoal: Int
    maxGoal: Int
    currentNumberOfGrants: Int
    budgetDescription: String
    # isApprovedForGranting: Boolean # should this be per granting period?
    # answers: [QuestionAnswer]
    # funding: Int!
    # raisedFlags: [Flag]
    # reactions: [Reaction]
    # tags: [Tag]
  }

  type Grant {
    id: ID!
    dream: Dream!
    value: Int!
    # user: Member!
    # type of grant: "prefund", "user", etc..
  }

  type Image {
    small: String!
    large: String!
  }

  input ImageInput {
    small: String
    large: String
  }

  # enum Visibility {
  #   PUBLIC
  #   PRIVATE # only for paid
  #   HIDDEN # only for paid
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
  #   COMMITTEE
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

module.exports = schema;
