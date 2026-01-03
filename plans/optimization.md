# Borderland Dreams Performance Optimization Plan

> **Status**: Phase 1 and 2 implemented on 2026-01-03

## Executive Summary

Borderland Dreams (https://borderland.dreams.monster) has significant performance issues, particularly:
- **GraphQL API calls take 4-5 seconds** on cold cache
- **Dream detail pages take 1+ seconds** to load
- **Paginated pages (`?page=6`) feel sluggish** due to slow API responses

This plan outlines a phased approach to reduce load times to under 200ms for most requests.

---

## Current Performance Metrics

| Resource | Current TTFB | Target | Status |
|----------|--------------|--------|--------|
| Round listing page (`/borderland/borderland-dreams-2025`) | 48ms | <100ms | OK |
| Paginated page (`?page=6`) HTML | 127ms | <100ms | OK |
| **GraphQL API (cold cache)** | **4.4s** | <200ms | CRITICAL |
| **GraphQL API (warm cache)** | **1.0s** | <100ms | POOR |
| **Dream detail page** | **1.05s** | <200ms | POOR |

---

## Root Cause Analysis

### 1. GraphQL API Performance (4.4s cold, 1s warm)

**Location**: `ui/server/graphql/resolvers/queries/bucket.ts`

**Problems**:
- In-memory cache only works within a single serverless instance
- Each Vercel serverless instance starts with empty cache
- No HTTP-level caching at Vercel Edge
- Cache key includes `userId`, creating separate caches per user
- 5 parallel database queries per request on cache miss

### 2. Dream Detail Page Performance (1.05s)

**Location**: `ui/pages/[group]/[round]/[bucket]/index.tsx`

**Problems**:
- Uses `getServerSideProps` which cannot be cached
- Response headers: `cache-control: private, no-cache, no-store`
- Every request hits the database
- ISR code exists but is commented out

### 3. No Edge Caching

**Location**: `vercel.json`

**Problems**:
- No `Cache-Control` headers configured for API routes
- No `stale-while-revalidate` headers anywhere
- Static assets don't have immutable cache headers

---

## Optimization Plan

### Phase 1: HTTP Cache Headers (Quick Wins) ✅ IMPLEMENTED

**Effort**: Low | **Impact**: High | **Status**: Completed

#### 1.1 Add Cache Headers to GraphQL API

**File**: `ui/pages/api/index.ts`

```typescript
.all(async (req: NextApiRequest, res: NextApiResponse) => {
  await startServer;

  if (!apolloHandler) {
    res.status(500).json({ error: "Apollo Server not initialized" });
    return;
  }

  // Cache anonymous GraphQL queries at Vercel Edge
  const isAnonymous = !req.cookies?.session;
  if (isAnonymous && req.method === 'POST') {
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    );
    // Vary by request body to cache different queries separately
    res.setHeader('Vary', 'Accept-Encoding');
  }

  return apolloHandler(req, res);
});
```

**Expected Impact**: Anonymous API calls go from 4.4s to ~50ms for cached requests.

#### 1.2 Update vercel.json with Cache Headers

**File**: `vercel.json`

```json
{
  "github": {
    "silent": true
  },
  "functions": {
    "ui/pages/api/**/*.ts": {
      "maxDuration": 60
    },
    "ui/pages/api/stripe/webhooks/*.ts": {
      "maxDuration": 120
    }
  },
  "headers": [
    {
      "source": "/_next/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ]
}
```

---

### Phase 2: Enable ISR for Dream Detail Pages ✅ IMPLEMENTED

**Effort**: Medium | **Impact**: High | **Status**: Completed

#### 2.1 Convert getServerSideProps to getStaticProps with ISR

**File**: `ui/pages/[group]/[round]/[bucket]/index.tsx`

Replace the current `getServerSideProps` (lines 412-435) with:

```typescript
export async function getStaticProps(ctx) {
  const bucket = await prisma.bucket.findUnique({
    where: { id: ctx.params.bucket },
    include: {
      Images: { take: 1 },
    },
  });

  if (!bucket) {
    return {
      notFound: true,
      revalidate: 60  // Retry after 60 seconds
    };
  }

  return {
    props: {
      head: {
        title: bucket.title,
        description: bucket.description || bucket.summary,
        image: bucket.Images?.[0]?.large || process.env.PLATFORM_LOGO,
      },
    },
    revalidate: 60,  // Regenerate page every 60 seconds
  };
}

export async function getStaticPaths() {
  // Don't pre-generate any paths at build time
  // Generate on-demand and cache
  return {
    paths: [],
    fallback: 'blocking',
  };
}
```

**Expected Impact**: Dream pages go from 1.05s to ~50ms for cached requests.

#### 2.2 Add Cache Headers to Other SSR Pages

For pages that must remain SSR (like `participants.tsx`), add cache headers:

```typescript
export async function getServerSideProps(ctx) {
  // Enable edge caching for anonymous users
  ctx.res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=300'
  );

  return { props: {} };
}
```

---

### Phase 3: Implement Persistent Caching

**Effort**: Medium | **Impact**: High | **Timeline**: 2-3 days

#### 3.1 Use Vercel Data Cache for bucketsPage

**File**: `ui/server/graphql/resolvers/queries/bucket.ts`

Replace the in-memory cache with Next.js `unstable_cache`:

```typescript
import { unstable_cache } from 'next/cache';

// Create a cached version of the bucket data fetcher
const getCachedBucketData = unstable_cache(
  async (params: {
    roundSlug: string;
    groupSlug: string;
    status: string[];
    textSearchTerm?: string;
    tagValue?: string;
    orderBy?: string;
    orderDir?: string;
    dateSeed: string;
  }) => {
    // Move the existing database query logic here
    const round = await prisma.round.findFirst({
      where: {
        slug: params.roundSlug,
        group: { slug: params.groupSlug },
        deleted: { not: true },
      },
    });

    // ... rest of the query logic ...

    return { buckets: enrichedBuckets, fundingStatus };
  },
  ['buckets-page'],
  {
    revalidate: 120,  // Cache for 2 minutes
    tags: ['buckets'],
  }
);
```

**Expected Impact**: Consistent ~200ms responses across all serverless instances.

#### 3.2 Increase In-Memory Cache TTL

**File**: `ui/server/graphql/resolvers/queries/bucket.ts`

As a quick complement to the Data Cache:

```typescript
// Increase from 30 seconds to 5 minutes
const CACHE_TTL_MS = 5 * 60 * 1000;
```

---

### Phase 4: Database Query Optimizations

**Effort**: High | **Impact**: Medium | **Timeline**: 3-5 days

#### 4.1 Add Database Indexes

Create a Prisma migration to add indexes:

```prisma
model Bucket {
  // ... existing fields ...

  @@index([roundId, publishedAt, canceledAt])
  @@index([roundId, approvedAt])
  @@index([roundId, fundedAt])
}

model Contribution {
  // ... existing fields ...

  @@index([bucketId, roundMemberId])
  @@index([roundId])
}
```

#### 4.2 Pre-aggregate Bucket Statistics

Instead of computing `totalContributions`, `noOfFunders`, `noOfComments` on every request, store them on the Bucket model:

```prisma
model Bucket {
  // ... existing fields ...

  // Cached aggregates (updated via triggers or on contribution)
  cachedTotalContributions    Int @default(0)
  cachedNoOfFunders           Int @default(0)
  cachedNoOfComments          Int @default(0)
  aggregatesUpdatedAt         DateTime?
}
```

Then update these values when contributions are made:

```typescript
// In the contribute mutation
await prisma.$transaction([
  prisma.contribution.create({ ... }),
  prisma.bucket.update({
    where: { id: bucketId },
    data: {
      cachedTotalContributions: { increment: amount },
      aggregatesUpdatedAt: new Date(),
    },
  }),
]);
```

---

### Phase 5: Client-Side Optimizations

**Effort**: Low | **Impact**: Medium | **Timeline**: 1-2 days

#### 5.1 Optimize GraphQL Query Size

The `BUCKETS_QUERY` fetches many fields that aren't always needed. Consider:

```typescript
// Create a lightweight query for the grid view
export const BUCKETS_GRID_QUERY = gql`
  query BucketsGrid($groupSlug: String, $roundSlug: String!, $offset: Int, $limit: Int, $status: [StatusType!]) {
    bucketsPage(groupSlug: $groupSlug, roundSlug: $roundSlug, offset: $offset, limit: $limit, status: $status) {
      moreExist
      buckets {
        id
        title
        minGoal
        totalContributions
        status
        percentageFunded
        images { small }
      }
    }
  }
`;
```

#### 5.2 Implement Request Deduplication

Ensure urql's `cacheExchange` is properly deduplicating in-flight requests:

```typescript
// In ui/graphql/client.ts
import { dedupExchange } from 'urql';

exchanges: [
  dedupExchange,  // Add this before cacheExchange
  devtoolsExchange,
  cacheExchange({ ... }),
  ssrExchange,
  fetchExchange,
],
```

---

## Implementation Priority

| Phase | Optimization | Effort | Impact | Priority |
|-------|--------------|--------|--------|----------|
| 1.1 | GraphQL API cache headers | Low | **4.4s → 50ms** | P0 |
| 1.2 | vercel.json cache headers | Low | Faster static assets | P0 |
| 2.1 | ISR for dream pages | Medium | **1.05s → 50ms** | P0 |
| 3.1 | Vercel Data Cache | Medium | Consistent 200ms | P1 |
| 3.2 | Increase in-memory TTL | Low | Fewer cache misses | P1 |
| 4.1 | Database indexes | Medium | 30% faster queries | P2 |
| 4.2 | Pre-aggregate stats | High | 50% faster cold queries | P2 |
| 5.1 | Lighter GraphQL queries | Low | 20% less data transfer | P2 |
| 5.2 | Request deduplication | Low | Fewer duplicate requests | P2 |

---

## Expected Results

After implementing Phase 1 and 2:

| Resource | Before | After |
|----------|--------|-------|
| GraphQL API (anonymous) | 4.4s | ~50ms |
| GraphQL API (authenticated) | 4.4s | ~1s (further improved in Phase 3) |
| Dream detail page | 1.05s | ~50ms |
| Page 6 load time (perceived) | 5+ seconds | <500ms |

After implementing all phases:

| Resource | Before | After |
|----------|--------|-------|
| All API calls | 1-4.4s | <200ms |
| All page loads | 1-2s | <100ms |

---

## Monitoring & Validation

After each phase, validate improvements using:

```bash
# Test API response time
time curl -s -o /dev/null -w "TTFB: %{time_starttransfer}s\n" \
  'https://borderland.dreams.monster/api' \
  -H 'content-type: application/json' \
  -d '{"query":"{ bucketsPage(roundSlug:\"borderland-dreams-2025\", groupSlug:\"borderland\", limit:12) { buckets { id } } }"}'

# Check cache headers
curl -I "https://borderland.dreams.monster/borderland/borderland-dreams-2025" 2>&1 | grep -i cache

# Verify Vercel Edge cache hits
curl -I "https://borderland.dreams.monster/..." 2>&1 | grep "x-vercel-cache"
```

---

## Risks & Considerations

1. **Cache Invalidation**: Cached data may be stale for up to 60 seconds. Acceptable for this use case since dreaming data doesn't change frequently.

2. **Authenticated Users**: HTTP caching primarily benefits anonymous users. Authenticated users will still hit the origin, but Phase 3 (Data Cache) will help.

3. **Vercel Data Cache Costs**: `unstable_cache` may incur additional costs on Vercel. Monitor usage.

4. **ISR Fallback**: Using `fallback: 'blocking'` means first visitor to a new dream page waits for generation. Consider `fallback: true` with loading skeleton if this is problematic.

---

## Files to Modify

| File | Changes |
|------|---------|
| `ui/pages/api/index.ts` | Add cache headers for anonymous requests |
| `ui/pages/[group]/[round]/[bucket]/index.tsx` | Convert to ISR with getStaticProps |
| `ui/server/graphql/resolvers/queries/bucket.ts` | Implement Vercel Data Cache, increase TTL |
| `vercel.json` | Add static asset cache headers |
| `ui/graphql/client.ts` | Add dedupExchange |
| `ui/server/prisma/schema.prisma` | Add indexes, cached aggregate fields |

---

## Next Steps

1. **Immediate**: Implement Phase 1 (cache headers) - can be deployed today
2. **This Week**: Implement Phase 2 (ISR for dream pages)
3. **Next Sprint**: Phase 3 (Vercel Data Cache) and Phase 4 (database optimizations)
