require('dotenv').config();

const { Worker } = require('bullmq');

const { prisma } = require('../config/prisma');
// const { connectionOptions } = require('../config/queue');
const { analyzeTicket } = require('../services/aiService');
const { redisConnectionOptions } = require('../config/queue');

const QUEUE_NAME = 'ticket-processing';

// Pass options object so BullMQ creates the Redis client and sets maxRetriesPerRequest: null itself.
const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { ticketId, content } = job.data || {};

    if (!ticketId || !content) {
      throw new Error('Invalid job data: ticketId and content are required');
    }

    try {
      const analysis = await analyzeTicket(content);

      await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          category: analysis.category,
          sentiment: analysis.sentiment,
          urgency: analysis.urgency,
          replyDraft: analysis.replyDraft,
          status: 'PROCESSED',
        },
      });

      return {
        ticketId,
        ...analysis,
      };
    } catch (err) {
      console.error(`Error processing ticket ${ticketId}`, err);

      const isLastAttempt =
        (job.attemptsMade + 1) >= (job.opts.attempts || 1);

      if (isLastAttempt) {
        // Final attempt failed: mark ticket as FAILED
        try {
          await prisma.ticket.update({
            where: { id: ticketId },
            data: {
              status: 'FAILED',
            },
          });
        } catch (updateErr) {
          console.error(
            `Failed to mark ticket ${ticketId} as FAILED`,
            updateErr
          );
        }
      }

      // Re-throw so BullMQ can apply its retry / failure semantics
      throw err;
    }
  },
  {
    connection: redisConnectionOptions
  }
);

worker.on('completed', (job) => {
  console.log(
    `Job ${job.id} for ticket ${job.data.ticketId} completed successfully`
  );
});

worker.on('failed', (job, err) => {
  console.error(
    `Job ${job?.id} for ticket ${job?.data?.ticketId} failed`,
    err
  );
});

console.log(`Worker started for queue "${QUEUE_NAME}"`);

