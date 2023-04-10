class ActivityLog {
  limit: number;
  queue: Array<{ message: string; data: unknown }>;

  constructor(limit?: number) {
    this.limit = limit || 8;
    this.queue = [];
  }

  log(message: string, data: unknown = {}) {
    if (this.queue.length >= this.limit) {
      this.queue = this.queue.slice(1 - this.limit).concat([{ message, data }]);
    } else {
      this.queue.push({ message, data });
    }
  }

  get logs() {
    return this.queue;
  }

  reset() {
    this.queue = [];
  }
}

const activityLog = new ActivityLog();
export default activityLog;
