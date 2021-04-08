const discourse = require("../lib/discourse");

module.exports = {
  initialize(eventHub, models) {
    console.log(`Integrating with Discourse...`)

    eventHub.subscribe('create-dream', async ({ currentOrg, currentOrgMember, event, dream }) => {
      if (!currentOrg.discourse) { return }
      if (!dream.published) { return } // Only push published dreams to Discourse

      if (!currentOrgMember.discourseApiKey)
        throw new Error("You need to have a discourse account connected, go to /connect-discourse");

      console.log(`Publishing dream ${dream.id} to discourse...`)

      // const domain = currentOrg.customDomain || [currentOrg.subdomain, process.env.DEPLOY_URL].join('.')
      const post = await discourse(currentOrg.discourse).posts.create({
        title: dream.title,
        raw: this.generateDreamMarkdown(dream, event, currentOrg),
        category: event.discourseCategoryId,
      }, {
        username: 'system',
        apiKey: currentOrg.discourse.apiKey,
      });

      if (!post.id)
        throw new Error("Unable to create topic on Discourse; please try again");

      dream.comments.forEach(comment => {
        eventHub.publish('create-comment', { currentOrg, currentOrgMember, event, dream, comment });
      });

      dream.discourseTopicId = post.topic_id;
      dream.save();
    });

    eventHub.subscribe('edit-dream', async ({ currentOrg, currentOrgMember, event, dream }) => {
      if (!currentOrg.discourse || !dream.published) { return }

      if (!currentOrgMember.discourseApiKey)
        throw new Error("You need to have a discourse account connected, go to /connect-discourse");

      console.log(`Updating dream ${dream.id} on discourse`);

      if (!dream.discourseTopicId) {
        await eventHub.publish('create-dream', { currentOrg, currentOrgMember, event, dream });
        dream = await models.Dream.findOne({ _id: dream.id });
      }

      const post = await discourse(currentOrg.discourse).topics.getSummary({
        id: dream.discourseTopicId
      }, {
        username: 'system',
        apiKey: currentOrg.discourse.apiKey,
      });

      if (!post.id)
        throw new Error("Unable to find topic post on Discourse; please try again");

      const comment = {
        id: post.id,
        title: dream.title,
        content: this.generateDreamMarkdown(dream, event, currentOrg),
      };

      eventHub.publish('edit-comment', { currentOrg, currentOrgMember, event, dream, comment });
    });

    eventHub.subscribe('publish-dream', async ({ currentOrg, currentOrgMember, event, dream }) => {
      dream.discourseTopicId
        ? eventHub.publish('create-dream', { currentOrg, currentOrgMember, event, dream })
        : eventHub.publish('edit-dream', { currentOrg, currentOrgMember, event, dream })
    });

    eventHub.subscribe('create-comment', async ({ currentOrg, currentOrgMember, event, dream, comment }) => {
      if (!currentOrg.discourse || !dream.published) { return }
      if (!currentOrgMember.discourseApiKey)
        throw new Error("You need to have a discourse account connected, go to /connect-discourse");

      console.log(`Publishing comment in dream ${dream.id} to discourse...`)

      if (!dream.discourseTopicId) {
        await eventHub.publish('create-dream', { currentOrg, currentOrgMember, event, dream });
        dream = await models.Dream.findOne({ _id: dream.id });
      }

      const post = await discourse(currentOrg.discourse).posts.create({
        topic_id: dream.discourseTopicId,
        raw: comment.content
      }, {
        username: currentOrgMember.discourseUsername,
        userApiKey: currentOrgMember.discourseApiKey
      });

      if (!post.id)
        throw new Error("Unable to create post on Discourse; please try again");

      dream.save();
    });

    eventHub.subscribe('edit-comment', async ({ currentOrg, currentOrgMember, event, dream, comment }) => {
      if (!currentOrg.discourse) { return }
      if (!currentOrgMember.discourseApiKey)
        throw new Error("You need to have a discourse account connected, go to /connect-discourse");

      console.log(`Updating comment ${comment.id} in dream ${dream.id} to discourse...`);

      if (!dream.discourseTopicId) {
        await eventHub.publish('create-dream', { currentOrg, currentOrgMember, event, dream });
        dream = await models.Dream.findOne({ _id: dream.id });
      }

      const post = await discourse(currentOrg.discourse).posts.update(comment.id, {
        title: dream.title,
        raw: comment.content,
      }, {
        username: currentOrgMember.discourseUsername,
        userApiKey: currentOrgMember.discourseApiKey,
      });

      if (!post.id)
        throw new Error("Unable to create post on Discourse; please try again");
      // TODO: edit functionality
    });

    eventHub.subscribe('delete-comment', async ({ currentOrg, currentOrgMember, event, dream, comment }) => {
      if (!currentOrg.discourse) { return }
      if (!currentOrgMember.discourseApiKey)
        throw new Error("You need to have a discourse account connected, go to /connect-discourse");

      console.log(`Deleting comment ${comment.id} on discourse...`)

      const res = await discourse(currentOrg.discourse).posts.delete({
        id: comment.id,
        userApiKey: currentOrgMember.discourseApiKey,
      });

      if (!res.ok)
        throw new Error("Unable to delete post on Discourse; please try again");
    });
  },

  generateDreamMarkdown(dream, event, org) {
    const dreamUrl = `${process.env.NODE_ENV == 'production' ? 'https' : 'http'}://${
      org.customDomain
        ? org.customDomain
        : `${org.subdomain}.${process.env.DEPLOY_URL}`
    }/${event.slug}/${dream.id}`

    const content = ['View and edit this post on the Dreams platform: ', dreamUrl]

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
