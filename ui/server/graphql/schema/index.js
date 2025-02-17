import { gql } from "apollo-server-micro";

const schema = gql`
  scalar JSON
  scalar JSONObject
  scalar BigInt

  input AmountConversionInput {
    amount: Float!
    currency: String!
  }

  type ExpensesResponse {
    total: Int
    moreExist: Boolean
    expenses: [Expense]
    error: String
  }

  type ExchangeRateResponse {
    currency: String
    rate: Float
  }

  type ExpensesCount {
    error: Boolean
    count: Int
  }

  type MembersLimit {
    limit: Int
    currentCount: Int
    consumedPercentage: Int
  }

  type ResourceLimit {
    limit: Int
    currentCount: Int
    consumedPercentage: Int
    isLimitOver: Boolean
    status: String
  }

  type ImageFeedEntry {
    id: ID!
    small: String
    large: String
    bucketId: String
  }

  type RoundImagesFeed {
    images: [ImageFeedEntry]
    moreExist: Boolean
  }

  type Query {
    getSuperAdminSession: SuperAdminSession
    getSuperAdminSessions(limit: Int!, offset: Int!): superAdminSessionsPage
    currentUser: User
    user(userId: ID!): User!
    groups: [Group!]
    adminGroups: [Group!]
    adminRounds: [Round]!
    group(groupSlug: String): Group
    rounds(groupSlug: String!, limit: Int): [Round!]
    round(groupSlug: String, roundSlug: String): Round
    expenses(
      roundId: String
      bucketId: String
      status: [ExpenseStatus!]
      search: String
      limit: Int
      offset: Int
      sortBy: ExpenseSortByOptions
      sortOrder: SortOrderOptions
    ): ExpensesResponse
    expensesCount(roundId: ID!): ExpensesCount
    allExpenses: [Expense]
    invitationLink(roundId: ID): InvitationLink
    groupInvitationLink(groupId: ID): InvitationLink
    expense(id: String!): Expense
    bucket(id: ID): Bucket
    bucketsPage(
      groupSlug: String
      roundSlug: String!
      textSearchTerm: String
      tag: String
      offset: Int
      limit: Int
      status: [StatusType!]
      orderBy: String
      orderDir: String
    ): BucketsPage
    starredBuckets(take: Int, skip: Int, roundId: ID): BucketsPage
    languageProgressPage: [LanguageProgress]
    convertCurrency(
      amounts: [AmountConversionInput]!
      toCurrency: String!
    ): Float!
    exchangeRates(currencies: [String]): [ExchangeRateResponse]
    commentSet(bucketId: ID!, from: Int, limit: Int, order: String): CommentSet!
    groupMembersPage(
      groupId: ID!
      search: String
      offset: Int
      limit: Int
      isApproved: Boolean
    ): GroupMembersPage
    membersPage(
      roundId: ID!
      isApproved: Boolean!
      search: String
      offset: Int
      limit: Int
    ): MembersPage
    members(roundId: ID!, isApproved: Boolean!): [RoundMember]
    categories(groupId: ID!): [Category!]
    contributionsPage(roundId: ID!, offset: Int, limit: Int): ContributionsPage
    roundTransactions(
      roundId: ID!
      offset: Int
      limit: Int
    ): RoundTransactionPage
    balances(groupSlug: String!): [RoundBalance]
    randomRoundImages(
      groupSlug: String!
      roundSlug: String!
      offset: Int
      limit: Int
    ): RoundImagesFeed!
  }

  type OCSyncResponse {
    status: String!
  }

  type Mutation {
    startSuperAdminSession(duration: Int!): SuperAdminSession

    endSuperAdminSession: SuperAdminSession

    createGroup(
      name: String!
      logo: String
      slug: String!
      registrationPolicy: RegistrationPolicy!
    ): Group!

    editGroup(
      groupId: ID!
      name: String
      info: String
      logo: String
      slug: String
      registrationPolicy: RegistrationPolicy
      visibility: Visibility
    ): Group!
    setTodosFinished(groupId: ID!): Group

    createRound(
      groupId: ID
      slug: String!
      title: String!
      currency: String!
      registrationPolicy: RegistrationPolicy!
      visibility: Visibility
    ): Round!
    verifyOpencollective(roundId: ID!): Round
    editOCToken(roundId: ID!, ocToken: String): Round
    editRound(
      roundId: ID!
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
      ocCollectiveSlug: String
      ocProjectSlug: String
    ): Round!
    resetRoundFunding(roundId: ID!): [Transaction]
    deleteRound(roundId: ID!): Round

    createInvitationLink(roundId: ID): InvitationLink
    deleteInvitationLink(roundId: ID): InvitationLink
    joinInvitationLink(token: String): InvitedMember

    createGroupInvitationLink(groupId: ID): InvitationLink
    deleteGroupInvitationLink(groupId: ID): InvitationLink
    joinGroupInvitationLink(token: String): GroupMember

    addGuideline(roundId: ID!, guideline: GuidelineInput!): Round!
    editGuideline(
      roundId: ID!
      guidelineId: ID!
      guideline: GuidelineInput!
    ): Round!
    setGuidelinePosition(
      roundId: ID!
      guidelineId: ID!
      newPosition: Float
    ): Round!
    deleteGuideline(roundId: ID!, guidelineId: ID!): Round!

    addCustomField(roundId: ID!, customField: CustomFieldInput!): Round!
    editCustomField(
      roundId: ID!
      fieldId: ID!
      customField: CustomFieldInput!
    ): Round!
    setCustomFieldPosition(
      roundId: ID!
      fieldId: ID!
      newPosition: Float
    ): Round!
    deleteCustomField(roundId: ID!, fieldId: ID!): Round!

    changeRoundSize(roundId: ID!, maxMembers: Int): Round
    changeBucketLimit(roundId: ID!, maxFreeBuckets: Int): Round

    editBucketCustomField(
      bucketId: ID!
      customField: CustomFieldValueInput!
    ): Bucket!

    createBucket(roundId: ID!, title: String!): Bucket
    editBucket(
      bucketId: ID!
      title: String
      description: String
      summary: String
      images: [ImageInput]
      budgetItems: [BudgetItemInput]
      directFundingEnabled: Boolean
      directFundingType: DirectFundingType
      exchangeDescription: String
      exchangeMinimumContribution: Int
      exchangeVat: Int
    ): Bucket
    deleteBucket(bucketId: ID!): Bucket

    toggleFavoriteBucket(bucketId: ID!): Bucket

    createExpense(
      bucketId: String!
      title: String!
      recipientName: String!
      recipientEmail: String!
      swiftCode: String
      iban: String
      country: String!
      city: String!
      recipientAddress: String!
      recipientPostalCode: String!
    ): Expense

    updateExpenseStatus(id: String!, status: ExpenseStatus): Expense

    updateExpense(
      id: String!
      title: String
      recipientName: String
      recipientEmail: String
      swiftCode: String
      iban: String
      country: String
      city: String
      recipientAddress: String
      recipientPostalCode: String
      bucketId: String
    ): Expense

    createExpenseReceipt(
      description: String
      date: Date
      amount: Int
      attachment: String
      expenseId: String
    ): ExpenseReceipt

    updateExpenseReceipt(
      id: String!
      description: String
      date: Date
      amount: Int
      attachment: String
    ): ExpenseReceipt

    syncOCExpenses(id: ID!, limit: Int!, offset: Int!): OCSyncResponse
    removeDeletedOCExpenses(id: ID!): OCSyncResponse
    deprecatedSyncOCExpenses(id: ID!): OCSyncResponse
      @deprecated(
        reason: "Use syncOCExpenses and removeDeletedOCExpenses instead. This mutation is slow"
      )

    addImage(bucketId: ID!, image: ImageInput!): Bucket
    deleteImage(bucketId: ID!, imageId: ID!): Bucket

    addCocreator(bucketId: ID!, memberId: ID!): Bucket
    removeCocreator(bucketId: ID!, memberId: ID!): Bucket

    createTag(roundId: ID!, tagValue: String!): Round
    addTag(bucketId: ID!, tagId: ID!): Bucket
    deleteTag(roundId: ID!, tagId: ID!): Round
    removeTag(bucketId: ID!, tagId: ID!): Bucket

    publishBucket(bucketId: ID!, unpublish: Boolean): Bucket

    addComment(bucketId: ID!, content: String!): Comment
    editComment(bucketId: ID!, commentId: ID!, content: String!): Comment
    deleteComment(bucketId: ID!, commentId: ID!): Comment

    raiseFlag(bucketId: ID!, guidelineId: ID!, comment: String!): Bucket
    resolveFlag(bucketId: ID!, flagId: ID!, comment: String!): Bucket
    allGoodFlag(bucketId: ID!): Bucket

    joinGroup(groupId: ID!): GroupMember

    updateProfile(username: String, name: String, mailUpdates: Boolean): User
    updateBio(collMemberId: ID!, bio: String): RoundMember

    deprecatedInviteRoundMembers(roundId: ID!, emails: String!): [RoundMember]
      @deprecated(
        reason: "Use inviteRoundMembers instead instead. This mutation is slow"
      )
    inviteRoundMembers(roundId: ID!, emails: String!): [RoundMember]
    inviteRoundMembersAgain(roundId: ID!, emails: String!): [RoundMember]
    inviteGroupMembers(groupId: ID!, emails: String!): [GroupMember]
    updateGroupMember(
      groupId: ID!
      memberId: ID!
      isAdmin: Boolean
      isApproved: Boolean
    ): GroupMember
    deleteGroupMember(groupId: ID!, groupMemberId: ID!): GroupMember
    changeGroupFreeStatus(groupId: ID!, freeStatus: Boolean): Group
    moveRoundToGroup(roundId: ID!, groupId: ID!): Round
    updateMember(
      roundId: ID!
      memberId: ID!
      isApproved: Boolean
      isAdmin: Boolean
      isModerator: Boolean
    ): RoundMember
    deleteMember(roundId: ID!, memberId: ID!): RoundMember

    deleteGroup(groupId: ID!): Group

    approveForGranting(bucketId: ID!, approved: Boolean!): Bucket
    setReadyForFunding(bucketId: ID!, isReadyForFunding: Boolean!): Bucket
    reopenFunding(bucketId: ID!): Bucket
    updateGrantingSettings(
      roundId: ID!
      currency: String
      maxAmountToBucketPerUser: Int
      grantingOpens: Date
      grantingCloses: Date
      bucketCreationCloses: Date
      allowStretchGoals: Boolean
      directFundingEnabled: Boolean
      directFundingTerms: String
      canCocreatorStartFunding: Boolean
      canCocreatorEditOpenBuckets: Boolean
    ): Round

    allocate(
      roundMemberId: ID!
      amount: Int!
      type: AllocationType!
    ): RoundMember
    bulkAllocate(
      roundId: ID!
      amount: Int!
      type: AllocationType!
    ): [RoundMember]
    contribute(roundId: ID!, bucketId: ID!, amount: Int!): Bucket

    cancelFunding(bucketId: ID!): Bucket
    acceptFunding(bucketId: ID!): Bucket
    markAsCompleted(bucketId: ID!): Bucket

    acceptInvitation(roundId: ID!): RoundMember
    joinRound(roundId: ID!): RoundMember

    acceptTerms: User
    setEmailSetting(settingKey: String!, value: Boolean!): User
    pinBucket(bucketId: ID!, pin: Boolean!): Bucket
  }

  type GroupSubscriptionStatus {
    isActive: Boolean
  }

  type Group {
    id: ID!
    name: String!
    info: String
    slug: String
    logo: String
    rounds: [Round]
    discourseUrl: String
    finishedTodos: Boolean
    experimentalFeatures: Boolean
    registrationPolicy: RegistrationPolicy
    visibility: Visibility
    subscriptionStatus: GroupSubscriptionStatus
    isFree: Boolean
  }

  enum RoundType {
    ROUND
    SUB
    SINGLE
  }

  enum StatusType {
    PENDING_APPROVAL
    IDEA
    OPEN_FOR_FUNDING
    FUNDED
    PARTIAL_FUNDING
    CANCELED
    COMPLETED
    ARCHIVED
  }

  enum ExpenseSortByOptions {
    createdAt
    title
    status
    bucketTitle
    amount
  }

  enum SortOrderOptions {
    asc
    desc
  }

  type Round {
    id: ID!
    slug: String!
    title: String!
    archived: Boolean
    group: Group
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
    stripeIsConnected: Boolean
    directFundingEnabled: Boolean
    directFundingTerms: String
    canCocreatorStartFunding: Boolean
    canCocreatorEditOpenBuckets: Boolean
    customFields: [CustomField]
    bucketReviewIsOpen: Boolean
    totalAllocations: Int
    totalContributions: Int
    totalContributionsFunding: Int
    totalContributionsFunded: Int
    totalInMembersBalances: BigInt
    discourseCategoryId: Int
    tags: [Tag!]
    bucketStatusCount: BucketStatusCount
    inviteNonce: Int
    updatedAt: Date
    distributedAmount: Int
    publishedBucketCount: Int

    ocCollective: OC_Collective
    ocWebhookUrl: String
    ocVerified: Boolean
    ocTokenStatus: OC_TokenStatus
    membersLimit: MembersLimit
    bucketsLimit: ResourceLimit
    expenses: [Expense]
  }

  type InvitationLink {
    link: String
  }

  type BucketStatusCount {
    PENDING_APPROVAL: Int!
    OPEN_FOR_FUNDING: Int!
    FUNDED: Int!
    CANCELED: Int!
    COMPLETED: Int!
    IDEA: Int!
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
    mailUpdates: Boolean
    isRootAdmin: Boolean
    groupMemberships: [GroupMember!]
    roundMemberships: [RoundMember!]
    avatar: String
    createdAt: Date
    currentGroupMember(groupSlug: String): GroupMember
    currentCollMember(groupSlug: String, roundSlug: String): RoundMember
    emailSettings: JSON
    acceptedTermsAt: Date
    isSuperAdmin: Boolean
  }

  type InvitedMember {
    id: ID!
    group: Group
    round: Round
  }

  type GroupMember {
    id: ID!
    group: Group!
    user: User!
    isAdmin: Boolean
    bio: String #what do we do with this one?
    createdAt: Date
    currentRoundMembership(roundSlug: String): RoundMember #this is weird syntax...
    roundMemberships: [RoundMember!]
    discourseUsername: String
    hasDiscourseApiKey: Boolean
    email: String
    name: String
    isApproved: Boolean
  }

  type GroupMembersPage {
    moreExist: Boolean
    groupMembers: [GroupMember]
  }

  type RoundMember {
    id: ID!
    round: Round!
    user: User!
    isAdmin: Boolean!
    isModerator: Boolean
    isApproved: Boolean!
    isRemoved: Boolean
    createdAt: Date
    balance: Int # stored as cents
    email: String
    name: String
    hasJoined: Boolean
    # roles: [Role]
  }

  type MembersPage {
    moreExist: Boolean
    members(
      roundId: ID!
      isApproved: Boolean!
      search: String
      offset: Int
      limit: Int
    ): [RoundMember]
  }

  # enum Role {
  #   ADMIN
  #   GUIDE
  # }

  type OC_Amount {
    currency: String
    valueInCents: Float
  }

  type OC_Stats {
    balance: OC_Amount
  }

  enum OC_Type {
    PROJECT
    COLLECTIVE
  }

  enum OC_TokenStatus {
    EMPTY
    PROVIDED
  }

  type OC_Parent {
    id: String!
    name: String!
    slug: String!
  }

  type OC_Collective {
    id: String!
    name: String!
    slug: String!
    stats: OC_Stats
    type: OC_Type!
    parent: OC_Parent
    expenseId: String!
  }

  type ExpenseReceipt {
    id: String!
    description: String
    date: Date
    amount: Int
    attachment: String
    expenseId: String
    expense: Expense
  }

  enum ExpenseStatus {
    DRAFT
    UNVERIFIED
    PENDING
    INCOMPLETE
    APPROVED
    SUBMITTED
    PAID
    REJECTED
    PROCESSING
    ERROR
    SCHEDULED_FOR_PAYMENT
    SPAM
    CANCELED
  }

  type OCMeta {
    legacyId: Int
  }

  type Expense {
    id: String!
    title: String!
    bucketId: String
    recipientName: String
    recipientEmail: String
    swiftCode: String
    amount: Int
    iban: String
    country: String
    city: String
    recipientAddress: String
    recipientPostalCode: String
    receipts: [ExpenseReceipt]
    status: ExpenseStatus
    submittedBy: String
    ocId: String
    currency: String
    exchangeRate: Float
    paidAt: Date
    ocMeta: OCMeta
    roundId: String
    createdAt: Date
  }

  type Bucket {
    id: ID!
    round: Round!
    title: String!
    description: String
    summary: String
    pinnedAt: Date
    images: [Image!]
    cocreators: [RoundMember]!
    budgetItems: [BudgetItem!]
    customFields: [CustomFieldValue]
    approved: Boolean
    published: Boolean
    readyForFunding: Boolean
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
    awardedAmount: Int
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
    createdAt: Date
    canceled: Boolean
    directFundingEnabled: Boolean
    directFundingType: DirectFundingType
    exchangeDescription: String
    exchangeMinimumContribution: Int
    exchangeVat: Int
    percentageFunded: Float
    expenses: [Expense]
    expense(id: String!): Expense
    isFavorite: Boolean
  }

  enum DirectFundingType {
    DONATION
    EXCHANGE
  }

  type BucketsPage {
    moreExist: Boolean
    buckets: [Bucket]
  }

  type LanguageProgress {
    code: String
    percentage: Int
  }

  type Comment {
    id: ID!
    roundMember: RoundMember
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
    round: Round!
    roundMember: RoundMember!
    amount: Int!
    createdAt: Date
  }

  type Contribution implements Transaction {
    id: ID!
    round: Round!
    roundMember: RoundMember!
    amount: Int!
    amountBefore: Int!
    createdAt: Date
    bucket: Bucket!
  }

  type ContributionsPage {
    moreExist: Boolean
    contributions(roundId: ID!, offset: Int, limit: Int): [Contribution]
  }

  type superAdminSessionsPage {
    moreExist: Boolean
    sessions: [SuperAdminSession]
  }

  type Allocation implements Transaction {
    id: ID!
    round: Round!
    roundMember: RoundMember!
    amount: Int!
    allocatedById: Int!
    allocationType: AllocationType!
    amountBefore: Int!
    createdAt: Date
  }

  type RoundTransaction {
    id: ID!
    round: Round!
    roundMember: RoundMember!
    allocatedBy: RoundMember
    amount: Int!
    createdAt: Date
    bucket: Bucket
    allocatedById: Int
    allocationType: AllocationType
    amountBefore: Int
    transactionType: TransactionType
  }

  type RoundTransactionPage {
    moreExist: Boolean
    transactions(roundId: ID!, offset: Int, limit: Int): [RoundTransaction]
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

  type SuperAdminSession {
    id: ID!
    start: Date
    duration: Int
    end: Date
    adminId: ID!
    user: User
  }

  input CustomFieldValueInput {
    fieldId: ID!
    roundId: ID!
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

  type RoundBalance {
    roundId: ID
    balance: Int
  }

  # type Log {
  #   createdAt: Date
  #   user: User
  #   bucket: Bucket
  #   round: Round
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
