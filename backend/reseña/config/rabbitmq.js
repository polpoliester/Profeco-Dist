const RABBITMQ_CONFIG = {
  url: process.env.RABBITMQ_URL || 'amqp://localhost',
  queues: {
    resenas: 'resenas_queue'
  },
  options: {
    durable: true
  }
};

module.exports = RABBITMQ_CONFIG;