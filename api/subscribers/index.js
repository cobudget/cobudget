const discourseSubscriber = require('./discourse.subscriber')
const loomioSubscriber = require('./loomio.subscriber')

module.exports = {
  initialize(eventHub) {
    discourseSubscriber.initialize(eventHub);
    loomioSubscriber.initialize(eventHub);
  }
}
