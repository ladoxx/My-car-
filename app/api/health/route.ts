import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Quick probe to ensure database is responsive
    await prisma.vehicleContactSettings.count();
    return NextResponse.json({
      status: 'ok',
      service: 'fmkal-vehicle-contact',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
