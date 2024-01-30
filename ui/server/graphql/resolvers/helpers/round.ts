import prisma from "server/prisma";
import { getRoundFundingStatuses, statusTypeToQuery } from ".";
import { Prisma } from "@prisma/client";

export const isBucketLimitOver = async ({ roundId }) => {
  const round = await prisma.round.findUnique({
    where: {
      id: roundId,
    },
    select: {
      group: true,
    },
  });
  const status = round.group?.slug === "c" ? "free" : "paid";

  if (status === "paid") {
    return;
  }

  const fundingStatus = await getRoundFundingStatuses({ roundId });
  const statusFilter = ["FUNDED", "COMPLETED"]
    .map((s) => statusTypeToQuery(s, fundingStatus))
    .filter((s) => s);

  const currentCount = await prisma.bucket.count({
    where: {
      roundId,
      OR: statusFilter as Array<Prisma.BucketWhereInput>,
    },
  });

  const limit = parseInt(
    status === "free"
      ? process.env.MAX_FREE_BUCKETS
      : process.env.MAX_PAID_BUCKETS
  );
  const isLimitOver = currentCount >= limit;

  if (isLimitOver) {
    throw new Error("Free bucket limit over");
  }
};
