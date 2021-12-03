import { gql } from "apollo-server-micro";

const schema = gql`
  scalar JSON
  scalar JSONObject

  type Query {
    currentUser: User
    currentOrgMember(orgId: ID): OrgMember
    currentOrg(orgSlug: String): Organization
    organizations: [Organization!]
    organization(orgId: ID!): Organization!
    collections(orgSlug: String!, limit: Int): [Collection!]
    collection(orgSlug: String, collectionSlug: String): Collection
    dream(id: ID!): Dream
    dreamsPage(
      orgSlug: String!
      eventSlug: String!
      textSearchTerm: String
      tag: String
      offset: Int
      limit: Int
    ): DreamsPage
    commentSet(bucketId: ID!, from: Int, limit: Int, order: String): CommentSet!
    orgMembersPage(orgId: ID!, offset: Int, limit: Int): OrgMembersPage
    membersPage(
      collectionId: ID!
      isApproved: Boolean
      offset: Int
      limit: Int
    ): MembersPage
    members(collectionId: ID!, isApproved: Boolean): [EventMember]
    categories(orgId: ID!): [Category!]
    contributionsPage(
      collectionId: ID!
      offset: Int
      limit: Int
    ): ContributionsPage
  }

  type Mutation {
    createOrganization(
      name: String!
      logo: String
      slug: String!
    ): Organization!

    editOrganization(
      orgId: ID!
      name: String
      info: String
      logo: String
      slug: String
    ): Organization!
    setTodosFinished(orgId: ID!): Organization

    createCollection(
      orgId: ID!
      slug: String!
      title: String!
      currency: String!
      registrationPolicy: RegistrationPolicy!
    ): Collection!
    editCollection(
      collectionId: ID!
      slug: String
      title: String
      archived: Boolean
      registrationPolicy: RegistrationPolicy
      info: String
      color: String
      about: String
      bucketReviewIsOpen: Boolean
      discourseCategoryId: Int
    ): Collection!
    deleteCollection(collectionId: ID!): Collection

    addGuideline(collectionId: ID!, guideline: GuidelineInput!): Collection!
    editGuideline(
      collectionId: ID!
      guidelineId: ID!
      guideline: GuidelineInput!
    ): Collection!
    setGuidelinePosition(
      collectionId: ID!
      guidelineId: ID!
      newPosition: Float
    ): Collection!
    deleteGuideline(collectionId: ID!, guidelineId: ID!): Collection!

    addCustomField(
      collectionId: ID!
      customField: CustomFieldInput!
    ): Collection!
    editCustomField(
      collectionId: ID!
      fieldId: ID!
      customField: CustomFieldInput!
    ): Collection!
    setCustomFieldPosition(
      collectionId: ID!
      fieldId: ID!
      newPosition: Float
    ): Collection!
    deleteCustomField(collectionId: ID!, fieldId: ID!): Collection!

    editDreamCustomField(
      bucketId: ID!
      customField: CustomFieldValueInput!
    ): Dream!

    createDream(collectionId: ID!, title: String!): Dream
    editDream(
      bucketId: ID!
      title: String
      description: String
      summary: String
      images: [ImageInput]
      budgetItems: [BudgetItemInput]
      tags: [String!]
    ): Dream
    deleteDream(bucketId: ID!): Dream

    addImage(bucketId: ID!, image: ImageInput!): Dream
    deleteImage(bucketId: ID!, imageId: ID!): Dream

    addCocreator(bucketId: ID!, memberId: ID!): Dream
    removeCocreator(bucketId: ID!, memberId: ID!): Dream

    createTag(collectionId: ID!, tagValue: String!): Collection
    addTag(bucketId: ID!, tagId: ID!): Dream
    removeTag(bucketId: ID!, tagId: ID!): Dream

    publishDream(bucketId: ID!, unpublish: Boolean): Dream

    addComment(bucketId: ID!, content: String!): Comment
    editComment(bucketId: ID!, commentId: ID!, content: String!): Comment
    deleteComment(bucketId: ID!, commentId: ID!): Comment

    raiseFlag(bucketId: ID!, guidelineId: ID!, comment: String!): Dream
    resolveFlag(bucketId: ID!, flagId: ID!, comment: String!): Dream
    allGoodFlag(bucketId: ID!): Dream

    joinOrg(orgId: ID!): OrgMember

    updateProfile(username: String, name: String): User
    updateBio(collMemberId: ID!, bio: String): EventMember

    inviteCollectionMembers(collectionId: ID!, emails: String!): [EventMember]
    inviteOrgMembers(orgId: ID!, emails: String!): [OrgMember]
    updateOrgMember(orgId: ID!, memberId: ID!, isOrgAdmin: Boolean): OrgMember
    updateMember(
      collectionId: ID!
      memberId: ID!
      isApproved: Boolean
      isAdmin: Boolean
      isModerator: Boolean
    ): EventMember
    deleteMember(collectionId: ID!, memberId: ID!): EventMember

    deleteOrganization(organizationId: ID!): Organization

    approveForGranting(bucketId: ID!, approved: Boolean!): Dream
    updateGrantingSettings(
      collectionId: ID!
      currency: String
      maxAmountToBucketPerUser: Int
      grantingOpens: Date
      grantingCloses: Date
      bucketCreationCloses: Date
      allowStretchGoals: Boolean
    ): Collection

    allocate(
      collectionMemberId: ID!
      amount: Int!
      type: AllocationType!
    ): EventMember
    bulkAllocate(
      collectionId: ID!
      amount: Int!
      type: AllocationType!
    ): [EventMember]
    contribute(collectionId: ID!, bucketId: ID!, amount: Int!): Dream

    cancelFunding(bucketId: ID!): Dream
    acceptFunding(bucketId: ID!): Dream
    markAsCompleted(bucketId: ID!): Dream

    joinCollection(collectionId: ID!): EventMember
  }

  type Organization {
    id: ID!
    name: String!
    info: String
    subdomain: String
    slug: String
    customDomain: String
    logo: String
    collections: [Collection]
  }

  enum CollectionType {
    ORG
    SUB
    SINGLE
  }

  type Collection {
    id: ID!
    slug: String!
    title: String!
    archived: Boolean
    organization: Organization
    info: String
    color: String
    numberOfApprovedMembers: Int
    # visibility: Visibility
    registrationPolicy: RegistrationPolicy!
    currency: String!
    maxAmountToBucketPerUser: Int
    bucketCreationCloses: Date
    bucketCreationIsOpen: Boolean
    grantingOpens: Date
    grantingCloses: Date
    grantingIsOpen: Boolean
    grantingHasClosed: Boolean
    guidelines: [Guideline]
    about: String
    allowStretchGoals: Boolean
    customFields: [CustomField]
    bucketReviewIsOpen: Boolean
    totalAllocations: Int
    totalContributions: Int
    totalContributionsFunding: Int
    totalContributionsFunded: Int
    totalInMembersBalances: Int
    discourseCategoryId: Int
    tags: [Tag!]
  }

  type Tag {
    id: ID!
    value: String!
  }

  type Guideline {
    id: ID!
    title: String!
    description: String!
    position: Float!
  }

  input GuidelineInput {
    title: String!
    description: String!
  }

  scalar Date

  enum RegistrationPolicy {
    OPEN
    REQUEST_TO_JOIN
    INVITE_ONLY
  }

  enum AllocationType {
    ADD
    SET
  }

  type User {
    id: ID
    username: String
    email: String
    name: String
    verifiedEmail: Boolean!
    isRootAdmin: Boolean
    orgMemberships: [OrgMember!]
    avatar: String
    createdAt: Date
    # currentOrgMember: OrgMember
  }

  type OrgMember {
    id: ID!
    organization: Organization!
    user: User!
    isOrgAdmin: Boolean
    bio: String #what do we do with this one?
    createdAt: Date
    currentEventMembership(collectionSlug: String): EventMember #this is weird syntax...
    collectionMemberships: [EventMember!]
    discourseUsername: String
    hasDiscourseApiKey: Boolean
    email: String
    name: String
  }

  type OrgMembersPage {
    moreExist: Boolean
    orgMembers: [OrgMember]
  }

  type EventMember {
    id: ID!
    event: Collection!
    orgMember: OrgMember!
    isAdmin: Boolean!
    isModerator: Boolean
    isApproved: Boolean!
    createdAt: Date
    balance: Int # stored as cents
    email: String
    name: String
    # roles: [Role]
  }

  type MembersPage {
    moreExist: Boolean
    members(
      collectionId: ID!
      isApproved: Boolean
      offset: Int
      limit: Int
    ): [EventMember]
  }

  # enum Role {
  #   ADMIN
  #   GUIDE
  # }

  type Dream {
    id: ID!
    event: Collection!
    title: String!
    description: String
    summary: String
    images: [Image!]
    cocreators: [EventMember]!
    budgetItems: [BudgetItem!]
    customFields: [CustomFieldValue]
    approved: Boolean
    published: Boolean
    flags: [Flag]
    raisedFlags: [Flag]
    # logs: [Log]
    discourseTopicUrl: String
    # reactions: [Reaction]
    tags: [Tag!]
    minGoal: Int
    maxGoal: Int
    income: Int
    totalContributions: Int
    totalContributionsFromCurrentMember: Int
    numberOfComments: Int
    latestContributions: [Contribution!]
    noOfContributions: Int
    fundedAt: Date
    funded: Boolean
    completedAt: Date
    completed: Boolean
    canceledAt: Date
    canceled: Boolean
    collection: Collection!
  }

  type DreamsPage {
    moreExist: Boolean
    dreams: [Dream]
  }

  type Comment {
    id: ID!
    orgMember: OrgMember
    createdAt: Date!
    updatedAt: Date
    isLog: Boolean
    content: String!
    htmlContent: String
  }

  type CommentSet {
    total(bucketId: ID!, order: String): Int
    comments(bucketId: ID!, order: String): [Comment]
  }

  type CommentAction {
    comment: Comment!
    action: String
  }

  type Category {
    id: ID!
    name: String
    color: String
  }

  type Flag {
    id: ID!
    guideline: Guideline
    user: User
    comment: String
    type: String
  }

  type Image {
    id: ID!
    small: String
    large: String
  }

  input ImageInput {
    small: String
    large: String
  }

  type BudgetItem {
    id: ID!
    description: String!
    min: Int!
    max: Int
    type: BudgetItemType!
  }

  enum BudgetItemType {
    INCOME
    EXPENSE
  }

  input BudgetItemInput {
    description: String!
    min: Int!
    max: Int
    type: BudgetItemType!
  }

  interface Transaction {
    id: ID!
    event: Collection!
    eventMember: EventMember!
    amount: Int!
    createdAt: Date
  }

  type Contribution implements Transaction {
    id: ID!
    event: Collection!
    eventMember: EventMember!
    amount: Int!
    createdAt: Date
    dream: Dream!
  }

  type ContributionsPage {
    moreExist: Boolean
    contributions(collectionId: ID!, offset: Int, limit: Int): [Contribution]
  }

  type Allocation implements Transaction {
    id: ID!
    event: Collection!
    eventMember: EventMember!
    amount: Int!
    createdAt: Date
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

  type CustomFieldValue {
    id: ID!
    customField: CustomField
    value: JSON
  }

  input CustomFieldValueInput {
    fieldId: ID!
    collectionId: ID!
    value: JSON
  }

  enum CustomFieldType {
    TEXT
    MULTILINE_TEXT
    BOOLEAN
    FILE
  }

  type CustomField {
    id: ID!
    name: String!
    description: String!
    type: CustomFieldType!
    limit: Int
    isRequired: Boolean!
    position: Float!
    createdAt: Date!
  }

  input CustomFieldInput {
    name: String!
    description: String!
    type: CustomFieldType!
    limit: Int
    isRequired: Boolean!
    createdAt: Date
  }

  # type Log {
  #   createdAt: Date
  #   user: User
  #   dream: Dream
  #   event: Collection
  #   details: LogDetails
  #   type: String
  # }

  # type FlagRaisedDetails {
  #   guideline: Guideline
  #   comment: String
  # }

  # type FlagResolvedDetails {
  #   guideline: Guideline
  #   comment: String
  # }

  # type Subscription {
  #   commentsChanged(bucketId: ID!): CommentAction!
  # }

  # union LogDetails = FlagRaisedDetails | FlagResolvedDetails

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
