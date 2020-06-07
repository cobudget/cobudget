const { gql } = require('apollo-server-micro');

const schema = gql`
  type Query {
    currentUser: User
    events: [Event!]
    event(slug: String): Event
    dream(eventId: ID!, slug: String!): Dream
    dreams(eventId: ID!, textSearchTerm: String): [Dream]
    members(eventId: ID!, isApproved: Boolean): [Member]
  }

  type Mutation {
    createEvent(
      slug: String!
      title: String!
      currency: String!
      description: String
      registrationPolicy: RegistrationPolicy!
    ): Event!
    editEvent(
      eventId: ID!
      slug: String
      title: String
      registrationPolicy: RegistrationPolicy
      info: String
      guidelines: String
    ): Event!

    createDream(
      eventId: ID!
      title: String!
      slug: String
      description: String
      summary: String
      minGoal: Int
      maxGoal: Int
      images: [ImageInput]
      budgetItems: [BudgetItemInput]
    ): Dream
    editDream(
      dreamId: ID!
      title: String
      slug: String
      description: String
      summary: String
      minGoal: Int
      maxGoal: Int
      images: [ImageInput]
      budgetItems: [BudgetItemInput]
    ): Dream

    addCocreator(dreamId: ID!, memberId: ID!): Dream
    removeCocreator(dreamId: ID!, memberId: ID!): Dream

    publishDream(dreamId: ID!, unpublish: Boolean): Dream

    addComment(dreamId: ID!, content: String!): Dream
    editComment(dreamId: ID!, commentId: ID!, content: String!): Dream
    deleteComment(dreamId: ID!, commentId: ID!): Dream

    sendMagicLink(email: String!): Boolean
    updateProfile(name: String, avatar: String): User
    # inviteMembers(emails: String!): [Member]
    updateMember(
      eventId: ID!
      memberId: ID!
      isApproved: Boolean
      isAdmin: Boolean
      isGuide: Boolean
    ): Member
    deleteMember(eventId: ID!, memberId: ID!): Member

    approveForGranting(dreamId: ID!, approved: Boolean!): Dream
    updateGrantingSettings(
      eventId: ID!
      currency: String
      grantsPerMember: Int
      maxGrantsToDream: Int
      totalBudget: Int
      grantValue: Int
      grantingOpens: Date
      grantingCloses: Date
      dreamCreationCloses: Date
      allowStretchGoals: Boolean
    ): Event
    giveGrant(eventId: ID!, dreamId: ID!, value: Int!): Grant
    deleteGrant(eventId: ID!, grantId: ID!): Grant
    reclaimGrants(dreamId: ID!): Dream
    preOrPostFund(dreamId: ID!, value: Int!): Grant
    toggleFavorite(dreamId: ID!): Dream

    registerForEvent(eventId: ID!): Member
  }

  type Event {
    id: ID!
    slug: String!
    title: String!
    info: String
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
    totalBudgetGrants: Int
    remainingGrants: Int
    grantValue: Int
    grantsPerMember: Int
    maxGrantsToDream: Int
    dreamCreationCloses: Date
    dreamCreationIsOpen: Boolean
    grantingOpens: Date
    grantingCloses: Date
    grantingIsOpen: Boolean
    guidelines: String
    allowStretchGoals: Boolean
  }

  scalar Date

  enum RegistrationPolicy {
    OPEN
    REQUEST_TO_JOIN
    INVITE_ONLY
  }

  type User {
    id: ID!
    email: String
    verifiedEmail: Boolean!
    membership(slug: String): Member
    memberships: [Member!]
    name: String
    avatar: String
    isOrgAdmin: Boolean
    createdAt: Date
  }

  # rename to Membership
  type Member {
    id: ID!
    event: Event!
    user: User!
    isAdmin: Boolean!
    isGuide: Boolean
    isApproved: Boolean!
    createdAt: Date
    availableGrants: Int
    givenGrants: [Grant]
    # roles: [Role]
  }

  # enum Role {
  #   ADMIN
  #   GUIDE
  # }

  type Dream {
    id: ID!
    event: Event!
    slug: String!
    title: String!
    description: String
    summary: String
    images: [Image!]
    cocreators: [Member]!
    minGoalGrants: Int
    maxGoalGrants: Int
    minGoal: Int
    maxGoal: Int
    comments: [Comment]
    numberOfComments: Int
    currentNumberOfGrants: Int
    budgetItems: [BudgetItem!]
    approved: Boolean
    favorite: Boolean
    published: Boolean
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
    reclaimed: Boolean!
    type: GrantType!
    # user: Member!
  }

  enum GrantType {
    PRE_FUND
    USER
    POST_FUND
  }

  type Image {
    small: String!
    large: String!
  }

  input ImageInput {
    small: String
    large: String
  }

  type BudgetItem {
    description: String!
    min: Int!
    max: Int
  }

  input BudgetItemInput {
    description: String!
    min: Int!
    max: Int
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

  type Comment {
    id: ID!
    author: User!
    createdAt: Date!
    content: String!
  }

  # type Flag {
  #   title: String!
  #   description: String!
  # }

  # type FlagEvent {
  #   flag: Flag!
  #   flagger: Member!
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
