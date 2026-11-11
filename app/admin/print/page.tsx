'use client';

import React, { useState, useEffect } from 'react';
import { Printer, ArrowLeft, Loader2, Image as ImageIcon, Phone, ChevronRight } from 'lucide-react';
import { WhatsAppIcon, KakaoTalkIcon } from '@/components/icons/ContactIcons';
import { HandshakeIcon } from '@/components/KiaRayBrand';
import { generateAcrylicCardPng, generateHorizontalCardPng } from '@/lib/generateCardCanvas';

export default function AdminPrintPage() {
  const [settings, setSettings] = useState<any>(null);
  const [template, setTemplate] = useState<'acrylic' | 'horizontal'>('acrylic');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch((e) => console.error(e));
  }, []);

  const handleDownloadImage = async (overrideTemplate?: 'acrylic' | 'horizontal') => {
    if (!settings) return;
    const activeTpl = overrideTemplate || template;
    setDownloading(true);
    try {
      const qrRes = await fetch(
        `/api/admin/qr?format=json&size=600&ec=H&url=${encodeURIComponent(
          settings.baseUrl || 'https://car.fmkal.com'
        )}`
      );
      const qrJson = await qrRes.json();
      const qrDataUrl = qrJson.dataUrl;

      const carUrl = '/kia-ray-car-cut.jpg';
      const targetUrlText = (settings.baseUrl || 'https://car.fmkal.com').replace(/^https?:\/\//, '').replace(/\/+$/, '');

      const pngDataUrl = activeTpl === 'horizontal'
        ? await generateHorizontalCardPng(qrDataUrl, carUrl, targetUrlText)
        : await generateAcrylicCardPng(qrDataUrl, carUrl, targetUrlText);

      const link = document.createElement('a');
      link.download = `fmkal-kia-ray-card-template-${activeTpl === 'horizontal' ? '2-horizontal' : '1-acrylic'}.png`;
      link.href = pngDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to generate full card image', err);
      alert('Kart resmi oluşturulurken hata meydana geldi.');
    } finally {
      setDownloading(false);
    }
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-[#08090C] text-[#A3F542] flex items-center justify-center font-mono text-sm">
        KART YÜKLENİYOR...
      </div>
    );
  }

  const qrTargetUrl = (settings.baseUrl || 'https://car.fmkal.com').replace(/\/+$/, '');
  const cardDisplayUrl = (settings.baseUrl || 'https://car.fmkal.com').replace(/^https?:\/\//, '').replace(/\/+$/, '');

  return (
    <div className="min-h-screen bg-[#06080A] text-white flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print w-full max-w-[880px] mb-6 flex flex-col gap-4 p-5 rounded-2xl bg-[#12151C] border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a
            href="/admin"
            className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Yönetici Paneline Dön</span>
          </a>

          {/* Template Switcher Buttons */}
          <div className="flex items-center space-x-1.5 bg-black/50 p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setTemplate('acrylic')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                template === 'acrylic'
                  ? 'bg-[#A3F542] text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ✨ Şablon 1: Akrilik Stand
            </button>
            <button
              onClick={() => setTemplate('horizontal')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                template === 'horizontal'
                  ? 'bg-[#A3F542] text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🎴 Şablon 2: Yatay Mat Kart
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            {/* Direct In-System Canvas Download for Selected Template */}
            <button
              type="button"
              onClick={() => handleDownloadImage(template)}
              disabled={downloading}
              className="px-5 py-3 rounded-xl bg-[#A3F542] hover:bg-[#8ee42c] active:scale-95 text-black font-extrabold text-xs sm:text-sm flex items-center space-x-2 shadow-xl shadow-[#A3F542]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Kart Üretiliyor (1800×1125)...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 text-black" />
                  <span>
                    {template === 'horizontal'
                      ? 'Şablon 2’yi İndir (Sistem İçi PNG - 1800×1125)'
                      : 'Şablon 1’i İndir (Sistem İçi PNG - 1800×1125)'}
                  </span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 transition-colors cursor-pointer border border-white/15"
            >
              <Printer className="w-4 h-4 text-[#A3F542]" />
              <span>Yazdır (Print)</span>
            </button>
          </div>

          {/* Fast 1-Click Download for Both Templates */}
          <div className="flex items-center space-x-2 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => handleDownloadImage('acrylic')}
              disabled={downloading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              📥 Şablon 1 PNG
            </button>
            <button
              type="button"
              onClick={() => handleDownloadImage('horizontal')}
              disabled={downloading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              📥 Şablon 2 PNG
            </button>
          </div>
        </div>
      </div>

      {/* Card Display Area (isolated for print, spacious and responsive) */}
      <div className="print-card-wrapper w-full flex justify-center overflow-x-auto py-4 px-2">
        <div className="min-w-[720px] max-w-[880px] w-full">
          {/* Template 1: Acrylic Stand Card */}
          {template === 'acrylic' && (
            <div
              id="printable-acrylic-card"
              className="w-full bg-[#090C10] rounded-3xl border-2 border-white/20 p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative overflow-hidden flex flex-col justify-between text-white select-none print:m-0 print:border-none print:shadow-none min-h-[480px]"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#A3F542] to-transparent shadow-[0_0_12px_#A3F542]" />

              {/* Header Row */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center space-x-3">
                  <span className="font-black text-2xl tracking-wider text-white">KIA</span>
                  <span className="text-white/30 text-xl font-light">|</span>
                  <span
                    className="text-[#A3F542] font-black italic text-3xl font-serif drop-shadow-[0_0_10px_rgba(163,245,66,0.5)]"
                    style={{ fontFamily: '"Brush Script MT", "Caveat", cursive, sans-serif' }}
                  >
                    Ray
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-[#A3F542]/20 text-[#A3F542] flex items-center justify-center">
                      <span className="text-sm">💬</span>
                    </div>
                    <span className="text-2xl font-black tracking-tight text-white">
                      차량 연락 안내
                    </span>
                  </div>
                  <div className="text-right text-xs sm:text-sm text-gray-300 font-medium leading-tight">
                    차량과 관련하여 연락이 필요하신 경우<br />
                    QR 코드를 스캔하여 간편하게 연락해 주세요.
                  </div>
                </div>
              </div>

              {/* Center Content Row: QR on Left + Contact Buttons on Right (No car image) */}
              <div className="grid grid-cols-12 gap-8 items-center my-auto py-3">
                {/* Left: Large QR Code with Neon Green Frame */}
                <div className="col-span-5 flex flex-col items-center justify-center">
                  <div className="relative p-4 bg-white rounded-2xl shadow-[0_0_35px_rgba(163,245,66,0.35)] border-2 border-[#A3F542]">
                    <span className="absolute -top-2 -left-2 w-4 h-4 border-t-4 border-l-4 border-[#A3F542]" />
                    <span className="absolute -top-2 -right-2 w-4 h-4 border-t-4 border-r-4 border-[#A3F542]" />
                    <span className="absolute -bottom-2 -left-2 w-4 h-4 border-b-4 border-l-4 border-[#A3F542]" />
                    <span className="absolute -bottom-2 -right-2 w-4 h-4 border-b-4 border-r-4 border-[#A3F542]" />

                    <img
                      src={`/api/admin/qr?format=png&size=400&ec=H&url=${encodeURIComponent(
                        settings.baseUrl || 'https://car.fmkal.com'
                      )}`}
                      alt="Vehicle QR"
                      className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
                    />
                  </div>
                  <div className="flex items-center space-x-1.5 mt-3 text-xs font-bold text-[#A3F542]">
                    <span>[ ]</span>
                    <span>QR 코드를 스캔하여 간편하게 연락해 주세요.</span>
                  </div>
                </div>

                {/* Right: Quick Action Indicators */}
                <div className="col-span-7 flex flex-col space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-black/70 border border-white/15 text-sm font-bold shadow-lg">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md">
                        <WhatsAppIcon className="w-4 h-4 fill-current" />
                      </div>
                      <div>
                        <div className="text-white text-base">WhatsApp 문의</div>
                        <div className="text-xs text-gray-400 font-normal">빠르고 편리한 1:1 메시지 상담</div>
                      </div>
                    </div>
                    <span className="text-gray-400">›</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-black/70 border border-white/15 text-sm font-bold shadow-lg">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-8 h-8 rounded-full bg-[#FEE500] text-[#191919] flex items-center justify-center shadow-md">
                        <span className="text-[10px] font-black">TALK</span>
                      </div>
                      <div>
                        <div className="text-white text-base">카카오톡 문의</div>
                        <div className="text-xs text-gray-400 font-normal">카카오톡 채팅 상담 연결</div>
                      </div>
                    </div>
                    <span className="text-gray-400">›</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-black/70 border border-white/15 text-sm font-bold shadow-lg">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-8 h-8 rounded-full bg-[#A3F542]/20 text-[#A3F542] flex items-center justify-center shadow-md">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-white text-base">전화하기</div>
                        <div className="text-xs text-gray-400 font-normal">차주와 직접 통화 연결</div>
                      </div>
                    </div>
                    <span className="text-gray-400">›</span>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Row */}
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/10 text-xs">
                <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-200 font-mono">
                  <span className="text-[#A3F542]">🔗</span>
                  <span className="font-bold">{cardDisplayUrl}</span>
                </div>

                <div className="flex items-center space-x-2 text-gray-200">
                  <HandshakeIcon className="w-4 h-4 text-[#A3F542]" />
                  <span className="font-bold text-xs sm:text-sm">빠른 연락에 감사드립니다.</span>
                </div>
              </div>
            </div>
          )}

          {/* Template 2: Horizontal Matte Black Card (No car image) */}
          {template === 'horizontal' && (
            <div
              id="printable-horizontal-card"
              className="w-full bg-[#080A0D] rounded-3xl border-2 border-white/15 p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden flex flex-col justify-between text-white select-none print:m-0 print:border-none print:shadow-none min-h-[480px]"
            >
              <div className="absolute top-0 right-32 w-28 h-20 bg-[#A3F542]/10 -skew-x-12 blur-sm pointer-events-none" />

              <div className="grid grid-cols-12 gap-8 items-center my-auto">
                {/* Left Column: Heading + Intro */}
                <div className="col-span-7 space-y-3.5">
                  <div className="flex items-baseline space-x-2">
                    <span className="font-black text-xl tracking-wider text-white">KIA</span>
                    <span
                      className="text-[#A3F542] font-black italic text-2xl font-serif drop-shadow-[0_0_8px_rgba(163,245,66,0.5)]"
                      style={{ fontFamily: '"Brush Script MT", "Caveat", cursive, sans-serif' }}
                    >
                      Ray
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
                      VEHICLE CONTACT
                    </span>
                  </div>

                  <h2 className="text-3xl font-black tracking-tight text-white">
                    차량 <span className="text-[#A3F542] drop-shadow-[0_0_10px_rgba(163,245,66,0.4)]">연락</span> 센터
                  </h2>

                  <div className="text-xs sm:text-sm text-gray-300 space-y-1">
                    <p className="font-bold text-white">안녕하세요! 차량 관련 문의가 있으신가요?</p>
                    <p className="text-gray-400 leading-snug">
                      차량 이동이 필요하거나 긴급한 연락이 필요하시면 QR 코드를 스캔하거나 아래 방법으로 연락해 주세요.
                    </p>
                  </div>

                  <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 font-mono">
                    <span className="text-[#A3F542]">🔗</span>
                    <span>{cardDisplayUrl}</span>
                  </div>
                </div>

                {/* Right Column: Big High-Contrast QR Code */}
                <div className="col-span-5 flex flex-col items-center justify-center">
                  <div className="p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(163,245,66,0.3)] border-2 border-[#A3F542]">
                    <img
                      src={`/api/admin/qr?format=png&size=400&ec=H&url=${encodeURIComponent(
                        settings.baseUrl || 'https://car.fmkal.com'
                      )}`}
                      alt="Vehicle QR"
                      className="w-40 h-40 object-contain"
                    />
                  </div>
                  <div className="flex items-center space-x-1.5 mt-2.5 text-xs font-black text-[#A3F542]">
                    <span>[ ]</span>
                    <span>QR 코드를 스캔하여 연락해 주세요!</span>
                  </div>
                </div>
              </div>

              {/* Bottom Contact Pills (3 Channels) */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10 mt-4">
                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/15 flex items-center space-x-3 text-xs sm:text-sm font-bold shadow-md">
                  <div className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow">
                    <WhatsAppIcon className="w-4 h-4 fill-current" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-white">WhatsApp</div>
                    <div className="text-[10px] text-gray-400 font-normal">문의하기 →</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/15 flex items-center space-x-3 text-xs sm:text-sm font-bold shadow-md">
                  <div className="w-7 h-7 rounded-full bg-[#FEE500] text-[#191919] flex items-center justify-center shrink-0 shadow">
                    <span className="text-[8px] font-black">TALK</span>
                  </div>
                  <div className="leading-tight">
                    <div className="text-white">카카오톡</div>
                    <div className="text-[10px] text-gray-400 font-normal">문의하기 →</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/15 flex items-center space-x-3 text-xs sm:text-sm font-bold shadow-md">
                  <div className="w-7 h-7 rounded-full bg-[#A3F542]/20 text-[#A3F542] flex items-center justify-center shrink-0 shadow">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-white">전화하기</div>
                    <div className="text-[10px] text-gray-400 font-normal">바로 연결 →</div>
                  </div>
                </div>
              </div>

              {/* Card Bottom Meta */}
              <div className="flex items-center justify-between text-xs text-gray-400 font-mono tracking-wider pt-3">
                <span className="flex items-center space-x-1.5 text-gray-300">
                  <span>😊</span>
                  <span>빠른 연락에 감사드립니다.</span>
                </span>
                <span className="text-gray-500">FMKAL · VEHICLE CONTACT</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
