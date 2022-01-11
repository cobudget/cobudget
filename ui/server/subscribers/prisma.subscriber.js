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
      "create-comment",
      "prisma",
      async ({
        currentOrg,
        currentOrgMember,
        currentCollMember,
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
            collMemberId: currentCollMember.id,
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
      async ({ currentOrg, currentCollMember, event, dream, comment }) => {
        if (orgHasDiscourse(currentOrg)) {
          return;
        }
        if (!comment) return;

        if (comment.collMemberId !== currentCollMember.id) return;
        const deleted = await prisma.comment.delete({
          where: { id: comment.id },
        });

        return deleted;
      }
    );
  },
};
