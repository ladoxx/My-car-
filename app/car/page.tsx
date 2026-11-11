import { cookies } from 'next/headers';
import { getVehicleSettings } from '@/lib/settings';
import VehicleContactClient from '@/components/VehicleContactClient';

export const dynamic = 'force-dynamic';

export default async function CarContactPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const cookieStore = await cookies();
  const settings = await getVehicleSettings();

  const isQr = resolvedParams.src === 'qr' || resolvedParams.qr === '1';
  const hasAuthCookie =
    cookieStore.get('fmkal_qr_authorized')?.value === 'true' ||
    cookieStore.has('admin_session');
  const isAuthorized = isQr || Boolean(hasAuthCookie) || settings.qrOnlyAccess === false;

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
