import { combineResolvers } from "graphql-resolvers";
import dayjs from "dayjs";
import SeededShuffle from "seededshuffle";
import prisma from "../../../prisma";
import { canViewRound } from "../helpers";

type ImageFeedArgs = {
  groupSlug: string;
  roundSlug: string;
  offset?: number;
  limit?: number;
};

type ImageFeedEntry = {
  id: string;
  small: string | null;
  large: string | null;
  bucketId: string;
};

export const randomRoundImages = combineResolvers(
  async (_parent: unknown, args: ImageFeedArgs, { user, ss }) => {
    try {
      const { groupSlug, roundSlug, offset = 0, limit = 20 } = args;
  
      // 1) Locate the round by slug and group-slug.
      const round = await prisma.round.findFirst({
        where: {
          slug: roundSlug,
          group: { slug: groupSlug },
          deleted: { not: true },
        },
        include: { group: true },
      });
      if (!round) return { images: [], moreExist: false };
  
      // 2) Check permissions.
      const canView = ss || (await canViewRound({ user, round }));
      if (!canView) return { images: [], moreExist: false };
  
      // 3) Gather images from all buckets in this round.
      const bucketsWithImages = await prisma.bucket.findMany({
        where: {
          roundId: round.id,
          deleted: { not: true },
          publishedAt: { not: null },   // Exclude unpublished/draft buckets
          canceledAt: null              // Exclude cancelled buckets
        },
        include: { Images: true },
      });
  
      const allImages: ImageFeedEntry[] = [];
      for (const bucket of bucketsWithImages) {
        for (const img of bucket.Images) {
          allImages.push({
            id: img.id,
            small: img.small,
            large: img.large,
            bucketId: bucket.id,
          });
        }
      }
  
      // 4) Shuffle images using a seeded shuffle.
      const seed = user
        ? user.id + dayjs().format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD");
      SeededShuffle.shuffle(allImages, seed);
  
      // 5) Slice out our page of images.
      const sliced = allImages.slice(offset, offset + limit);
      const moreExist = allImages.length > offset + sliced.length;
      return { images: sliced, moreExist };
    } catch (error) {
      console.error("Error in randomRoundImages resolver:", error);
      // Always return a valid non-null value
      return { images: [], moreExist: false };
    }
  }
);
