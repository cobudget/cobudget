const discourse = require("../lib/discourse");

module.exports = {
  initialize(eventHub, models) {
    if (!process.env.DISCOURSE_API_URL) { return }

    console.log(`Integrating with Discourse at ${process.env.DISCOURSE_API_URL}`)

    eventHub.subscribe('create-event', ({ event, actor }) => {
      console.log('TODO: publish category to discourse (?)');
    });

    eventHub.subscribe('create-dream', async ({ currentOrg, currentOrgMember, event, dream }) => {
      if (!currentOrg.discourse) { return }
      if (!dream.published) { return } // Only push published dreams to Discourse

      if (!currentOrgMember.discourseApiKey)
        throw new Error("You need to have a discourse account connected, go to /connect-discourse");

      console.log(`Publishing dream ${dream.id} to discourse...`)

      const domain = currentOrg.customDomain || [currentOrg.subdomain, process.env.DEPLOY_URL].join('.')
      const post = await discourse(currentOrg.discourse).posts.create({
        title: dream.title,
        raw: this.generateDreamMarkdown(dream, event),
        category: currentOrg.discourse.dreamsCategoryId,
      }, {
        username: currentOrgMember.discourseUsername,
        userApiKey: currentOrgMember.discourseApiKey,
      });

      if (!post.id)
        throw new Error("Unable to create topic on Discourse; please try again");

      dream.discourseTopicId = post.topic_id;
    });

    eventHub.subscribe('edit-dream', async ({ currentOrg, currentOrgMember, event, dream }) => {
      if (!currentOrg.discourse) { return }
      if (!dream.published) { return } // Only push published dreams to Discourse

      if (!currentOrgMember.discourseApiKey)
        throw new Error("You need to have a discourse account connected, go to /connect-discourse");

      console.log(`Updating dream ${dream.id} on discourse`);

      if (!dream.discourseTopicId) {
        await eventHub.publish('create-dream', { currentOrg, currentOrgMember, event, dream });
        dream = models.Dream.findOne({ _id: dream.id });
      }

      const post = await discourse(currentOrg.discourse).posts.update(dream.discourseTopicId, {
        title: dream.title, raw: this.generateDreamMarkdown(dream, event)
      }, {
        username: currentOrgMember.discourseUsername,
        userApiKey: currentOrgMember.discourseApiKey,
      });

      if (!post.id)
        throw new Error("Unable to create post on Discourse; please try again");
    });

    eventHub.subscribe('publish-dream', async ({ currentOrg, currentOrgMember, event, dream }) => {
      dream.discourseTopicId
        ? eventHub.publish('create-dream', { currentOrg, currentOrgMember, event, dream })
        : eventHub.publish('edit-dream', { currentOrg, currentOrgMember, event, dream })
    });

    eventHub.subscribe('create-comment', async ({ currentOrg, currentOrgMember, event, dream, comment }) => {
      if (!currentOrg.discourse) { return }
      if (!currentOrgMember.discourseApiKey)
        throw new Error("You need to have a discourse account connected, go to /connect-discourse");

      console.log(`Publishing comment in dream ${dream.id} to discourse...`)

      if (!dream.discourseTopicId) {
        await eventHub.publish('create-dream', { currentOrg, currentOrgMember, event, dream });
        dream = models.Dream.findOne({ _id: dream.id });
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
    });

    eventHub.subscribe('delete-comment', async ({ currentOrg, currentOrgMember, event, dream, comment }) => {
      if (!currentOrg.discourse) { return }
      if (!currentOrgMember.discourseApiKey)
        throw new Error("You need to have a discourse account connected, go to /connect-discourse");

      console.log(`Deleting comment ${comment.id} on discourse...`)

      const post = await discourse(currentOrg.discourse).posts.getSingle(comment.id);

      if (post.username !== currentOrgMember.discourseUsername)
        throw new Error("You can only delete your own post. If this is your post, re-connect to discourse on /connect-discourse");

      const credentials = post.username === currentOrgMember.discourseUsername
        ? { userApiKey: currentOrgMember.discourseApiKey }
        : { username: currentOrg.discourse.username || 'system' }

      const res = await discourse(currentOrg.discourse).posts.delete({
        id: comment.id,
        ...credentials
      });

      if (!res.ok)
        throw new Error("Unable to delete post on Discourse; please try again");
    });
  },

  generateDreamMarkdown(dream, event) {
    const content = []
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
