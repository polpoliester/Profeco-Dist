const RABBITMQ_CONFIG = {
  url: process.env.RABBITMQ_URL || 'amqp://localhost',
  queues: {
    quejas: 'quejas_queue'
  },
  options: {
    durable: true
  }
};

module.exports = RABBITMQ_CONFIG;

