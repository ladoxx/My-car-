import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Quick probe to ensure database is responsive
    await prisma.$queryRawUnsafe(`SELECT 1`);
    return NextResponse.json({
      status: 'ok',
      service: 'fmkal-vehicle-contact',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Health check database error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database check failed',
        details: error?.message || String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
