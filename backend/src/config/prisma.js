const { PrismaClient } = require('@prisma/client');

// Single PrismaClient instance for the whole backend
const prisma = new PrismaClient();

module.exports = {
  prisma,
};
