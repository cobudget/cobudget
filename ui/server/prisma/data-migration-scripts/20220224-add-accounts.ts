import prisma from "../index";

export async function migrate() {
  // 1. add accounts to collection members

  const collectionMembers = await prisma.collectionMember.findMany({
    select: { id: true },
  });

  for (const member of collectionMembers) {
    await prisma.collectionMember.update({
      where: { id: member.id },
      data: {
        incomingAccount: { create: {} },
        statusAccount: { create: {} },
        outgoingAccount: { create: {} },
      },
    });
  }

  // 2. add accounts to buckets

  const buckets = await prisma.bucket.findMany({
    select: { id: true },
  });

  for (const bucket of buckets) {
    await prisma.bucket.update({
      where: { id: bucket.id },
      data: {
        statusAccount: { create: {} },
      },
    });
  }

  // 3. create transactions data from allocations

  const allocations = await prisma.allocation.findMany({
    include: { collectionMember: true },
  });

  for (const allocation of allocations) {
    const transaction = await prisma.transaction.create({
      data: {
        amount: allocation.amount,
        fromAccountId: allocation.collectionMember.incomingAccountId,
        toAccountId: allocation.collectionMember.statusAccountId,
        type: "ALLOCATION",
        createdAt: allocation.createdAt,
        collectionMemberId: allocation.collectionMember.id,
        collectionId: allocation.collectionMember.collectionId,
      },
    });
  }

  // 4. create transactions data from contributions

  const contributions = await prisma.contribution.findMany({
    include: { collectionMember: true, bucket: true },
  });

  for (const contribution of contributions) {
    const transaction = await prisma.transaction.create({
      data: {
        amount: contribution.amount,
        fromAccountId: contribution.collectionMember.statusAccountId,
        toAccountId: contribution.bucket.statusAccountId,
        type: "CONTRIBUTION",
        createdAt: contribution.createdAt,
        collectionMemberId: contribution.collectionMember.id,
        collectionId: contribution.collectionMember.collectionId,
      },
    });
  }
}

migrate();
