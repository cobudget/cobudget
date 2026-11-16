import { combineResolvers } from "graphql-resolvers";
import prisma from "server/prisma";
import { loadImportContext } from "../../../services/bucketImport.service";
import { isCollOrGroupAdmin } from "../helpers";

// Admin-only: what the import preview needs to validate a file client-side
// (round fields + reference codes already used). The commit mutation re-checks.
export const bucketImportContext = combineResolvers(
  isCollOrGroupAdmin,
  async (_, { roundId }) => {
    const round = await prisma.round.findUnique({ where: { id: roundId } });
    const { fields, existingCodes } = await loadImportContext(prisma, roundId);
    return {
      currency: round.currency,
      fields,
      existingCodes: Array.from(existingCodes),
    };
  }
);
