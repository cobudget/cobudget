const { getModels } = require("../database/models");
const { db } = require("@sensestack/plato-core");
const initKcAdminClient = require("../utils/initKcAdminClient");

const discourseSubscriber = require("./discourse.subscriber");
const loomioSubscriber = require("./loomio.subscriber");
const emailSubscriber = require("./email.subscriber");
module.exports = {
  initialize: async (eventHub) => {
    const models = getModels(await db.getConnection(process.env.MONGO_URL));
    const kcAdminClient = await initKcAdminClient();

    discourseSubscriber.initialize(eventHub, models);
    loomioSubscriber.initialize(eventHub, models);
    emailSubscriber.initialize(eventHub, models, kcAdminClient);
  },
};
