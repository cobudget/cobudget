/* eslint-disable no-unused-vars */
import { orgHasDiscourse } from "./discourse.subscriber";
import liveUpdate from "../services/liveUpdate.service";
import prisma from "../prisma";
const MIN_POST_LENGTH = 3;
export default {
  initialize(eventHub) {
    eventHub.subscribe(
      "create-dream",
      "prisma",
      async ({ currentOrg, currentOrgMember, event, dream, comment }) => {}
    );

    eventHub.subscribe(
      "publish-dream",
      "prisma",
      async ({ dream, unpublish }) => {
        const publishedAt = unpublish ? null : new Date();
        return prisma.bucket.update({
          where: { id: dream.id },
          data: { publishedAt },
        });
      }
    );

    eventHub.subscribe(
      "create-comment",
      "prisma",
      async ({
        currentOrg,
        currentOrgMember,
        event,
        dream,
        comment: { content },
      }) => {
        if (orgHasDiscourse(currentOrg)) {
          return;
        }

        if (content.length < MIN_POST_LENGTH)
          throw new Error(
            `Your post needs to be at least ${MIN_POST_LENGTH} characters long!`
          );

        const comment = await prisma.comment.create({
          data: {
            bucketId: dream.id,
            content,
            orgMemberId: currentOrgMember.id,
          },
        });

        // liveUpdate.publish("commentsChanged", {
        //   commentsChanged: { comment, action: "created" },
        // });

        return comment;
      }
    );

    eventHub.subscribe(
      "edit-comment",
      "prisma",
      async ({
        currentOrg,
        currentOrgMember,
        event,
        eventMember,
        dream,
        comment,
      }) => {
        if (orgHasDiscourse(currentOrg)) {
          return;
        }

        const updatedComment = await prisma.comment.update({
          where: { id: comment.id },
          data: { content: comment.content },
        });

        // liveUpdate.publish("commentsChanged", {
        //   commentsChanged: { comment: updatedComment, action: "edited" },
        // });

        return updatedComment;
      }
    );

    eventHub.subscribe(
      "delete-comment",
      "prisma",
      async ({ currentOrg, currentOrgMember, event, dream, comment }) => {
        if (!currentOrgMember || orgHasDiscourse(currentOrg)) {
          return;
        }
        if (!comment) return;

        if (comment.orgMemberId !== currentOrgMember.id) return;
        const deleted = await prisma.comment.delete({
          where: { id: comment.id },
        });

        // liveUpdate.publish("commentsChanged", {
        //   commentsChanged: { comment: deleted, action: "deleted" },
        // });

        return deleted;
      }
    );
  },
};
