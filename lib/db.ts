import { PrismaClient } from './generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'path';
import fs from 'fs';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getDatabaseUrl(): string {
  let url = process.env.DATABASE_URL;
  if (!url) {
    const currentDb = path.resolve(process.cwd(), 'dev.db');
    if (fs.existsSync(currentDb)) {
      url = `file:${currentDb.replace(/\\/g, '/')}`;
    } else {
      const parentDb = path.resolve(process.cwd(), '..', '..', 'dev.db');
      if (fs.existsSync(parentDb)) {
        url = `file:${parentDb.replace(/\\/g, '/')}`;
      } else {
        url = `file:${currentDb.replace(/\\/g, '/')}`;
      }
    }
  }

  // Ensure parent directory exists for SQLite file
  try {
    const cleanPath = url.replace(/^file:/, '');
    const dir = path.dirname(cleanPath);
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {}

  return url;
}

function createPrismaClient() {
  const url = getDatabaseUrl();
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

// Auto-heal schema and ensure all SQLite tables and columns exist
async function autoHealDatabase() {
  try {
    // 1. Ensure all core tables exist in SQLite
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS AdminUser (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS VehicleContactSettings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        carModel TEXT DEFAULT '기아 레이 (Kia Ray)',
        licensePlate TEXT DEFAULT 'FMKAL',
        status TEXT DEFAULT 'available',
        statusText TEXT DEFAULT '연락 가능 · 통화 및 메시지 가능',
        headline TEXT DEFAULT '차량 연락 센터',
        greeting TEXT DEFAULT '안녕하세요!',
        subGreeting TEXT DEFAULT '차량 관련 문의가 있으신가요?',
        bodyText TEXT DEFAULT '차량 이동이 필요하거나 긴급한 연락이 필요하시면 아래 방법으로 연락해 주세요.',
        footerNote TEXT DEFAULT '빠른 연락에 감사드립니다.',
        footerBranding TEXT DEFAULT 'FMKAL · VEHICLE CONTACT',
        phoneEnabled BOOLEAN DEFAULT 1,
        phoneNumber TEXT DEFAULT '010-0000-0000',
        whatsAppEnabled BOOLEAN DEFAULT 1,
        whatsAppNumber TEXT DEFAULT '+821000000000',
        whatsAppMessage TEXT DEFAULT '안녕하세요. 차량 관련하여 연락드립니다.',
        kakaoTalkEnabled BOOLEAN DEFAULT 1,
        kakaoTalkUrl TEXT DEFAULT '',
        vehicleImageUrl TEXT DEFAULT '',
        baseUrl TEXT DEFAULT 'https://car.fmkal.com',
        qrOnlyAccess BOOLEAN DEFAULT 1,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS AnalyticsEvent (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        deviceType TEXT,
        source TEXT DEFAULT 'direct',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS LoginAttempt (
        id TEXT PRIMARY KEY,
        ip TEXT NOT NULL,
        success BOOLEAN NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Add qrOnlyAccess if missing from an older database schema
    const cols = await prisma.$queryRawUnsafe<any[]>(`PRAGMA table_info(VehicleContactSettings)`);
    if (Array.isArray(cols) && cols.length > 0) {
      const hasCol = cols.some((c: any) => c.name === 'qrOnlyAccess');
      if (!hasCol) {
        console.log('[FMKAL DB] Auto-healing: Adding missing column qrOnlyAccess...');
        await prisma.$executeRawUnsafe(`ALTER TABLE VehicleContactSettings ADD COLUMN qrOnlyAccess BOOLEAN DEFAULT 1`);
      }
    }
  } catch (err) {
    console.error('[FMKAL DB] Auto-heal warning:', err);
  }
}

autoHealDatabase().catch(() => {});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
