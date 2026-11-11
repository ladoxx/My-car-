import { PrismaClient } from './generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'path';
import fs from 'fs';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  // Try current directory
  const currentDb = path.resolve(process.cwd(), 'dev.db');
  if (fs.existsSync(currentDb)) {
    return `file:${currentDb.replace(/\\/g, '/')}`;
  }
  // Try project root if running from .next/standalone
  const parentDb = path.resolve(process.cwd(), '..', '..', 'dev.db');
  if (fs.existsSync(parentDb)) {
    return `file:${parentDb.replace(/\\/g, '/')}`;
  }
  // Fallback to absolute current path
  return `file:${currentDb.replace(/\\/g, '/')}`;
}

function createPrismaClient() {
  const url = getDatabaseUrl();
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
