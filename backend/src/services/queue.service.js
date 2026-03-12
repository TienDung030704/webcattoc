const queueModel = require("");

class QueueService {
  async push(job) {
    const { type, payload } = job;
    await queueModel.create(type, JSON.stringify(payload));
  }
}
module.exports = new QueueService();
