const { Queue } = require('bullmq');
const IORedis = require('ioredis');

// Kita pisahkan Host dan Port agar tidak perlu repot parsing URL
const redisHost = process.env.REDIS_HOST || 'redis';
const redisPort = process.env.REDIS_PORT || 6379;

// Ini adalah format opsi yang paling disukai dan diwajibkan oleh BullMQ
const redisConnectionOptions = {
  host: redisHost,
  port: parseInt(redisPort, 10),
  maxRetriesPerRequest: null, // <-- Harga mati untuk BullMQ
};

// Koneksi untuk Queue (API / Kasir)
const connection = new IORedis(redisConnectionOptions);

const ticketQueue = new Queue('ticket-processing', {
  connection,
});

module.exports = {
  ticketQueue,
  connection,
  redisConnectionOptions,
};