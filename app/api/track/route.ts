import { NextRequest, NextResponse } from 'next/server';
import { recordAnalyticsEvent } from '@/lib/settings';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, source } = body;

    const allowedEvents = [
      'page_view',
      'qr_scan',
      'click_whatsapp',
      'click_kakaotalk',
      'click_phone',
    ];

    if (!event || !allowedEvents.includes(event)) {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent');
    await recordAnalyticsEvent(event, source === 'qr' ? 'qr' : 'direct', userAgent);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error tracking event:', err);
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 });
  }
}
