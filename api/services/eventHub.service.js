class EventHub {
  static subscribe(channel, fn) {
    this.subscriptions[channel] = this.subscriptions[channel].concat(fn);
  }
}

EventHub.subscriptions = new Proxy(
  {},
  {
    // not sure what's going on here lol
    // eslint-disable-next-line no-prototype-builtins
    get: (target, name) => (target.hasOwnProperty(name) ? target[name] : []),
  }
);

EventHub.publish = async (channel, event) => {
  const errors = await this.subscriptions[channel].reduce(
    async (result, fn) => {
      try {
        await fn(event);
        return result;
      } catch (err) {
        console.error(err);
        if (result.concat) return result.concat(err);
        return result;
      }
    },
    []
  );

  if (errors.length) {
    errors.map(console.error);
    throw new Error(errors.join(", "));
  }
};

module.exports = EventHub;
