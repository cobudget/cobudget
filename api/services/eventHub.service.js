class EventHub {
  static subscriptions = new Proxy({}, {
    get: (target, name) => target.hasOwnProperty(name) ? target[name] : []
  })

  static publish(channel, event) {
    this.subscriptions[channel].reduce(({ success, errors }, fn) => {
      try {
        fn(event);
        return errors;
      } catch(err) {
        return errors.concat(err);
      }
    }, []);

    if (errors.length)
      throw new Error(errors.join(', '));
  }

  static subscribe(channel, fn) {
    this.subscriptions[channel] = this.subscriptions[channel].concat(fn)
  }
}

module.exports = EventHub;
