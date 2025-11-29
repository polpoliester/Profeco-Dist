const RABBITMQ_CONFIG = {
  url: process.env.RABBITMQ_URL || 'amqp://localhost',
  queues: {
    notificaciones: 'notificaciones_queue'
  },
  exchanges: {
    notificaciones: 'notificaciones_exchange'
  },
  options: {
    durable: true
  }
};

module.exports = RABBITMQ_CONFIG;
