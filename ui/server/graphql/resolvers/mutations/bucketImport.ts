import { combineResolvers } from "graphql-resolvers";
import prisma from "../../../prisma";
import { importBucketsTx } from "../../../services/bucketImport.service";
import { isCollOrGroupAdmin } from "../helpers";

// Admin-only bulk import. One transaction, set-based inserts, NO events
// (publish-bucket would email every round member). Validation is authoritative
// here (rerun inside the transaction) regardless of what the client previewed.
export const importBuckets = combineResolvers(
  isCollOrGroupAdmin,
  async (_, { roundId, buckets }, { user }) => {
    // The admin becomes cocreator of every bucket, which needs a RoundMember
    // row (a group admin who never joined the round has none).
    const roundMember = await prisma.roundMember.findUnique({
      where: { userId_roundId: { userId: user.id, roundId } },
    });
    if (!roundMember)
      throw new Error(
        "Join the round before importing: imported buckets list you as cocreator."
      );

    const ids = await prisma.$transaction(
      (tx) =>
        importBucketsTx(tx, {
          roundId,
          roundMemberId: roundMember.id,
          rows: buckets,
        }),
      { timeout: 30000, maxWait: 10000 }
    );

    // createMany gives every row the same createdAt: restore payload order.
    const rows = await prisma.bucket.findMany({ where: { id: { in: ids } } });
    const byId = new Map(rows.map((b) => [b.id, b]));
    const created = ids.map((id) => byId.get(id));
    return { createdCount: created.length, buckets: created };
  }
);
