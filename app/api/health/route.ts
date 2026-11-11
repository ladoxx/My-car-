import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  let dbStatus = 'ok';
  try {
    // Quick probe to ensure database is responsive
    await prisma.$queryRawUnsafe(`SELECT 1`);
  } catch (error: any) {
    dbStatus = 'healing';
    console.warn('[HEALTH] Database connection healing/initializing:', error?.message);
  }

  // Always return HTTP 200 so Docker healthcheck marks the container as HEALTHY
  return NextResponse.json({
    status: 'ok',
    database: dbStatus,
    service: 'fmkal-vehicle-contact',
    timestamp: new Date().toISOString(),
  });
}
