- [ ] look over schema changes and fix those in queries

- [ ] rename stuff in schema
  - dream to bucket
  - event to collection
  - category to DiscourseCategory
  - EventMember to CollectionMember
- [ ] why is take: limit + 1 (related to withExtra name?)
      maybe if there is one extra, then we know, that we should fetch one more.
      is there a prisma equivalent for this?
- [ ] liveUpdate thing?
- [ ] should aggregate amounts be initialized to 0?
- [ ] rename slug in args to either orgSlug or collectionSlug
- [ ] should I have the `currentEventMemership` thing at all?
  - same for currentOrgMember on User... they be strange ya know
  - [ ] add orgSlug arg to currentOrgMember on User
- [ ] rename user in resolver to currentUser...
- [ ] look over all TODOs
- [ ] should comments have collectionMemberIds or orgMemberIds?
- [ ] settle on either lowercase or uppercase for connections in prisma... and change accordingly
- [ ] update balance after contributing...

---

- [ ] remove currentEventMembership
- rename:
  organizationId orgId
  eventId collId
  collectionId collId
  collectionMemberId collMemberId
  dreamId bucketId

  - continue at `contribute`
