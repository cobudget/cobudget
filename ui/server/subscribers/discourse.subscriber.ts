import prisma from "server/prisma";
import discourse from "../lib/discourse";

export default {
  groupHasDiscourse(group) {
    return group?.discourse?.url && group?.discourse?.apiKey;
  },
  generateComment(post, collMember) {
    return {
      id: post.id,
      createdAt: new Date(post.created_at),
      collMemberId: collMember?.id,
      isLog: post.username === "system",
      content: post.raw,
      htmlContent: post.cooked,
    };
  },
  initialize(eventHub) {
    eventHub.subscribe(
      "create-bucket",
      "discourse",
      async ({
        currentGroup,
        currentGroupMember,
        currentCollMember,
        round,
        bucket,
      }) => {
        if (!this.groupHasDiscourse(currentGroup)) {
          return;
        }

        console.log(`Publishing bucket ${bucket.id} to discourse...`);

        const post = await discourse(currentGroup.discourse).posts.create(
          {
            title: bucket.title,
            raw: this.generateBucketMarkdown(bucket, round, currentGroup),
            category: round.discourseCategoryId,
            unlist_topic: !bucket.published,
          },
          {
            username: "system",
            apiKey: currentGroup.discourse.apiKey,
          }
        );

        if (post.errors) throw new Error("Discourse API:" + post.errors);

        bucket.comments.forEach((comment) => {
          eventHub.publish("create-comment", {
            currentGroup,
            currentGroupMember,
            currentCollMember,
            round,
            bucket,
            comment,
          });
        });

        await prisma.bucket.update({
          where: { id: bucket.id },
          data: { discourseTopicId: post.topic_id },
        });
      }
    );

    eventHub.subscribe(
      "edit-bucket",
      "discourse",
      async ({ currentGroup, currentGroupMember, round, bucket }) => {
        if (!this.groupHasDiscourse(currentGroup)) {
          return;
        }

        if (!bucket.discourseTopicId) {
          await eventHub.publish("create-bucket", {
            currentGroup,
            currentGroupMember,
            round,
            bucket,
          });
          //bucket = Bucket.findOne({ _id: bucket.id });
        }

        console.log(`Updating bucket ${bucket.id} on discourse`);

        const post = await discourse(currentGroup.discourse).topics.getSummary(
          {
            id: bucket.discourseTopicId,
          },
          {
            username: "system",
            apiKey: currentGroup.discourse.apiKey,
          }
        );

        if (post.errors) throw new Error("Discourse API:" + post.errors);

        await discourse(currentGroup.discourse).posts.update(
          post.id,
          {
            title: bucket.title,
            raw: this.generateBucketMarkdown(bucket, round, currentGroup),
          },
          {
            username: "system",
            apiKey: currentGroup.discourse.apiKey,
          }
        );
      }
    );

    eventHub.subscribe(
      "publish-bucket",
      "discourse",
      async ({
        currentGroup,
        currentGroupMember,
        round,
        bucket,
        unpublish,
      }) => {
        if (!this.groupHasDiscourse(currentGroup)) {
          return;
        }

        console.log(
          `Setting visibility of bucket ${
            bucket.id
          } to ${!unpublish} on Discourse...`
        );

        if (!bucket.discourseTopicId) {
          await eventHub.publish("create-bucket", {
            currentGroup,
            currentGroupMember,
            round,
            bucket,
          });
          //bucket = Bucket.findOne({ _id: bucket.id });
        }

        await discourse(currentGroup.discourse).topics.updateStatus(
          {
            id: bucket.discourseTopicId,
            status: "visible",
            enabled: !unpublish,
          },
          {
            username: "system",
            apiKey: currentGroup.discourse.apiKey,
          }
        );
      }
    );

    eventHub.subscribe(
      "create-comment",
      "discourse",
      async ({ currentGroup, currentGroupMember, round, bucket, comment }) => {
        if (!this.groupHasDiscourse(currentGroup)) {
          return;
        }

        if (!currentGroupMember.discourseApiKey)
          throw new Error(
            "You need to have a discourse account connected, go to /connect-discourse"
          );

        if (comment.content.length < currentGroup.discourse.minPostLength)
          throw new Error(
            `Your post needs to be at least ${currentGroup.discourse.minPostLength} characters long!`
          );

        console.log(
          `Publishing comment in bucket ${bucket.id} to discourse...`
        );

        if (!bucket.discourseTopicId) {
          await eventHub.publish("create-bucket", {
            currentGroup,
            currentGroupMember,
            round,
            bucket,
          });
          //bucket = Bucket.findOne({ _id: bucket.id });
        }

        const post = await discourse(currentGroup.discourse).posts.create(
          {
            topic_id: bucket.discourseTopicId,
            raw: comment.content,
          },
          {
            username: currentGroupMember.discourseUsername,
            userApiKey: currentGroupMember.discourseApiKey,
          }
        );

        if (post.errors) throw new Error("Discourse API:" + post.errors);
        const created = this.generateComment(
          { ...post, raw: comment.content },
          currentGroupMember
        );
        // liveUpdate.publish("commentsChanged", {
        //   commentsChanged: { comment: created, action: "created" },
        // });

        return created;
      }
    );

    eventHub.subscribe(
      "edit-comment",
      "discourse",
      async ({ currentGroup, currentGroupMember, bucket, comment }) => {
        if (!this.groupHasDiscourse(currentGroup)) {
          return;
        }
        if (!currentGroupMember.discourseApiKey)
          throw new Error(
            "You need to have a discourse account connected, go to /connect-discourse"
          );

        console.log(
          `Updating comment ${comment.id} in bucket ${bucket.id} to discourse...`
        );

        const post = await discourse(currentGroup.discourse).posts.update(
          comment.id,
          {
            title: bucket.title,
            raw: comment.content,
          },
          {
            username: currentGroupMember.discourseUsername,
            userApiKey: currentGroupMember.discourseApiKey,
          }
        );

        if (post.errors) throw new Error("Discourse API:" + post.errors);

        const updated = this.generateComment(
          { ...post, raw: comment.content },
          currentGroupMember
        );

        return updated;
      }
    );

    eventHub.subscribe(
      "delete-comment",
      "discourse",
      async ({ currentGroup, currentGroupMember, comment }) => {
        if (!this.groupHasDiscourse(currentGroup)) {
          return;
        }
        if (!currentGroupMember.discourseApiKey)
          throw new Error(
            "You need to have a discourse account connected, go to /connect-discourse"
          );

        console.log(`Deleting comment ${comment.id} on discourse...`);

        const res = await discourse(currentGroup.discourse).posts.delete({
          id: comment.id,
          userApiKey: currentGroupMember.discourseApiKey,
          username: currentGroupMember.discourseUsername,
        });

        if (!res.ok) throw new Error("Discourse API:" + res.statusText);

        return comment;
      }
    );
  },

  generateBucketMarkdown(bucket, round, group) {
    const content = [];

    if (group) {
      const protocol = process.env.NODE_ENV == "production" ? "https" : "http";

      const bucketUrl = `${protocol}://${process.env.DEPLOY_URL}/${group.slug}/${round.slug}/${bucket.id}`;
      content.push(
        `View and edit this post on the ${process.env.PLATFORM_NAME} platform: `,
        bucketUrl
      );
    }

    if (bucket.summary) {
      content.push("## Summary");
      content.push(bucket.summary);
    }

    if (bucket.description) {
      content.push("## Description");
      content.push(bucket.description);
    }

    if (bucket.customFields) {
      bucket.customFields.forEach((customField) => {
        const customFieldName = round.customFields.find(
          (customEventField) =>
            String(customEventField._id) === String(customField.fieldId)
        ).name;
        content.push(`## ${customFieldName}`);
        content.push(customField.value);
      });
    }

    if (bucket.budgetItems && bucket.budgetItems.length > 0) {
      const income = bucket.budgetItems.filter(({ type }) => type === "INCOME");
      const expenses = bucket.budgetItems.filter(
        ({ type }) => type === "EXPENSE"
      );

      content.push("## Budget Items");

      if (income.length) {
        content.push("#### Existing funding and resources");
        content.push(
          [
            `|Description|Amount|`,
            `|---|---|`,
            ...income.map(
              ({ description, min }) =>
                `|${description}|${min} ${round.currency}|`
            ),
          ].join("\n")
        );
      }

      if (expenses.length) {
        content.push("#### Costs");
        content.push(
          [
            `|Description|Amount|`,
            `|---|---|`,
            ...expenses.map(
              ({ description, min }) =>
                `|${description}|${min} ${round.currency}|`
            ),
          ].join("\n")
        );
      }

      content.push(
        `Total funding goal: ${bucket.minGoal / 100} ${round.currency}`
      );
    }

    if (bucket.images && bucket.images.length > 0) {
      content.push("## Images");
      bucket.images.forEach(({ small }) => content.push(`![](${small})`));
    }

    return content.join("\n\n");
  },
};
