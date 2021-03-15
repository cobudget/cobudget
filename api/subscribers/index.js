const { getModels } = require("../database/models");
const { db } = require("@sensestack/plato-core");

const discourseSubscriber = require('./discourse.subscriber')
const loomioSubscriber = require('./loomio.subscriber')

module.exports = {
  initialize: async (eventHub) => {
    const models = getModels(await db.getConnection(process.env.MONGO_URL));

    discourseSubscriber.initialize(eventHub, models);
    loomioSubscriber.initialize(eventHub, models);
  }
}
