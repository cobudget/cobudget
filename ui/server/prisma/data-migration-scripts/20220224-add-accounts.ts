import prisma from "../index";

export async function migrate() {
  // 1. add accounts to collection members
  console.log("Start migration");
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
        outgoingAccount: { create: {} },
      },
    });
  }

  // 3. add account to collection
  const collections = await prisma.collection.findMany({});

  for (const collection of collections) {
    await prisma.collection.update({
      where: { id: collection.id },
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
        createdAt: allocation.createdAt,
        collectionMemberId: allocation.allocatedById,
        collectionId: allocation.collectionMember.collectionId,
        userId: allocation.collectionMember.userId,
      },
    });
    console.log({ transactionFromAllocation: transaction });
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
        createdAt: contribution.createdAt,
        collectionMemberId: contribution.collectionMember.id,
        collectionId: contribution.collectionMember.collectionId,
        userId: contribution.collectionMember.userId,
      },
    });
    console.log({ transactionFromContribution: transaction });
  }

  console.log("end migration");
}

migrate();
