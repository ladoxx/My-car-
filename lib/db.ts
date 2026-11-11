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

// Auto-heal schema differences (e.g. newly added columns in existing SQLite files)
async function autoHealDatabase() {
  try {
    const cols = await prisma.$queryRawUnsafe<any[]>(`PRAGMA table_info(VehicleContactSettings)`);
    if (Array.isArray(cols) && cols.length > 0) {
      const hasCol = cols.some((c: any) => c.name === 'qrOnlyAccess');
      if (!hasCol) {
        console.log('[FMKAL DB] Auto-healing: Adding missing column qrOnlyAccess...');
        await prisma.$executeRawUnsafe(`ALTER TABLE VehicleContactSettings ADD COLUMN qrOnlyAccess BOOLEAN DEFAULT 1`);
      }
    }
  } catch {
    // Silently continue if table does not exist yet
  }
}

autoHealDatabase().catch(() => {});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
