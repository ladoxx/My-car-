'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, ChevronRight, Shield, Check, Copy, Lock, QrCode, Smartphone, EyeOff } from 'lucide-react';
import KiaRayVisual from '@/components/KiaRayVisual';
import { WhatsAppIcon } from '@/components/icons/ContactIcons';
import { CarOutlineIcon, HandshakeIcon } from '@/components/KiaRayBrand';

interface VehicleSettingsProps {
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
  qrOnlyAccess?: boolean;
}

export default function VehicleContactClient({
  settings,
  initialAuthorized = false,
}: {
  settings: VehicleSettingsProps;
  initialAuthorized?: boolean;
}) {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(initialAuthorized);

  // Check QR authorization on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const isQrScan = urlParams.get('src') === 'qr' || urlParams.get('qr') === '1';
    const hasSession = sessionStorage.getItem('fmkal_qr_authorized') === 'true';
    const isAdmin = document.cookie.includes('admin_session=');

    // If QR was scanned, memorize session
    if (isQrScan) {
      sessionStorage.setItem('fmkal_qr_authorized', 'true');
      document.cookie = 'fmkal_qr_authorized=true; path=/; max-age=86400; SameSite=Lax';
      setIsAuthorized(true);
    } else if (hasSession || isAdmin || settings.qrOnlyAccess === false) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }

    // Analytics tracking
    const source = isQrScan ? 'qr' : 'direct';
    const eventType = isQrScan ? 'qr_scan' : 'page_view';

    try {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventType, source }),
      }).catch(() => {});
    } catch {
      // Ignore network errors silently for visitors
    }
  }, [settings.qrOnlyAccess]);

  const trackClick = (channel: 'whatsapp' | 'kakaotalk' | 'phone') => {
    try {
      const eventName = `click_${channel}`;
      const urlParams = new URLSearchParams(window.location.search);
      const isQr = urlParams.get('src') === 'qr';
      const source = isQr ? 'qr' : 'direct';

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/track',
          JSON.stringify({ event: eventName, source })
        );
      } else {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: eventName, source }),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Fail silently
    }
  };

  // WhatsApp wa.me URL
  const cleanWhatsAppNumber = (settings.whatsAppNumber || '').replace(/[^0-9]/g, '');
  const whatsAppUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
    settings.whatsAppMessage || '안녕하세요. 차량 관련하여 연락드립니다.'
  )}`;

  // Phone tel: URL
  const cleanTelNumber = (settings.phoneNumber || '').replace(/[^0-9+]/g, '');
  const telUrl = `tel:${cleanTelNumber}`;

  const isAvailable = settings.status === 'available' || settings.status === 'quick_move';

  // Format heading with "연락" in neon green
  const renderHeadline = (text: string) => {
    if (!text.includes('연락')) {
      return <span>{text}</span>;
    }
    const parts = text.split('연락');
    return (
      <>
        <span>{parts[0]}</span>
        <span className="text-[#A3F542] drop-shadow-[0_0_15px_rgba(163,245,66,0.5)]">
          연락
        </span>
        <span>{parts[1]}</span>
      </>
    );
  };

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(settings.phoneNumber).then(() => {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2200);
    });
  };

  // 🔒 QR-Only Private Access Screen (when visitor did not scan the physical QR)
  if (isAuthorized === false && settings.qrOnlyAccess !== false) {
    return (
      <main className="min-h-screen bg-[#06080A] text-gray-100 flex flex-col justify-between items-center relative overflow-hidden px-4 py-8 select-none">
        {/* Subtle Ambient Light */}
        <div
          className="pointer-events-none absolute top-[-5%] left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full blur-[140px] opacity-25"
          style={{
            background: 'radial-gradient(circle, #A3F542 0%, #25D366 35%, transparent 75%)',
          }}
        />

        {/* Top Header */}
        <header className="w-full max-w-[420px] flex items-center justify-between z-10 px-1">
          <div className="flex items-center space-x-2.5">
            <CarOutlineIcon className="w-8 h-4 text-white/90" />
            <div className="flex items-baseline space-x-1.5">
              <span className="text-white font-extrabold text-base tracking-wider">KIA</span>
              <span className="text-white/40 text-xs font-light">|</span>
              <span
                className="text-[#A3F542] font-black italic tracking-wide text-xl font-serif drop-shadow-[0_0_12px_rgba(163,245,66,0.6)]"
                style={{
                  fontFamily: '"Brush Script MT", "Caveat", "Segoe Script", cursive, sans-serif',
                }}
              >
                Ray
              </span>
            </div>
          </div>

          <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-400 font-mono">
            <Lock className="w-3 h-3 text-[#A3F542]" />
            <span>비공개 페이지</span>
          </div>
        </header>

        {/* Central Lock Box */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[390px] my-auto flex flex-col items-center text-center z-10 py-4"
        >
          {/* Animated Glowing QR Scanner Graphic */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-3xl bg-black/60 border-2 border-[#A3F542]/60 p-4 flex items-center justify-center shadow-[0_0_40px_rgba(163,245,66,0.25)] relative">
              <span className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-[#A3F542]" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-[#A3F542]" />
              <span className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-[#A3F542]" />
              <span className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-[#A3F542]" />

              <div className="flex flex-col items-center justify-center space-y-1">
                <QrCode className="w-9 h-9 text-[#A3F542]" />
                <Lock className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Glowing Pulse Ring */}
            <div className="absolute inset-0 rounded-3xl border border-[#A3F542]/30 animate-ping pointer-events-none" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2.5">
            차량 실물 QR 코드를<br />
            <span className="text-[#A3F542] drop-shadow-[0_0_15px_rgba(163,245,66,0.5)]">
              직접 스캔
            </span>
            해 주세요
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-[320px] mb-6">
            본 페이지는 운전자 개인정보 보호를 위해 차량 앞 대시보드에 부착된 실물 QR 코드를 스마트폰 카메라로 직접 스캔하신 분만 열람하실 수 있습니다.
          </p>

          {/* Privacy Badges */}
          <div className="w-full space-y-2.5 mb-6 text-left">
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
              <EyeOff className="w-4 h-4 text-[#A3F542] shrink-0" />
              <span className="text-xs text-gray-300 font-medium">
                구글·네이버 등 검색 엔진 노출 차단 (No-Index)
              </span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
              <Smartphone className="w-4 h-4 text-[#A3F542] shrink-0" />
              <span className="text-xs text-gray-300 font-medium">
                카메라로 실물 QR 코드를 비추면 즉시 열립니다
              </span>
            </div>
          </div>

          {/* Quick 3-Step Guide */}
          <div className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 text-left space-y-2">
            <div className="text-[11px] font-bold text-[#A3F542] uppercase tracking-wider mb-1 font-mono">
              [ 접속 안내 / HOW TO ACCESS ]
            </div>
            <div className="text-xs text-gray-300 flex items-start space-x-2">
              <span className="text-[#A3F542] font-mono font-bold">1.</span>
              <span>스마트폰의 기본 카메라 앱을 실행합니다.</span>
            </div>
            <div className="text-xs text-gray-300 flex items-start space-x-2">
              <span className="text-[#A3F542] font-mono font-bold">2.</span>
              <span>차량 앞유리 대시보드에 놓인 QR 코드를 비춥니다.</span>
            </div>
            <div className="text-xs text-gray-300 flex items-start space-x-2">
              <span className="text-[#A3F542] font-mono font-bold">3.</span>
              <span>화면에 나타나는 노란색/초록색 알림 링크를 터치합니다.</span>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="w-full max-w-[420px] flex flex-col items-center text-center z-10 pt-4">
          <div className="flex items-center space-x-2 text-[10px] tracking-widest text-gray-500 uppercase font-mono">
            <span>FMKAL · VEHICLE CONTACT</span>
            <span>•</span>
            <a
              href="/admin"
              className="text-gray-400 hover:text-[#A3F542] transition-colors inline-flex items-center space-x-1"
              title="관리자 로그인"
            >
              <Shield className="w-3 h-3" />
              <span>관리자</span>
            </a>
          </div>
        </footer>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#06080A] text-gray-100 flex flex-col justify-between relative overflow-hidden px-4 py-5 sm:py-8 select-none">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full blur-[140px] opacity-35"
        style={{
          background: 'radial-gradient(circle, #A3F542 0%, #25D366 35%, transparent 75%)',
        }}
      />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] w-[380px] h-[380px] rounded-full blur-[150px] opacity-15 bg-emerald-500" />

      {/* Main Column */}
      <div className="w-full max-w-[420px] mx-auto flex-1 flex flex-col items-center z-10">
        
        {/* Top Header: Car Outline + KIA Ray Logo on Left | Live Status Badge on Right */}
        <header className="w-full flex items-center justify-between pt-1 pb-3 px-1">
          <div className="flex items-center space-x-2.5">
            <CarOutlineIcon className="w-9 h-5 text-white/90" />
            <div className="flex items-baseline space-x-1.5">
              <span className="text-white font-extrabold text-base tracking-wider font-sans">
                KIA
              </span>
              <span className="text-white/40 text-xs font-light">|</span>
              <span
                className="text-[#A3F542] font-black italic tracking-wide text-xl font-serif drop-shadow-[0_0_12px_rgba(163,245,66,0.6)]"
                style={{
                  fontFamily: '"Brush Script MT", "Caveat", "Segoe Script", cursive, sans-serif',
                  transform: 'skewX(-8deg)',
                }}
              >
                Ray
              </span>
            </div>
          </div>

          {/* Green Status Pill: ● 연락 가능 */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md shadow-md">
            <span className="relative flex h-2.5 w-2.5">
              {isAvailable && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A3F542] opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isAvailable ? 'bg-[#A3F542]' : 'bg-amber-400'
                }`}
              />
            </span>
            <span className="text-xs font-medium text-gray-200 tracking-tight">
              {settings.statusText || '연락 가능'}
            </span>
          </div>
        </header>

        {/* Hero Section: Kia Ray Vehicle Visual */}
        <section className="w-full flex flex-col items-center my-0.5" aria-label="차량 비주얼">
          <KiaRayVisual
            customImageUrl={settings.vehicleImageUrl}
            isAvailable={isAvailable}
          />
        </section>

        {/* Main Heading & Intro Text */}
        <section className="w-full flex flex-col items-center text-center mt-1 mb-5 px-2">
          {/* Main Title: 차량 연락 센터 */}
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2"
          >
            {renderHeadline(settings.headline || '차량 연락 센터')}
          </motion.h1>

          {/* Greeting: 안녕하세요! */}
          <p className="text-base sm:text-lg font-bold text-white mb-1">
            {settings.greeting || '안녕하세요!'}
          </p>

          {/* Sub-Greeting with Green Hairline Dividers */}
          <div className="w-full flex items-center justify-center space-x-3 my-1">
            <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#A3F542]/60" />
            <p className="text-sm sm:text-base font-semibold text-gray-200 tracking-tight">
              {settings.subGreeting || '차량 관련 문의가 있으신가요?'}
            </p>
            <span className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#A3F542]/60" />
          </div>

          {/* Body Text */}
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-[340px] leading-relaxed break-keep">
            {settings.bodyText ||
              '차량 이동이 필요하거나 긴급한 연락이 필요하시면 아래 방법으로 연락해 주세요.'}
          </p>
        </section>

        {/* The 3 Contact Buttons */}
        <section
          className="w-full flex flex-col space-y-3.5 px-1"
          aria-label="연락 수단 선택"
        >
          {/* 1. WhatsApp 문의하기 (Vibrant Green Gradient Pill) */}
          {settings.whatsAppEnabled && (
            <motion.a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick('whatsapp')}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="group relative flex items-center justify-between w-full h-[62px] px-5 rounded-full bg-gradient-to-r from-[#17BD54] via-[#25D366] to-[#12A748] text-white font-bold shadow-[0_8px_25px_rgba(37,211,102,0.4)] transition-all duration-200 cursor-pointer overflow-hidden"
            >
              <div className="flex items-center space-x-4 z-10">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-[#25D366] shadow-sm">
                  <WhatsAppIcon className="w-5 h-5 fill-current" />
                </div>
                <div className="w-[1px] h-6 bg-white/30" />
                <span className="text-base sm:text-lg font-bold tracking-tight text-white">
                  WhatsApp 문의하기
                </span>
              </div>
              <div className="z-10 text-white/90 group-hover:text-white group-hover:translate-x-1 transition-all duration-200">
                <ChevronRight className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.a>
          )}

          {/* 2. 카카오톡 문의하기 (Vibrant Yellow-Gold Gradient Pill) */}
          {settings.kakaoTalkEnabled && (
            <div>
              {settings.kakaoTalkUrl && settings.kakaoTalkUrl.trim() !== '' ? (
                <motion.a
                  href={settings.kakaoTalkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackClick('kakaotalk')}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className="group relative flex items-center justify-between w-full h-[62px] px-5 rounded-full bg-gradient-to-r from-[#FFD000] via-[#FEE500] to-[#E5BE00] text-[#191919] font-bold shadow-[0_8px_25px_rgba(254,229,0,0.35)] transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center space-x-4 z-10">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#191919] text-[#FEE500] shadow-sm">
                      <span className="text-[10px] font-black tracking-tighter">TALK</span>
                    </div>
                    <div className="w-[1px] h-6 bg-black/15" />
                    <span className="text-base sm:text-lg font-bold tracking-tight text-[#191919]">
                      카카오톡 문의하기
                    </span>
                  </div>
                  <div className="z-10 text-black/80 group-hover:text-black group-hover:translate-x-1 transition-all duration-200">
                    <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                  </div>
                </motion.a>
              ) : (
                <div className="relative flex items-center justify-between w-full h-[62px] px-5 rounded-full bg-zinc-900/70 border border-white/10 text-gray-500 opacity-60 cursor-not-allowed">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-800 text-gray-400">
                      <span className="text-[10px] font-bold">TALK</span>
                    </div>
                    <div className="w-[1px] h-6 bg-white/10" />
                    <span className="text-base font-semibold text-gray-400">
                      카카오톡 문의하기 (준비 중)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. 전화하기 (Sleek Obsidian Pill with Neon Green Border) */}
          {settings.phoneEnabled && (
            <div className="relative">
              <motion.a
                href={telUrl}
                onClick={() => trackClick('phone')}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="group relative flex items-center justify-between w-full h-[62px] px-5 rounded-full bg-[#0B0E13] border-2 border-[#A3F542] text-white font-bold shadow-[0_8px_25px_rgba(163,245,66,0.25)] transition-all duration-200 cursor-pointer overflow-hidden hover:bg-[#11161D]"
              >
                <div className="flex items-center space-x-4 z-10">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#A3F542]/15 text-[#A3F542]">
                    <Phone className="w-5 h-5 fill-current" />
                  </div>
                  <div className="w-[1px] h-6 bg-[#A3F542]/30" />
                  <div className="flex flex-col text-left">
                    <span className="text-base sm:text-lg font-bold tracking-tight text-white">
                      전화하기
                    </span>
                  </div>
                </div>

                <div className="z-10 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    aria-label="전화번호 복사"
                    title="전화번호 복사"
                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedPhone ? (
                      <Check className="w-4 h-4 text-[#A3F542]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <ChevronRight className="w-6 h-6 text-white stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.a>
              {copiedPhone && (
                <div className="absolute right-5 -bottom-5 text-[11px] text-[#A3F542] font-medium tracking-wide">
                  전화번호가 복사되었습니다.
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Footer Section */}
      <footer className="w-full max-w-[420px] mx-auto mt-8 pt-4 pb-1 flex flex-col items-center text-center z-10 relative">
        {/* Handshake Icon in Neon Green */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#A3F542] mb-1.5 drop-shadow-[0_0_8px_rgba(163,245,66,0.5)]">
          <HandshakeIcon className="w-6 h-6" />
        </div>

        {/* Footer Note */}
        <p className="text-xs sm:text-sm font-semibold text-gray-200 mb-1">
          {settings.footerNote || '빠른 연락에 감사드립니다.'}
        </p>

        {/* Branding & Admin Key */}
        <div className="flex items-center justify-center space-x-2 text-[10px] tracking-widest text-gray-400 uppercase font-mono">
          <span>{settings.footerBranding || 'FMKAL · VEHICLE CONTACT'}</span>
          <span>•</span>
          <a
            href="/admin"
            className="hover:text-gray-200 transition-colors p-0.5 inline-flex items-center opacity-40 hover:opacity-100"
            aria-label="관리자 로그인"
            title="관리자 설정"
          >
            <Shield className="w-3 h-3" />
          </a>
        </div>

        {/* Bottom Corner Racing Green Accent Stripes */}
        <div className="w-full flex justify-between items-end mt-3 px-2 opacity-60">
          <div className="flex space-x-1">
            <span className="w-4 h-1 bg-[#A3F542] skew-x-[-30deg]" />
            <span className="w-2 h-1 bg-[#A3F542]/50 skew-x-[-30deg]" />
          </div>
          <div className="flex space-x-1">
            <span className="w-2 h-1 bg-[#A3F542]/50 skew-x-[30deg]" />
            <span className="w-4 h-1 bg-[#A3F542] skew-x-[30deg]" />
          </div>
        </div>
      </footer>
    </main>
  );
}
