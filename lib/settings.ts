import { prisma } from './db';

export interface VehicleSettingsData {
  carModel: string;
  licensePlate: string;
  status: string;
  statusText: string;
  headline: string;
  greeting: string;
  subGreeting: string;
  bodyText: string;
  footerNote: string;
  footerBranding: string;
  phoneEnabled: boolean;
  phoneNumber: string;
  whatsAppEnabled: boolean;
  whatsAppNumber: string;
  whatsAppMessage: string;
  kakaoTalkEnabled: boolean;
  kakaoTalkUrl: string;
  vehicleImageUrl: string;
  baseUrl: string;
  qrOnlyAccess: boolean;
}

export const DEFAULT_SETTINGS: VehicleSettingsData = {
  carModel: '기아 레이 (Kia Ray)',
  licensePlate: 'FMKAL',
  status: 'available', // available | away | quick_move
  statusText: '연락 가능 · 통화 및 메시지 가능',
  headline: '차량 연락 센터',
  greeting: '안녕하세요!',
  subGreeting: '차량 관련 문의가 있으신가요?',
  bodyText: '차량 이동이 필요하거나 긴급한 연락이 필요하시면 아래 방법으로 연락해 주세요.',
  footerNote: '빠른 연락에 감사드립니다.',
  footerBranding: 'FMKAL · VEHICLE CONTACT',
  phoneEnabled: true,
  phoneNumber: '010-0000-0000',
  whatsAppEnabled: true,
  whatsAppNumber: '+821000000000',
  whatsAppMessage: '안녕하세요. 차량 관련하여 연락드립니다.',
  kakaoTalkEnabled: true,
  kakaoTalkUrl: '',
  vehicleImageUrl: '',
  baseUrl: 'https://car.fmkal.com',
  qrOnlyAccess: true,
};

export async function getVehicleSettings() {
  let settings = await prisma.vehicleContactSettings.findUnique({
    where: { id: 'default' },
  });

  if (!settings) {
    settings = await prisma.vehicleContactSettings.create({
      data: {
        id: 'default',
        ...DEFAULT_SETTINGS,
      },
    });
  }

  return settings;
}

export async function updateVehicleSettings(data: Partial<VehicleSettingsData>) {
  return prisma.vehicleContactSettings.upsert({
    where: { id: 'default' },
    update: data,
    create: {
      id: 'default',
      ...DEFAULT_SETTINGS,
      ...data,
    },
  });
}

export function parseDeviceType(ua?: string | null): string {
  if (!ua) return 'other';
  const ual = ua.toLowerCase();
  if (/iphone|ipad|ipod/.test(ual)) return 'ios';
  if (/android/.test(ual)) return 'android';
  if (/windows|macintosh|linux/.test(ual) && !/mobile/.test(ual)) return 'desktop';
  return 'other';
}

export async function recordAnalyticsEvent(
  type: 'page_view' | 'qr_scan' | 'click_whatsapp' | 'click_kakaotalk' | 'click_phone',
  source: 'qr' | 'direct' = 'direct',
  userAgent?: string | null
) {
  try {
    const deviceType = parseDeviceType(userAgent);
    await prisma.analyticsEvent.create({
      data: {
        type,
        source,
        deviceType,
      },
    });
  } catch (error) {
    console.error('Failed to record analytics event:', error);
  }
}

export async function getAnalyticsSummary() {
  const [
    totalVisits,
    qrVisits,
    whatsAppClicks,
    kakaoTalkClicks,
    phoneClicks,
    recentEvents,
  ] = await Promise.all([
    prisma.analyticsEvent.count({ where: { type: 'page_view' } }),
    prisma.analyticsEvent.count({ where: { type: 'qr_scan' } }),
    prisma.analyticsEvent.count({ where: { type: 'click_whatsapp' } }),
    prisma.analyticsEvent.count({ where: { type: 'click_kakaotalk' } }),
    prisma.analyticsEvent.count({ where: { type: 'click_phone' } }),
    prisma.analyticsEvent.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Aggregate by day for the last 14 days
  const now = new Date();
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(now.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const pastEvents = await prisma.analyticsEvent.findMany({
    where: {
      createdAt: { gte: fourteenDaysAgo },
    },
    select: {
      type: true,
      createdAt: true,
    },
  });

  const dailyMap: Record<string, { date: string; visits: number; qr: number; clicks: number }> = {};
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(5, 10); // MM-DD
    dailyMap[key] = { date: key, visits: 0, qr: 0, clicks: 0 };
  }

  for (const ev of pastEvents) {
    const key = ev.createdAt.toISOString().slice(5, 10);
    if (dailyMap[key]) {
      if (ev.type === 'page_view') dailyMap[key].visits++;
      else if (ev.type === 'qr_scan') {
        dailyMap[key].visits++;
        dailyMap[key].qr++;
      } else if (ev.type.startsWith('click_')) {
        dailyMap[key].clicks++;
      }
    }
  }

  return {
    totalVisits,
    qrVisits,
    totalClicks: whatsAppClicks + kakaoTalkClicks + phoneClicks,
    clicks: {
      whatsapp: whatsAppClicks,
      kakaotalk: kakaoTalkClicks,
      phone: phoneClicks,
    },
    daily: Object.values(dailyMap),
    recentEvents,
  };
}
