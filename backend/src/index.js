require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { z } = require('zod');

const { prisma } = require('./config/prisma');
const { ticketQueue } = require('./config/queue');

const app = express();
// Default to 3001 to match frontend expectation; can be overridden via PORT env
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Simple health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Validation schema for incoming tickets
const ticketInputSchema = z.object({
  content: z.string().min(1, 'content is required'),
});

// POST /tickets - Ingest complaint and enqueue for async processing
app.post('/tickets', async (req, res) => {
  try {
    const parsed = ticketInputSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: parsed.error.flatten(),
      });
    }

    const { content } = parsed.data;

    // 1. Persist ticket with PENDING status
    const ticket = await prisma.ticket.create({
      data: {
        content,
        status: 'PENDING',
      },
    });

    // 2. Enqueue job for async processing (do NOT wait for AI work)
    // Waiting for the job to be added to Redis is fine; processing is decoupled.
    await ticketQueue.add(
      'process-ticket',
      {
        ticketId: ticket.id,
        content: ticket.content,
      },
      {
        // basic retry strategy; worker will mark final failures in DB
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    // 3. Return 201 immediately
    return res.status(201).json({
      message: 'Ticket received',
      id: ticket.id,
    });
  } catch (err) {
    console.error('Error handling /tickets', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// --- TAMBAHKAN KODE INI ---

app.get('/tickets/:id', async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/tickets/:id', async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { status, replyDraft } = req.body;

    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { 
        ...(status && { status }),
        ...(replyDraft && { replyDraft })
      }
    });
    
    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------

// PATCH /tickets/:id - update replyDraft and/or status (e.g. RESOLVED)
const ticketUpdateSchema = z
  .object({
    status: z.enum(['RESOLVED']).optional(),
    replyDraft: z.string().min(1).optional(),
  })
  .refine(
    (data) => typeof data.status !== 'undefined' || typeof data.replyDraft !== 'undefined',
    { message: 'At least one of status or replyDraft must be provided' }
  );

app.patch('/tickets/:id', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ticket id' });
  }

  const parsed = ticketUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid request body',
      details: parsed.error.flatten(),
    });
  }

  const updateData = {};
  if (typeof parsed.data.replyDraft !== 'undefined') {
    updateData.replyDraft = parsed.data.replyDraft;
  }
  if (typeof parsed.data.status !== 'undefined') {
    updateData.status = parsed.data.status;
  }

  try {
    const updated = await prisma.ticket.update({
      where: { id },
      data: updateData,
    });

    return res.json(updated);
  } catch (err) {
    console.error(`Error updating ticket ${id}`, err);
    if (err.code === 'P2025') {
      // Prisma "record not found" error
      return res.status(404).json({ error: 'Ticket not found' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});

