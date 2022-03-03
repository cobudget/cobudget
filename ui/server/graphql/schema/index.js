import { gql } from "apollo-server-micro";

const schema = gql`
  scalar JSON
  scalar JSONObject

  type Query {
    currentUser: User
    user(userId: ID!): User!
    currentOrg(orgSlug: String): Organization
    organizations: [Organization!]
    organization(orgId: ID!): Organization!
    collections(orgId: ID!, limit: Int): [Collection!]
    collection(orgSlug: String, collectionSlug: String): Collection
    bucket(id: ID!): Bucket
    bucketsPage(
      collectionId: ID!
      textSearchTerm: String
      tag: String
      offset: Int
      limit: Int
      status: [StatusType!]
    ): BucketsPage
    commentSet(bucketId: ID!, from: Int, limit: Int, order: String): CommentSet!
    orgMembersPage(orgId: ID!, offset: Int, limit: Int): OrgMembersPage
    membersPage(
      collectionId: ID!
      isApproved: Boolean
      search: String
      offset: Int
      limit: Int
    ): MembersPage
    members(collectionId: ID!, isApproved: Boolean): [CollectionMember]
    categories(orgId: ID!): [Category!]
    contributionsPage(
      collectionId: ID!
      offset: Int
      limit: Int
    ): ContributionsPage
    collectionTransactions(
      collectionId: ID!
      offset: Int
      limit: Int
    ): CollectionTransactionPage
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
      orgId: ID
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
      visibility: Visibility
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

    editBucketCustomField(
      bucketId: ID!
      customField: CustomFieldValueInput!
    ): Bucket!

    createBucket(collectionId: ID!, title: String!): Bucket
    editBucket(
      bucketId: ID!
      title: String
      description: String
      summary: String
      images: [ImageInput]
      budgetItems: [BudgetItemInput]
      tags: [String!]
    ): Bucket
    deleteBucket(bucketId: ID!): Bucket

    addImage(bucketId: ID!, image: ImageInput!): Bucket
    deleteImage(bucketId: ID!, imageId: ID!): Bucket

    addCocreator(bucketId: ID!, memberId: ID!): Bucket
    removeCocreator(bucketId: ID!, memberId: ID!): Bucket

    createTag(collectionId: ID!, tagValue: String!): Collection
    addTag(bucketId: ID!, tagId: ID!): Bucket
    deleteTag(collectionId: ID!, tagId: ID!): Collection
    removeTag(bucketId: ID!, tagId: ID!): Bucket

    publishBucket(bucketId: ID!, unpublish: Boolean): Bucket

    addComment(bucketId: ID!, content: String!): Comment
    editComment(bucketId: ID!, commentId: ID!, content: String!): Comment
    deleteComment(bucketId: ID!, commentId: ID!): Comment

    raiseFlag(bucketId: ID!, guidelineId: ID!, comment: String!): Bucket
    resolveFlag(bucketId: ID!, flagId: ID!, comment: String!): Bucket
    allGoodFlag(bucketId: ID!): Bucket

    joinOrg(orgId: ID!): OrgMember

    updateProfile(username: String, name: String): User
    updateBio(collMemberId: ID!, bio: String): CollectionMember

    inviteCollectionMembers(
      collectionId: ID!
      emails: String!
    ): [CollectionMember]
    inviteOrgMembers(orgId: ID!, emails: String!): [OrgMember]
    updateOrgMember(orgId: ID!, memberId: ID!, isAdmin: Boolean): OrgMember
    updateMember(
      collectionId: ID!
      memberId: ID!
      isApproved: Boolean
      isAdmin: Boolean
      isModerator: Boolean
    ): CollectionMember
    deleteMember(collectionId: ID!, memberId: ID!): CollectionMember

    deleteOrganization(organizationId: ID!): Organization

    approveForGranting(bucketId: ID!, approved: Boolean!): Bucket
    updateGrantingSettings(
      collectionId: ID!
      currency: String
      maxAmountToBucketPerUser: Int
      grantingOpens: Date
      grantingCloses: Date
      bucketCreationCloses: Date
      allowStretchGoals: Boolean
      requireBucketApproval: Boolean
    ): Collection

    allocate(
      collectionMemberId: ID!
      amount: Int!
      type: AllocationType!
    ): CollectionMember
    bulkAllocate(
      collectionId: ID!
      amount: Int!
      type: AllocationType!
    ): [CollectionMember]
    contribute(collectionId: ID!, bucketId: ID!, amount: Int!): Bucket

    cancelFunding(bucketId: ID!): Bucket
    acceptFunding(bucketId: ID!): Bucket
    markAsCompleted(bucketId: ID!): Bucket

    acceptInvitation(collectionId: ID!): CollectionMember
    joinCollection(collectionId: ID!): CollectionMember

    setEmailSetting(settingKey: String!, value: Boolean!): User
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
    discourseUrl: String
    finishedTodos: Boolean
  }

  enum CollectionType {
    ORG
    SUB
    SINGLE
  }

  enum StatusType {
    PENDING_APPROVAL
    OPEN_FOR_FUNDING
    FUNDED
    CANCELED
    COMPLETED
    ARCHIVED
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
    registrationPolicy: RegistrationPolicy!
    visibility: Visibility!
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
    requireBucketApproval: Boolean
    customFields: [CustomField]
    bucketReviewIsOpen: Boolean
    totalAllocations: Int
    totalContributions: Int
    totalContributionsFunding: Int
    totalContributionsFunded: Int
    totalInMembersBalances: Int
    discourseCategoryId: Int
    tags: [Tag!]
    bucketStatusCount: BucketStatusCount
  }

  type BucketStatusCount {
    PENDING_APPROVAL: Int!
    OPEN_FOR_FUNDING: Int!
    FUNDED: Int!
    CANCELED: Int!
    COMPLETED: Int!
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

  enum Visibility {
    PUBLIC
    # PRIVATE
    HIDDEN
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
    collectionMemberships: [CollectionMember!]
    avatar: String
    createdAt: Date
    currentOrgMember(orgSlug: String): OrgMember
    currentCollMember(orgSlug: String, collectionSlug: String): CollectionMember
    emailSettings: JSON
  }

  type OrgMember {
    id: ID!
    organization: Organization!
    user: User!
    isAdmin: Boolean
    bio: String #what do we do with this one?
    createdAt: Date
    currentCollectionMembership(collectionSlug: String): CollectionMember #this is weird syntax...
    collectionMemberships: [CollectionMember!]
    discourseUsername: String
    hasDiscourseApiKey: Boolean
    email: String
    name: String
  }

  type OrgMembersPage {
    moreExist: Boolean
    orgMembers: [OrgMember]
  }

  type CollectionMember {
    id: ID!
    collection: Collection!
    user: User!
    isAdmin: Boolean!
    isModerator: Boolean
    isApproved: Boolean!
    createdAt: Date
    balance: Int # stored as cents
    amountContributed: Int
    email: String
    name: String
    hasJoined: Boolean
    # roles: [Role]
  }

  type MembersPage {
    moreExist: Boolean
    members(
      collectionId: ID!
      isApproved: Boolean
      search: String
      offset: Int
      limit: Int
    ): [CollectionMember]
  }

  # enum Role {
  #   ADMIN
  #   GUIDE
  # }

  type Bucket {
    id: ID!
    round: Collection!
    title: String!
    description: String
    summary: String
    images: [Image!]
    cocreators: [CollectionMember]!
    budgetItems: [BudgetItem!]
    customFields: [CustomFieldValue]
    approved: Boolean
    published: Boolean
    flags: [Flag]
    raisedFlags: [Flag]
    status: StatusType
    # logs: [Log]
    discourseTopicUrl: String
    # reactions: [Reaction]
    tags: [Tag!]
    minGoal: Int
    maxGoal: Int
    income: Int
    totalContributions: Int
    totalContributionsFromCurrentMember: Int
    noOfComments: Int
    noOfContributions: Int
    contributions: [Contribution!]
    funders: [Contribution!] # aggregated contributions per user
    noOfFunders: Int
    fundedAt: Date
    funded: Boolean
    completedAt: Date
    completed: Boolean
    canceledAt: Date
    canceled: Boolean
    collection: Collection!
  }

  type BucketsPage {
    moreExist: Boolean
    buckets: [Bucket]
  }

  type Comment {
    id: ID!
    collectionMember: CollectionMember
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
    collection: Collection!
    collectionMember: CollectionMember!
    amount: Int!
    createdAt: Date
  }

  type Contribution implements Transaction {
    id: ID!
    collection: Collection!
    collectionMember: CollectionMember!
    amount: Int!
    amountBefore: Int!
    createdAt: Date
    bucket: Bucket!
  }

  type ContributionsPage {
    moreExist: Boolean
    contributions(collectionId: ID!, offset: Int, limit: Int): [Contribution]
  }

  type Allocation implements Transaction {
    id: ID!
    collection: Collection!
    collectionMember: CollectionMember!
    amount: Int!
    allocatedById: Int!
    allocationType: AllocationType!
    amountBefore: Int!
    createdAt: Date
  }

  type CollectionTransaction {
    id: ID!
    collection: Collection!
    collectionMember: CollectionMember!
    allocatedBy: CollectionMember
    amount: Int!
    createdAt: Date
    bucket: Bucket
    allocatedById: Int
    allocationType: AllocationType
    amountBefore: Int
    transactionType: TransactionType
  }

  type CollectionTransactionPage {
    moreExist: Boolean
    transactions(
      collectionId: ID!
      offset: Int
      limit: Int
    ): [CollectionTransaction]
  }

  # type GrantingPeriod {
  #   round: Event!
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
  #   round: Event!
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

  enum TransactionType {
    ALLOCATION
    CONTRIBUTION
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
  #   bucket: Bucket
  #   round: Collection
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
