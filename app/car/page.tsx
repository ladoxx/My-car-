import { cookies } from 'next/headers';
import { getVehicleSettings } from '@/lib/settings';
import VehicleContactClient from '@/components/VehicleContactClient';

export const dynamic = 'force-dynamic';

export default async function CarContactPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  let isAuthorized = false;
  let settings = await getVehicleSettings();

  try {
    const resolvedParams = await searchParams;
    const cookieStore = await cookies();
    const isQr = resolvedParams?.src === 'qr' || resolvedParams?.qr === '1';
    const hasAuthCookie =
      cookieStore.get('fmkal_qr_authorized')?.value === 'true' ||
      cookieStore.has('fmkal_admin_token') ||
      cookieStore.has('admin_session');
    isAuthorized = isQr || Boolean(hasAuthCookie) || settings.qrOnlyAccess === false;
  } catch (err) {
    console.error('[CAR_PAGE] Error resolving params/cookies:', err);
    isAuthorized = settings.qrOnlyAccess === false;
  }

  return (
    <VehicleContactClient
      initialAuthorized={isAuthorized}
      settings={{
        carModel: settings.carModel,
        licensePlate: settings.licensePlate,
        status: settings.status,
        statusText: settings.statusText,
        headline: settings.headline,
        greeting: settings.greeting,
        subGreeting: settings.subGreeting,
        bodyText: settings.bodyText,
        footerNote: settings.footerNote,
        footerBranding: settings.footerBranding,
        phoneEnabled: settings.phoneEnabled,
        phoneNumber: settings.phoneNumber,
        whatsAppEnabled: settings.whatsAppEnabled,
        whatsAppNumber: settings.whatsAppNumber,
        whatsAppMessage: settings.whatsAppMessage,
        kakaoTalkEnabled: settings.kakaoTalkEnabled,
        kakaoTalkUrl: settings.kakaoTalkUrl,
        vehicleImageUrl: settings.vehicleImageUrl,
        qrOnlyAccess: settings.qrOnlyAccess ?? true,
      }}
    />
  );
}
