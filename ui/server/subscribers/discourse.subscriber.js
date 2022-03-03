const discourse = require("../lib/discourse");
const liveUpdate = require("../services/liveUpdate.service");

module.exports = {
  orgHasDiscourse(org) {
    return org?.discourse?.url && org?.discourse?.apiKey;
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
        currentOrg,
        currentOrgMember,
        currentCollMember,
        round,
        bucket,
      }) => {
        if (!this.orgHasDiscourse(currentOrg)) {
          return;
        }

        console.log(`Publishing bucket ${bucket.id} to discourse...`);

        const post = await discourse(currentOrg.discourse).posts.create(
          {
            title: bucket.title,
            raw: this.generateBucketMarkdown(bucket, round, currentOrg),
            category: round.discourseCategoryId,
            unlist_topic: !bucket.published,
          },
          {
            username: "system",
            apiKey: currentOrg.discourse.apiKey,
          }
        );

        if (post.errors) throw new Error(["Discourse API:", ...post.errors]);

        bucket.comments.forEach((comment) => {
          eventHub.publish("create-comment", {
            currentOrg,
            currentOrgMember,
            currentCollMember,
            round,
            bucket,
            comment,
          });
        });

        bucket.discourseTopicId = post.topic_id;
        await bucket.save();
      }
    );

    eventHub.subscribe(
      "edit-bucket",
      "discourse",
      async ({ currentOrg, currentOrgMember, round, bucket }) => {
        if (!this.orgHasDiscourse(currentOrg)) {
          return;
        }

        if (!bucket.discourseTopicId) {
          await eventHub.publish("create-bucket", {
            currentOrg,
            currentOrgMember,
            round,
            bucket,
          });
          //bucket = Bucket.findOne({ _id: bucket.id });
        }

        console.log(`Updating bucket ${bucket.id} on discourse`);

        const post = await discourse(currentOrg.discourse).topics.getSummary(
          {
            id: bucket.discourseTopicId,
          },
          {
            username: "system",
            apiKey: currentOrg.discourse.apiKey,
          }
        );

        if (post.errors) throw new Error(["Discourse API:", ...post.errors]);

        await discourse(currentOrg.discourse).posts.update(
          post.id,
          {
            title: bucket.title,
            raw: this.generateBucketMarkdown(bucket, round, currentOrg),
          },
          {
            username: "system",
            apiKey: currentOrg.discourse.apiKey,
          }
        );
      }
    );

    eventHub.subscribe(
      "publish-bucket",
      "discourse",
      async ({ currentOrg, currentOrgMember, round, bucket, unpublish }) => {
        if (!this.orgHasDiscourse(currentOrg)) {
          return;
        }

        console.log(
          `Setting visibility of bucket ${
            bucket.id
          } to ${!unpublish} on Discourse...`
        );

        if (!bucket.discourseTopicId) {
          await eventHub.publish("create-bucket", {
            currentOrg,
            currentOrgMember,
            round,
            bucket,
          });
          //bucket = Bucket.findOne({ _id: bucket.id });
        }

        await discourse(currentOrg.discourse).topics.updateStatus(
          {
            id: bucket.discourseTopicId,
            status: "visible",
            enabled: !unpublish,
          },
          {
            username: "system",
            apiKey: currentOrg.discourse.apiKey,
          }
        );
      }
    );

    eventHub.subscribe(
      "create-comment",
      "discourse",
      async ({ currentOrg, currentOrgMember, round, bucket, comment }) => {
        if (!this.orgHasDiscourse(currentOrg)) {
          return;
        }

        if (!currentOrgMember.discourseApiKey)
          throw new Error(
            "You need to have a discourse account connected, go to /connect-discourse"
          );

        if (comment.content.length < currentOrg.discourse.minPostLength)
          throw new Error(
            `Your post needs to be at least ${currentOrg.discourse.minPostLength} characters long!`
          );

        console.log(`Publishing comment in bucket ${bucket.id} to discourse...`);

        if (!bucket.discourseTopicId) {
          await eventHub.publish("create-bucket", {
            currentOrg,
            currentOrgMember,
            round,
            bucket,
          });
          //bucket = Bucket.findOne({ _id: bucket.id });
        }

        const post = await discourse(currentOrg.discourse).posts.create(
          {
            topic_id: bucket.discourseTopicId,
            raw: comment.content,
          },
          {
            username: currentOrgMember.discourseUsername,
            userApiKey: currentOrgMember.discourseApiKey,
          }
        );

        if (post.errors) throw new Error(["Discourse API:", ...post.errors]);
        const created = this.generateComment(
          { ...post, raw: comment.content },
          currentOrgMember
        );
        liveUpdate.publish("commentsChanged", {
          commentsChanged: { comment: created, action: "created" },
        });

        return created;
      }
    );

    eventHub.subscribe(
      "edit-comment",
      "discourse",
      async ({ currentOrg, currentOrgMember, bucket, comment }) => {
        if (!this.orgHasDiscourse(currentOrg)) {
          return;
        }
        if (!currentOrgMember.discourseApiKey)
          throw new Error(
            "You need to have a discourse account connected, go to /connect-discourse"
          );

        console.log(
          `Updating comment ${comment.id} in bucket ${bucket.id} to discourse...`
        );

        const post = await discourse(currentOrg.discourse).posts.update(
          comment.id,
          {
            title: bucket.title,
            raw: comment.content,
          },
          {
            username: currentOrgMember.discourseUsername,
            userApiKey: currentOrgMember.discourseApiKey,
          }
        );

        if (post.errors) throw new Error(["Discourse API:", ...post.errors]);

        const updated = this.generateComment(
          { ...post, raw: comment.content },
          currentOrgMember
        );
        liveUpdate.publish("commentsChanged", {
          commentsChanged: { comment: updated, action: "edited" },
        });

        return updated;
      }
    );

    eventHub.subscribe(
      "delete-comment",
      "discourse",
      async ({ currentOrg, currentOrgMember, comment }) => {
        if (!this.orgHasDiscourse(currentOrg)) {
          return;
        }
        if (!currentOrgMember.discourseApiKey)
          throw new Error(
            "You need to have a discourse account connected, go to /connect-discourse"
          );

        console.log(`Deleting comment ${comment.id} on discourse...`);

        const res = await discourse(currentOrg.discourse).posts.delete({
          id: comment.id,
          userApiKey: currentOrgMember.discourseApiKey,
        });

        if (!res.ok) throw new Error(["Discourse API:", res.statusText]);

        // liveUpdate.publish("commentsChanged", {
        //   commentsChanged: { comment, action: "deleted" },
        // });

        return comment;
      }
    );
  },

  generateBucketMarkdown(bucket, round, org) {
    const content = [];

    if (org) {
      const protocol = process.env.NODE_ENV == "production" ? "https" : "http";
      const domain =
        org.customDomain || `${org.subdomain}.${process.env.DEPLOY_URL}`;
      const bucketUrl = `${protocol}://${domain}/${round.slug}/${bucket.id}`;
      content.push(
        "View and edit this post on the Cobudget platform: ",
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
