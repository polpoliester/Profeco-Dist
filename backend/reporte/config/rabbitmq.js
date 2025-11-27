const RABBITMQ_CONFIG = {
  url: process.env.RABBITMQ_URL || 'amqp://localhost',
  queues: {
    reportes: 'reportes_queue'
  },
  exchanges: {
    notificaciones: 'notificaciones_exchange'
  }
};

module.exports = RABBITMQ_CONFIG;
