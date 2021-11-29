// TODO: remove disable
/* eslint-disable no-unused-vars */
module.exports = {
  initialize(eventHub) {
    if (!process.env.LOOMIO_API_URL) {
      return;
    }

    console.log(`Integrating with Loomio at ${process.env.LOOMIO_API_URL}`);

    eventHub.subscribe("create-event", ({ event, actor }) => {
      console.log("TODO: publish group to Loomio (?)");
    });

    eventHub.subscribe("create-dream", ({ dream, actor }) => {
      console.log("TODO: publish discussion to Loomio");
    });

    eventHub.subscribe("create-comment", ({ comment, actor }) => {
      console.log("TODO: publish comment to Loomio");
    });
  },
};
