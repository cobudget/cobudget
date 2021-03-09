class EventHub {
  static subscriptions = new Proxy({}, {
    get: (target, name) => target.hasOwnProperty(name) ? target[name] : []
  })

  static publish(channel, event) {
    this.subscriptions[channel].forEach(fn => fn(event))
  }

  static subscribe(channel, fn) {
    this.subscriptions[channel] = this.subscriptions[channel].concat(fn)
  }
}

module.exports = EventHub;
