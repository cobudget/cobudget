class EventHub {
  static subscriptions = new Proxy({}, {
    get: (target, name) => target.hasOwnProperty(name) ? target[name] : []
  })

  static publish(channel, event) {
    const errors = this.subscriptions[channel].reduce((result, fn) => {
      try {
        fn(event);
        return result;
      } catch(err) {
        return result.concat(err);
      }
    }, []);

    if (errors.length) {
      errors.map(console.error);
      throw new Error(errors.join(', '));
    }
  }

  static subscribe(channel, fn) {
    this.subscriptions[channel] = this.subscriptions[channel].concat(fn)
  }
}

module.exports = EventHub;
