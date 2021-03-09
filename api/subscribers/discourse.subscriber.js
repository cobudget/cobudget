module.exports = {
  initialize(eventHub) {
    if (!process.env.DISCOURSE_API_URL) { return }

    console.log(`Integrating with Discourse at ${process.env.DISCOURSE_API_URL}`)

    eventHub.subscribe('create-event', ({ event, actor }) => {
      console.log('TODO: publish category to discourse (?)');
    });

    eventHub.subscribe('create-dream', ({ dream, actor }) => {
      console.log('TODO: publish topic to discourse');
    });

    eventHub.subscribe('create-comment', ({ comment, actor }) => {
      console.log('TODO: publish post to discourse')
    });
  }
}
