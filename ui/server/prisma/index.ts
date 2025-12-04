import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient;
}

// @see https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  prisma = global.cachedPrisma;
}

async function main() {
  try {
    prisma.$use(async (params, next) => {
      if (
        (params.model === "Contribution" ||
          params.model === "Allocation" ||
          params.model === "Transaction") &&
        (params.action === "aggregate" ||
          params.action === "count" ||
          params.action === "findFirst" ||
          params.action === "findMany" ||
          params.action === "findUnique" ||
          (params as any).action === "groupBy")
      ) {
        params.args.where.deleted = null;
      }
      return next(params);
    });
  } catch (err) {
    ("");
  }
}

main();

export default prisma;
