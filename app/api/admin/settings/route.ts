import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getVehicleSettings, updateVehicleSettings } from '@/lib/settings';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await getVehicleSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Sanitize and validate fields
    const updated = await updateVehicleSettings({
      carModel: typeof body.carModel === 'string' ? body.carModel : undefined,
      licensePlate: typeof body.licensePlate === 'string' ? body.licensePlate : undefined,
      status: typeof body.status === 'string' ? body.status : undefined,
      statusText: typeof body.statusText === 'string' ? body.statusText : undefined,
      headline: typeof body.headline === 'string' ? body.headline : undefined,
      greeting: typeof body.greeting === 'string' ? body.greeting : undefined,
      subGreeting: typeof body.subGreeting === 'string' ? body.subGreeting : undefined,
      bodyText: typeof body.bodyText === 'string' ? body.bodyText : undefined,
      footerNote: typeof body.footerNote === 'string' ? body.footerNote : undefined,
      footerBranding: typeof body.footerBranding === 'string' ? body.footerBranding : undefined,
      phoneEnabled: typeof body.phoneEnabled === 'boolean' ? body.phoneEnabled : undefined,
      phoneNumber: typeof body.phoneNumber === 'string' ? body.phoneNumber : undefined,
      whatsAppEnabled: typeof body.whatsAppEnabled === 'boolean' ? body.whatsAppEnabled : undefined,
      whatsAppNumber: typeof body.whatsAppNumber === 'string' ? body.whatsAppNumber : undefined,
      whatsAppMessage: typeof body.whatsAppMessage === 'string' ? body.whatsAppMessage : undefined,
      kakaoTalkEnabled: typeof body.kakaoTalkEnabled === 'boolean' ? body.kakaoTalkEnabled : undefined,
      kakaoTalkUrl: typeof body.kakaoTalkUrl === 'string' ? body.kakaoTalkUrl : undefined,
      vehicleImageUrl: typeof body.vehicleImageUrl === 'string' ? body.vehicleImageUrl : undefined,
      baseUrl: typeof body.baseUrl === 'string' ? body.baseUrl : undefined,
      qrOnlyAccess: typeof body.qrOnlyAccess === 'boolean' ? body.qrOnlyAccess : undefined,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Error updating settings:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
