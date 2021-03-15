const discourse = require("../lib/discourse");

module.exports = {
  initialize(eventHub, models) {
    if (!process.env.DISCOURSE_API_URL) { return }

    console.log(`Integrating with Discourse at ${process.env.DISCOURSE_API_URL}`)

    eventHub.subscribe('create-event', ({ event, actor }) => {
      console.log('TODO: publish category to discourse (?)');
    });

    eventHub.subscribe('create-dream', async ({ currentOrg, event, dream }) => {
      if (!currentOrg.discourse) { return }

      console.log(`Publishing dream ${dream.id} to discourse...`)

      const domain = currentOrg.customDomain || [currentOrg.subdomain, process.env.DEPLOY_URL].join('.')
      const post = await discourse(currentOrg.discourse).posts.create({
        title: dream.title,
        raw: `https://${domain}/${event.slug}/${dream.id}`,
        category: currentOrg.discourse.dreamsCategoryId,
      }, { username: currentOrg.discourse.username || 'system' });

      if (!post.id)
        throw new Error("Unable to create topic on Discourse; please try again");

      dream.discourseTopicId = post.topic_id;
      dream.save();
    });

    eventHub.subscribe('create-comment', async ({ currentOrg, currentOrgMember, event, dream, comment }) => {
      if (!currentOrg.discourse) { return }
      if (!currentOrgMember.discourseApiKey)
        throw new Error("You need to have a discourse account connected, go to /connect-discourse");

      console.log(`Publishing comment in dream ${dream.id} to discourse...`)

      if (!dream.discourseTopicId) {
        await eventHub.publish('create-dream', { currentOrg, event, dream });
        dream = models.Dream.findOne({ _id: dream.id });
      }

      const post = await discourse(currentOrg.discourse).posts.create({
        topic_id: dream.discourseTopicId,
        raw: comment.content
      }, { userApiKey: currentOrgMember.discourseApiKey });

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
  }
}
