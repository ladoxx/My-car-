import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getAnalyticsSummary } from '@/lib/settings';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const summary = await getAnalyticsSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching analytics, returning safe empty stats:', error);
    return NextResponse.json({
      totalVisits: 0,
      qrScans: 0,
      directVisits: 0,
      totalClicks: 0,
      qrConversionRate: '0%',
      clicks: { whatsapp: 0, kakaotalk: 0, phone: 0 },
      recentEvents: [],
      dailyStats: [],
    });
  }
}
