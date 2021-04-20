const discourse = require("../lib/discourse");
const liveUpdate = require("../services/liveUpdate.service");

const orgHasDiscourse = (org) => org.discourse.url && org.discourse.apiKey

module.exports = {
  initialize(eventHub, models) {
    console.log(`Integrating with Discourse...`)

    eventHub.subscribe('create-dream', async ({ currentOrg, currentOrgMember, event, dream }) => {
      if (!orgHasDiscourse(currentOrg)) { return }
      if (!currentOrgMember.discourseApiKey)
        throw new Error("You need to have a discourse account connected, go to /connect-discourse");

      console.log(`Publishing dream ${dream.id} to discourse...`)

      const domain = currentOrg.customDomain || [currentOrg.subdomain, process.env.DEPLOY_URL].join('.')
      const post = await discourse(currentOrg.discourse).posts.create({
        title: dream.title,
        raw: this.generateDreamMarkdown(dream, event, currentOrg),
        category: event.discourseCategoryId,
        unlist_topic: !dream.published,
      }, {
        username: 'system',
        apiKey: currentOrg.discourse.apiKey,
      });

      if (post.errors)
        throw new Error(["Discourse API:", ...post.errors]);

      dream.comments.forEach(comment => {
        eventHub.publish('create-comment', { currentOrg, currentOrgMember, event, dream, comment });
      });

      dream.discourseTopicId = post.topic_id;
      await dream.save();
    });

    eventHub.subscribe('edit-dream', async ({ currentOrg, currentOrgMember, event, dream }) => {
      if (!orgHasDiscourse(currentOrg)) { return }

      if (!dream.discourseTopicId) {
        await eventHub.publish('create-dream', { currentOrg, currentOrgMember, event, dream });
        dream = Dream.findOne({ _id: dream.id });
      }

      if (!currentOrgMember.discourseApiKey)
        throw new Error("You need to have a discourse account connected, go to /connect-discourse");

      console.log(`Updating dream ${dream.id} on discourse`);

      const post = await discourse(currentOrg.discourse).topics.getSummary({
        id: dream.discourseTopicId
      }, {
        username: 'system',
        apiKey: currentOrg.discourse.apiKey,
      });

      if (post.errors)
        throw new Error(["Discourse API:", ...post.errors]);

      const comment = {
        id: post.id,
        title: dream.title,
        content: this.generateDreamMarkdown(dream, event, currentOrg),
      };

      eventHub.publish('edit-comment', { currentOrg, currentOrgMember, event, dream, comment });
    });

    eventHub.subscribe('publish-dream', async ({ currentOrg, currentOrgMember, event, dream }) => {
      console.log(`Setting visibility of dream ${dream.id} to ${dream.published} on Discourse...`);

      if (!dream.discourseTopicId) {
        await eventHub.publish('create-dream', { currentOrg, currentOrgMember, event, dream });
        dream = Dream.findOne({ _id: dream.id });
      }

      const post = await discourse(currentOrg.discourse).topics.updateStatus({
        id: dream.discourseTopicId,
        status: 'visible',
        enabled: dream.published
      }, {
        username: 'system',
        apiKey: currentOrg.discourse.apiKey,
      });
    });

    eventHub.subscribe('create-comment', async ({ currentOrg, currentOrgMember, event, dream, comment }) => {
      if (!orgHasDiscourse(currentOrg)) { return }
      if (!currentOrgMember.discourseApiKey)
        throw new Error("You need to have a discourse account connected, go to /connect-discourse");

      console.log(`Publishing comment in dream ${dream.id} to discourse...`)

      if (!dream.discourseTopicId) {
        await eventHub.publish('create-dream', { currentOrg, currentOrgMember, event, dream });
        dream = Dream.findOne({ _id: dream.id });
      }

      const post = await discourse(currentOrg.discourse).posts.create({
        topic_id: dream.discourseTopicId,
        raw: comment.content
      }, {
        username: currentOrgMember.discourseUsername,
        userApiKey: currentOrgMember.discourseApiKey
      });

      if (post.errors)
        throw new Error(["Discourse API:", ...post.errors]);

      liveUpdate.publish('commentsChanged', { commentsChanged: { id: dream.id } });
    });

    eventHub.subscribe('edit-comment', async ({ currentOrg, currentOrgMember, event, dream, comment }) => {
      if (!orgHasDiscourse(currentOrg)) { return }
      if (!currentOrgMember.discourseApiKey)
        throw new Error("You need to have a discourse account connected, go to /connect-discourse");

      console.log(`Updating comment ${comment.id} in dream ${dream.id} to discourse...`);

      const post = await discourse(currentOrg.discourse).posts.update(comment.id, {
        title: dream.title,
        raw: comment.content,
      }, {
        username: currentOrgMember.discourseUsername,
        userApiKey: currentOrgMember.discourseApiKey,
      });

      if (post.errors)
        throw new Error(["Discourse API:", ...post.errors]);

      liveUpdate.publish('commentsChanged', { commentsChanged: { id: dream.id } });
    });

    eventHub.subscribe('delete-comment', async ({ currentOrg, currentOrgMember, event, dream, comment }) => {
      if (!orgHasDiscourse(currentOrg)) { return }
      if (!currentOrgMember.discourseApiKey)
        throw new Error("You need to have a discourse account connected, go to /connect-discourse");

      console.log(`Deleting comment ${comment.id} on discourse...`)

      const res = await discourse(currentOrg.discourse).posts.delete({
        id: comment.id,
        userApiKey: currentOrgMember.discourseApiKey,
      });

      if (!res.ok)
        throw new Error(["Discourse API:", res.statusText]);

      liveUpdate.publish('commentsChanged', { commentsChanged: { id: dream.id } });
    });
  },

  generateDreamMarkdown(dream, event, org) {
    const content = [];

    if (org) {
      const protocol = process.env.NODE_ENV == 'production' ? 'https': 'http'
      const domain = org.customDomain || `${org.subdomain}.${process.env.DEPLOY_URL}`
      const dreamUrl = `${protocol}://${domain}/${event.slug}/${dream.id}`
      content.push('View and edit this post on the Dreams platform: ', dreamUrl)
    }

    if (dream.summary) {
      content.push('## Summary');
      content.push(dream.summary);
    }

    if (dream.description) {
      content.push('## Description');
      content.push(dream.description);
    }

    if (dream.budgetItems && dream.budgetItems.length > 0) {
      const income = dream.budgetItems.filter(({ type }) => type === 'INCOME');
      const expenses = dream.budgetItems.filter(({ type }) => type === 'EXPENSE');

      content.push('## Budget Items');

      if (income.length) {
        content.push('#### Income / Existing funding');
        content.push([
          `|Description|Amount|`,
          `|---|---|`,
          ...income.map(({ description, min }) => `|${description}|${min} ${event.currency}|`)
        ].join('\n'));      }

      if (expenses.length) {
        content.push('#### Expenses');
        content.push([
          `|Description|Amount|`,
          `|---|---|`,
          ...expenses.map(({ description, min }) => `|${description}|${min} ${event.currency}|`)
        ].join('\n'));
      }

      content.push(`Total funding goal: ${dream.minGoal} ${event.currency}`)
    }

    if (dream.images && dream.images.length > 0) {
      content.push('## Images');
      dream.images.forEach(({ small }) => content.push(`![](${small})`));
    }

    return content.join('\n\n');
  }
}
