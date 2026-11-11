'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Settings,
  QrCode,
  FileText,
  Lock,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Printer,
  Smartphone,
  Eye,
  MessageSquare,
  Phone,
  RefreshCw,
  Globe,
  Car,
  ChevronRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Loader2,
  Upload,
  Check,
} from 'lucide-react';
import { WhatsAppIcon, KakaoTalkIcon } from '@/components/icons/ContactIcons';
import { CarOutlineIcon, HandshakeIcon } from '@/components/KiaRayBrand';
import { generateAcrylicCardPng, generateHorizontalCardPng } from '@/lib/generateCardCanvas';

interface AdminDashboardProps {
  user: { id: string; username: string };
  onLogout: () => void;
  lang: 'EN' | 'TR';
  setLang: (l: 'EN' | 'TR') => void;
}

export default function AdminDashboard({ user, onLogout, lang, setLang }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'settings' | 'content' | 'qr' | 'security'>('qr');
  const [cardTemplate, setCardTemplate] = useState<'acrylic' | 'horizontal'>('acrylic');
  
  // Data States
  const [settings, setSettings] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // QR preview state
  const [qrSize, setQrSize] = useState<number>(1024);
  const [qrEcLevel, setQrEcLevel] = useState<'M' | 'H'>('H');
  const [downloadingCard, setDownloadingCard] = useState(false);
  const [previewScale, setPreviewScale] = useState<'fit' | '100' | '125'>('100');
  const [showFullscreenModal, setShowFullscreenModal] = useState<boolean>(false);

  // Vehicle Image Upload & Presets
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const dict = {
    EN: {
      analytics: 'Analytics',
      settings: 'Vehicle & Contacts',
      content: 'Korean Content',
      qr: 'QR & Vehicle Card Studio',
      security: 'Security',
      logout: 'Logout',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      savedSuccessfully: 'Settings saved successfully!',
      totalVisits: 'Total Visits',
      qrVisits: 'QR Code Scans',
      totalClicks: 'Contact Clicks',
      whatsAppClicks: 'WhatsApp Clicks',
      kakaoClicks: 'KakaoTalk Clicks',
      phoneClicks: 'Phone Calls',
      recentActivity: 'Recent Activity Feed',
      last14Days: 'Visits & Clicks (Last 14 Days)',
      noEvents: 'No activity recorded yet.',
      phoneSettings: 'Phone Call Settings',
      whatsAppSettings: 'WhatsApp Settings',
      kakaoSettings: 'KakaoTalk Settings',
      enable: 'Enabled',
      disable: 'Disabled',
      vehicleModel: 'Vehicle Model',
      licensePlate: 'Vehicle ID / Plate Badge',
      availability: 'Availability Status',
      available: '연락 가능 (Available)',
      away: '부재중 (Away)',
      quickMove: '이동 주차 가능 (Quick Move Available)',
      customStatusText: 'Status Badge Text (Korean)',
      phoneNum: 'Phone Number',
      whatsAppNum: 'WhatsApp Number (Intl format)',
      whatsAppMsg: 'Predefined WhatsApp Message (Korean)',
      kakaoUrl: 'KakaoTalk Chat URL',
      kakaoWarning: 'If empty, KakaoTalk button will be hidden/disabled.',
      vehicleImg: 'Custom Vehicle Image URL (Optional)',
      baseUrl: 'Base Domain for Permanent QR (e.g. https://your-domain.com)',
      downloadPng: 'Download High-Res PNG (2048px)',
      downloadSvg: 'Download Scalable SVG',
      printCard: 'Print In-Car Dashboard Card',
      downloadCardImage: 'Download Complete Card (PNG)',
      downloadingCardLabel: 'Generating Card Image...',
      onlyQr: 'Only QR Code:',
      cardTemplateAcrylic: 'Template 1: Acrylic Stand Card',
      cardTemplateHorizontal: 'Template 2: Horizontal Matte Card',
      changePwd: 'Change Password',
      currPwd: 'Current Password',
      newPwd: 'New Password',
      confirmPwd: 'Confirm New Password',
      pwdBtn: 'Update Password',
      livePreview: 'Open Live Contact Page',
    },
    TR: {
      analytics: 'İstatistikler',
      settings: 'Araç & İletişim',
      content: 'Korece Metinler',
      qr: 'QR & Araç Kartı Stüdyosu',
      security: 'Güvenlik',
      logout: 'Çıkış Yap',
      saveChanges: 'Değişiklikleri Kaydet',
      saving: 'Kaydediliyor...',
      savedSuccessfully: 'Ayarlar başarıyla kaydedildi!',
      totalVisits: 'Toplam Ziyaret',
      qrVisits: 'QR Kod Taraması',
      totalClicks: 'İletişim Tıklamaları',
      whatsAppClicks: 'WhatsApp Tıklamaları',
      kakaoClicks: 'KakaoTalk Tıklamaları',
      phoneClicks: 'Telefon Aramaları',
      recentActivity: 'Son Etkinlik Akışı',
      last14Days: 'Son 14 Günlük Ziyaret & Tıklama Grafiği',
      noEvents: 'Henüz kayıtlı etkinlik bulunmuyor.',
      phoneSettings: 'Telefon Arama Ayarları',
      whatsAppSettings: 'WhatsApp Ayarları',
      kakaoSettings: 'KakaoTalk Ayarları',
      enable: 'Aktif',
      disable: 'Pasif',
      vehicleModel: 'Araç Modeli',
      licensePlate: 'Araç Plaka / Kimlik',
      availability: 'Durum Bilgisi',
      available: '연락 가능 (Ulaşılabilir)',
      away: '부재중 (Müsait Değil)',
      quickMove: '이동 주차 가능 (Hemen Çekilebilir)',
      customStatusText: 'Durum Etiketi Metni (Korece)',
      phoneNum: 'Telefon Numarası',
      whatsAppNum: 'WhatsApp Numarası (Uluslararası format)',
      whatsAppMsg: 'Hazır WhatsApp Mesajı (Korece)',
      kakaoUrl: 'KakaoTalk Sohbet URL Adresi',
      kakaoWarning: 'Boş bırakılırsa sayfada buton pasif/gizli görünür.',
      vehicleImg: 'Özel Araç Görseli URL (İsteğe bağlı)',
      baseUrl: 'Kalıcı QR İçin Ana Alan Adı (Örn: https://your-domain.com)',
      downloadPng: 'Yüksek Çözünürlüklü PNG İndir (2048px)',
      downloadSvg: 'Vektörel SVG İndir',
      printCard: 'Araç İçi Kartını Yazdır',
      downloadCardImage: 'Tam Araç Kartını İndir (Resim / PNG)',
      downloadingCardLabel: 'Kart Görseli Hazırlanıyor...',
      onlyQr: 'Yalnızca QR Kodu:',
      cardTemplateAcrylic: 'Şablon 1: Akrilik Ayaklı Stand Kartı',
      cardTemplateHorizontal: 'Şablon 2: Yatay Mat Siyah Kart',
      changePwd: 'Şifre Değiştir',
      currPwd: 'Mevcut Şifre',
      newPwd: 'Yeni Şifre',
      confirmPwd: 'Yeni Şifre (Tekrar)',
      pwdBtn: 'Şifreyi Güncelle',
      livePreview: 'Canlı Sayfayı Aç',
    },
  }[lang];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSettings, resAnalytics] = await Promise.all([
        fetch('/api/admin/settings'),
        fetch('/api/admin/analytics'),
      ]);

      if (resSettings.ok) {
        const sData = await resSettings.json();
        setSettings(sData);
      }
      if (resAnalytics.ok) {
        const aData = await resAnalytics.json();
        setAnalytics(aData);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save');
      }

      const updated = await res.json();
      setSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage(null);

    if (newPassword !== confirmPassword) {
      setPwdMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setPwdLoading(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPwdMessage({ type: 'success', text: 'Password successfully changed!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdMessage({ type: 'error', text: err.message || 'Password update failed' });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDownloadFullCard = async (overrideTemplate?: 'acrylic' | 'horizontal') => {
    const activeTpl = overrideTemplate || cardTemplate;
    setDownloadingCard(true);
    try {
      const qrRes = await fetch(`/api/admin/qr?format=json&size=600&ec=H&url=${encodeURIComponent(
        settings?.baseUrl || 'https://car.fmkal.com'
      )}`);
      const qrJson = await qrRes.json();
      const qrDataUrl = qrJson.dataUrl;

      const carUrl = '/kia-ray-car-cut.jpg';
      const targetUrlText = (settings?.baseUrl || 'https://car.fmkal.com').replace(/^https?:\/\//, '').replace(/\/+$/, '');

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
      setDownloadingCard(false);
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Resim yüklenemedi');
      }

      setSettings({ ...settings, vehicleImageUrl: data.url });
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err: any) {
      setUploadError(err.message || 'Yükleme sırasında hata oluştu');
    } finally {
      setUploadingImage(false);
    }
  };

  const vehiclePresets = [
    {
      id: 'white',
      name: lang === 'TR' ? 'Klasik Beyaz Ray' : 'Classic White Ray',
      desc: lang === 'TR' ? 'Orijinal beyaz kesim' : 'Original white cutout',
      url: '/kia-ray-car-cut.jpg',
    },
    {
      id: 'dark',
      name: lang === 'TR' ? 'Hayalet Siyah Ray' : 'Phantom Black Ray',
      desc: lang === 'TR' ? 'Karanlık mat gece silueti' : 'Stealth dark silhouette',
      url: '/presets/kia-ray-dark.svg',
    },
    {
      id: 'cyber',
      name: lang === 'TR' ? 'Siber Neon Ray' : 'Cyber Neon Ray',
      desc: lang === 'TR' ? 'Neon yeşil fütüristik hatlar' : 'Futuristic neon lines',
      url: '/presets/kia-ray-cyber.svg',
    },
    {
      id: 'silver',
      name: lang === 'TR' ? 'Titanyum Gümüş Ray' : 'Titanium Silver Ray',
      desc: lang === 'TR' ? 'Metalik gümüş gövde' : 'Metallic silver body',
      url: '/presets/kia-ray-silver.svg',
    },
    {
      id: 'hero',
      name: lang === 'TR' ? 'Sinematik Gece Şehir' : 'Cinematic City Night',
      desc: lang === 'TR' ? 'Şehir caddesi & araç' : 'City street & car',
      url: '/kia-ray-hero.jpg',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090C] flex items-center justify-center text-[#A3F542]">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="text-sm font-mono tracking-wider">LOADING ADMIN PORTAL...</span>
        </div>
      </div>
    );
  }

  const qrTargetUrl = (settings?.baseUrl || 'https://car.fmkal.com').replace(/\/+$/, '');
  const cardDisplayUrl = (settings?.baseUrl || 'https://car.fmkal.com').replace(/^https?:\/\//, '').replace(/\/+$/, '');

  return (
    <div className="min-h-screen bg-[#08090C] text-gray-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0E1117]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#A3F542]/20 border border-[#A3F542]/40 flex items-center justify-center text-[#A3F542] font-bold text-sm">
            FM
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm sm:text-base text-white tracking-tight">
                FMKAL · Vehicle Contact Admin
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#A3F542]/10 border border-[#A3F542]/30 text-[#A3F542] font-mono">
                KIA RAY
              </span>
            </div>
            <p className="text-[11px] text-gray-500 hidden sm:block">
              Logged in as <span className="text-gray-300 font-mono">{user.username}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Live Preview Button */}
          <a
            href="/car"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#A3F542]" />
            <span className="hidden sm:inline">{dict.livePreview}</span>
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </a>

          {/* Language Toggle */}
          <div className="flex items-center rounded-xl bg-black/40 border border-white/10 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setLang('EN')}
              className={`px-2 py-1 rounded-lg transition-colors ${
                lang === 'EN' ? 'bg-[#A3F542] text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('TR')}
              className={`px-2 py-1 rounded-lg transition-colors ${
                lang === 'TR' ? 'bg-[#A3F542] text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              TR
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{dict.logout}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-3">
          {[
            { id: 'qr', label: dict.qr, icon: QrCode },
            { id: 'analytics', label: dict.analytics, icon: BarChart3 },
            { id: 'settings', label: dict.settings, icon: Settings },
            { id: 'content', label: dict.content, icon: FileText },
            { id: 'security', label: dict.security, icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#A3F542] text-black shadow-lg shadow-[#A3F542]/20'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Status Alerts */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-3 text-emerald-400 text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{dict.savedSuccessfully}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center space-x-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: QR & VEHICLE CARD STUDIO */}
        {activeTab === 'qr' && settings && (
          <div className="space-y-6">
            {/* Template Selector & Action Toolbar */}
            <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#12151C] border border-white/10">
              {/* Row 1: Template Switcher & Quick Status */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    {lang === 'TR' ? 'Tasarım Şablonu:' : 'Design Template:'}
                  </span>
                  <div className="flex items-center space-x-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setCardTemplate('acrylic')}
                      className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                        cardTemplate === 'acrylic'
                          ? 'bg-[#A3F542] text-black shadow-lg shadow-[#A3F542]/20'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>✨</span>
                      <span>{dict.cardTemplateAcrylic}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardTemplate('horizontal')}
                      className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                        cardTemplate === 'horizontal'
                          ? 'bg-[#A3F542] text-black shadow-lg shadow-[#A3F542]/20'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>🎴</span>
                      <span>{dict.cardTemplateHorizontal}</span>
                    </button>
                  </div>
                </div>

                {/* View Scale Controls & Fullscreen Trigger */}
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
                    {lang === 'TR' ? 'Önizleme Boyutu:' : 'Preview Size:'}
                  </span>
                  <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-lg border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setPreviewScale('fit')}
                      className={`px-2.5 py-1 rounded font-bold transition-colors cursor-pointer ${
                        previewScale === 'fit' ? 'bg-[#A3F542] text-black' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {lang === 'TR' ? 'Sığdır' : 'Fit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewScale('100')}
                      className={`px-2.5 py-1 rounded font-bold transition-colors cursor-pointer ${
                        previewScale === '100' ? 'bg-[#A3F542] text-black' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      %100
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewScale('125')}
                      className={`px-2.5 py-1 rounded font-bold transition-colors cursor-pointer ${
                        previewScale === '125' ? 'bg-[#A3F542] text-black' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      %125
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowFullscreenModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#A3F542] text-xs font-bold flex items-center space-x-1.5 border border-white/15 cursor-pointer transition-colors"
                    title="Tam Ekran Büyüt"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{lang === 'TR' ? 'Büyüt' : 'Fullscreen'}</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Action Buttons (In-System PNG Generation, Print, QR) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Primary Download: Triggers In-System Canvas Generation for Active Template */}
                  <button
                    type="button"
                    onClick={() => handleDownloadFullCard(cardTemplate)}
                    disabled={downloadingCard}
                    className="px-5 py-3 rounded-xl bg-[#A3F542] hover:bg-[#8ee42c] active:scale-95 text-black font-black text-xs sm:text-sm flex items-center space-x-2 shadow-xl shadow-[#A3F542]/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {downloadingCard ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>{dict.downloadingCardLabel}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-black" />
                        <span>
                          {cardTemplate === 'horizontal'
                            ? (lang === 'TR' ? 'Şablon 2’yi İndir (Sistem İçi PNG - 1800×1125)' : 'Download Template 2 (In-System PNG)')
                            : (lang === 'TR' ? 'Şablon 1’i İndir (Sistem İçi PNG - 1800×1125)' : 'Download Template 1 (In-System PNG)')}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Print Button */}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 transition-colors cursor-pointer border border-white/15"
                  >
                    <Printer className="w-4 h-4 text-[#A3F542]" />
                    <span>{dict.printCard}</span>
                  </button>
                </div>

                {/* Direct 1-Click Template Downloads & Raw QR */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center space-x-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => handleDownloadFullCard('acrylic')}
                      disabled={downloadingCard}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer"
                      title="Şablon 1 PNG İndir"
                    >
                      📥 Şablon 1 PNG
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadFullCard('horizontal')}
                      disabled={downloadingCard}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer"
                      title="Şablon 2 PNG İndir"
                    >
                      📥 Şablon 2 PNG
                    </button>
                  </div>

                  <div className="flex items-center space-x-1 pl-1 border-l border-white/10">
                    <a
                      href={`/api/admin/qr?format=png&size=2048&download=true&ec=H&url=${encodeURIComponent(
                        settings.baseUrl || 'https://car.fmkal.com'
                      )}`}
                      className="px-2.5 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-gray-300 font-mono text-[11px] border border-white/10"
                      title="Ham QR PNG (2048px)"
                    >
                      QR PNG
                    </a>
                    <a
                      href={`/api/admin/qr?format=svg&download=true&ec=H&url=${encodeURIComponent(
                        settings.baseUrl || 'https://car.fmkal.com'
                      )}`}
                      className="px-2.5 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-gray-300 font-mono text-[11px] border border-white/10"
                      title="Ham QR SVG Vektör"
                    >
                      QR SVG
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE CARD PREVIEW (GENEROUS, RESPONSIVE, CRISP DISPLAY) */}
            <div className="w-full bg-[#0B0D12] rounded-3xl p-4 sm:p-7 border border-white/10 flex flex-col items-center">
              <div className="w-full flex items-center justify-between text-xs text-gray-400 mb-3 px-1">
                <span className="font-semibold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#A3F542] animate-pulse" />
                  <span>
                    {cardTemplate === 'acrylic'
                      ? (lang === 'TR' ? 'Canlı Önizleme: Şablon 1 (Akrilik Ayaklı Stand Kartı)' : 'Live Preview: Template 1 (Acrylic Stand)')
                      : (lang === 'TR' ? 'Canlı Önizleme: Şablon 2 (Yatay Mat Siyah Kart)' : 'Live Preview: Template 2 (Horizontal Matte)')}
                  </span>
                </span>
                <span className="text-[11px] text-gray-500 font-mono hidden md:inline">
                  {lang === 'TR' ? 'Yazdır veya İndir seçeneği tam 1800×1125 piksel üretir' : 'Print & Download output is 1800×1125 px'}
                </span>
              </div>

              {/* Scrollable Container so the card is never squished on phones */}
              <div className="w-full overflow-x-auto flex justify-center py-2 px-1 scrollbar-thin scrollbar-thumb-white/20">
                <div
                  style={{
                    transform: previewScale === '125' ? 'scale(1.15)' : 'none',
                    transformOrigin: 'top center',
                    transition: 'transform 0.2s ease',
                  }}
                  className={previewScale === 'fit' ? 'w-full max-w-[880px]' : 'min-w-[720px] max-w-[880px] w-full'}
                >
                  {/* Template 1: Acrylic Stand Card (matches user uploaded image 1) */}
                  {cardTemplate === 'acrylic' && (
                    <div
                      id="printable-acrylic-card"
                      className="w-full bg-[#090C10] rounded-3xl border-2 border-white/20 p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col justify-between text-white select-none print:m-0 print:border-none print:shadow-none min-h-[460px]"
                    >
                      {/* Top Neon Accent Line */}
                      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#A3F542] to-transparent shadow-[0_0_12px_#A3F542]" />

                      {/* Top Header Row */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="font-black text-2xl tracking-wider text-white">KIA</span>
                          <span className="text-white/30 text-xl font-light">|</span>
                          <span
                            className="text-[#A3F542] font-black italic text-3xl font-serif drop-shadow-[0_0_10px_rgba(163,245,66,0.6)]"
                            style={{ fontFamily: '"Brush Script MT", "Caveat", cursive, sans-serif' }}
                          >
                            Ray
                          </span>
                        </div>

                        <div className="flex flex-col items-end">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="w-8 h-8 rounded-full bg-[#A3F542]/20 text-[#A3F542] flex items-center justify-center">
                              <MessageSquare className="w-4 h-4 fill-current" />
                            </div>
                            <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                              차량 연락 안내
                            </span>
                          </div>
                          <div className="text-right text-xs sm:text-sm text-gray-300 font-medium leading-tight">
                            차량과 관련하여 연락이 필요하신 경우<br />
                            QR 코드를 스캔하여 간편하게 연락해 주세요.
                          </div>
                        </div>
                      </div>

                      {/* Center Content: QR on Left + Contact Actions on Right (No car image) */}
                      <div className="grid grid-cols-12 gap-8 items-center my-auto py-3">
                        {/* Left: Large High-Resolution QR Code */}
                        <div className="col-span-5 flex flex-col items-center justify-center">
                          <div className="relative p-4 bg-white rounded-2xl shadow-[0_0_35px_rgba(163,245,66,0.35)] border-2 border-[#A3F542]">
                            {/* Neon Corner Brackets */}
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

                        {/* Right: 3 Stacked Contact Pill Buttons (Spacious & Clean) */}
                        <div className="col-span-7 flex flex-col space-y-3">
                          <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-black/70 border border-white/15 text-sm font-bold shadow-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md">
                                <WhatsAppIcon className="w-4 h-4 fill-current" />
                              </div>
                              <div>
                                <div className="text-white">WhatsApp 문의</div>
                                <div className="text-[11px] text-gray-400 font-normal">빠르고 편리한 1:1 메시지 상담</div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>

                          <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-black/70 border border-white/15 text-sm font-bold shadow-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-[#FEE500] text-[#191919] flex items-center justify-center shrink-0 shadow-md">
                                <span className="text-[9px] font-black">TALK</span>
                              </div>
                              <div>
                                <div className="text-white">카카오톡 문의</div>
                                <div className="text-[11px] text-gray-400 font-normal">카카오톡 채팅 상담 연결</div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>

                          <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-black/70 border border-white/15 text-sm font-bold shadow-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-[#A3F542]/20 text-[#A3F542] flex items-center justify-center shrink-0 shadow-md">
                                <Phone className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-white">전화하기</div>
                                <div className="text-[11px] text-gray-400 font-normal">차주와 직접 통화 연결</div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {/* Bottom Footer Row */}
                      <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/10 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-200 font-mono">
                            <LinkIcon className="w-3.5 h-3.5 text-[#A3F542]" />
                            <span className="font-bold">{cardDisplayUrl}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#A3F542]/10 border border-[#A3F542]/30 text-white font-mono">
                            <span>🌐</span>
                            <span className="font-bold text-[#A3F542]">fmkal.com</span>
                            <span className="text-[10px] text-gray-400 font-sans font-medium">(공식 웹)</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 text-gray-200">
                          <HandshakeIcon className="w-4 h-4 text-[#A3F542]" />
                          <span className="font-bold text-xs sm:text-sm">빠른 연락에 감사드립니다.</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Template 2: Horizontal Matte Black Card (matches user uploaded image 2, no car image) */}
                  {cardTemplate === 'horizontal' && (
                    <div
                      id="printable-horizontal-card"
                      className="w-full bg-[#080A0D] rounded-3xl border-2 border-white/15 p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.85)] relative overflow-hidden flex flex-col justify-between text-white select-none print:m-0 print:border-none print:shadow-none min-h-[460px]"
                    >
                      {/* Top Speed Diagonal Accent */}
                      <div className="absolute top-0 right-32 w-28 h-20 bg-[#A3F542]/10 -skew-x-12 blur-sm pointer-events-none" />

                      <div className="grid grid-cols-12 gap-6 items-center my-auto">
                        {/* Left Column: Heading + Intro Copy */}
                        <div className="col-span-7 space-y-3">
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

                          <div className="flex flex-col space-y-1.5 pt-0.5">
                            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 font-mono w-fit">
                              <LinkIcon className="w-3.5 h-3.5 text-[#A3F542]" />
                              <span>{cardDisplayUrl}</span>
                            </div>
                            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#A3F542]/10 border border-[#A3F542]/30 text-xs text-white font-mono w-fit">
                              <span>🌐</span>
                              <span className="font-bold text-[#A3F542]">fmkal.com</span>
                              <span className="text-[10px] text-gray-400 font-sans font-medium">공식 사이트</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Big High-Contrast QR Code */}
                        <div className="col-span-5 flex flex-col items-center justify-center">
                          <div className="p-3.5 bg-white rounded-2xl shadow-[0_0_30px_rgba(163,245,66,0.3)] border-2 border-[#A3F542]">
                            <img
                              src={`/api/admin/qr?format=png&size=400&ec=H&url=${encodeURIComponent(
                                settings.baseUrl || 'https://car.fmkal.com'
                              )}`}
                              alt="Vehicle QR"
                              className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
                            />
                          </div>
                          <div className="flex items-center space-x-1.5 mt-2.5 text-xs font-black text-[#A3F542]">
                            <span>[ ]</span>
                            <span>QR 코드를 스캔하여 연락해 주세요!</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Contact Pills (3 Channels Horizontal) */}
                      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10 mt-4">
                        <div className="p-3 rounded-2xl bg-black/60 border border-white/15 flex items-center space-x-3 text-xs sm:text-sm font-bold shadow-md">
                          <div className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow">
                            <WhatsAppIcon className="w-4 h-4 fill-current" />
                          </div>
                          <div className="leading-tight">
                            <div className="text-white">WhatsApp</div>
                            <div className="text-[10px] text-gray-400 font-normal">문의하기 →</div>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-black/60 border border-white/15 flex items-center space-x-3 text-xs sm:text-sm font-bold shadow-md">
                          <div className="w-7 h-7 rounded-full bg-[#FEE500] text-[#191919] flex items-center justify-center shrink-0 shadow">
                            <span className="text-[8px] font-black">TALK</span>
                          </div>
                          <div className="leading-tight">
                            <div className="text-white">카카오톡</div>
                            <div className="text-[10px] text-gray-400 font-normal">문의하기 →</div>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-black/60 border border-white/15 flex items-center space-x-3 text-xs sm:text-sm font-bold shadow-md">
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
          </div>
        )}

        {/* TAB 2: ANALYTICS */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#12151C] border border-white/10">
                <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                  <span>{dict.totalVisits}</span>
                  <Smartphone className="w-4 h-4 text-[#A3F542]" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {analytics.totalVisits}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#12151C] border border-white/10">
                <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                  <span>{dict.qrVisits}</span>
                  <QrCode className="w-4 h-4 text-[#A3F542]" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#A3F542]">
                  {analytics.qrVisits}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#12151C] border border-white/10">
                <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                  <span>{dict.totalClicks}</span>
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {analytics.totalClicks}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#12151C] border border-white/10">
                <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                  <span>Conversion Rate</span>
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">
                  {analytics.totalVisits > 0
                    ? `${Math.round((analytics.totalClicks / analytics.totalVisits) * 100)}%`
                    : '0%'}
                </div>
              </div>
            </div>

            {/* Channel Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center">
                    <WhatsAppIcon className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="text-xs text-emerald-200 font-semibold">{dict.whatsAppClicks}</div>
                    <div className="text-xl font-bold text-white">{analytics.clicks.whatsapp}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FEE500]/10 border border-[#FEE500]/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FEE500] text-[#191919] flex items-center justify-center">
                    <KakaoTalkIcon className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="text-xs text-yellow-200 font-semibold">{dict.kakaoClicks}</div>
                    <div className="text-xl font-bold text-white">{analytics.clicks.kakaotalk}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#A3F542]/10 border border-[#A3F542]/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#A3F542] text-black flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-[#A3F542] font-semibold">{dict.phoneClicks}</div>
                    <div className="text-xl font-bold text-white">{analytics.clicks.phone}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 14-Day Activity Bar Chart */}
            <div className="p-6 rounded-3xl bg-[#12151C] border border-white/10">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-[#A3F542]" />
                <span>{dict.last14Days}</span>
              </h3>

              <div className="flex items-end justify-between h-44 pt-4 gap-2 border-b border-white/10 pb-2">
                {analytics.daily.map((day: any) => {
                  const max = Math.max(1, ...analytics.daily.map((d: any) => d.visits + d.clicks));
                  const visitHeight = Math.min(100, Math.round((day.visits / max) * 100));
                  const clickHeight = Math.min(100, Math.round((day.clicks / max) * 100));

                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-20 border border-white/10">
                        {day.date}: {day.visits} visits, {day.clicks} clicks
                      </div>
                      <div className="w-full flex items-end justify-center space-x-1 h-32">
                        <div
                          style={{ height: `${Math.max(4, visitHeight)}%` }}
                          className="w-1/2 bg-[#A3F542] rounded-t-sm transition-all"
                        />
                        <div
                          style={{ height: `${Math.max(4, clickHeight)}%` }}
                          className="w-1/2 bg-[#25D366] rounded-t-sm transition-all"
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 mt-2 font-mono">{day.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS (Vehicle & Contacts) */}
        {activeTab === 'settings' && settings && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#12151C] border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Car className="w-4 h-4 text-[#A3F542]" />
                <span>Vehicle Profile & Live Status</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                    {dict.vehicleModel}
                  </label>
                  <input
                    type="text"
                    value={settings.carModel || ''}
                    onChange={(e) => setSettings({ ...settings, carModel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:border-[#A3F542] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                    {dict.licensePlate}
                  </label>
                  <input
                    type="text"
                    value={settings.licensePlate || ''}
                    onChange={(e) => setSettings({ ...settings, licensePlate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:border-[#A3F542] outline-none"
                  />
                </div>
              </div>

              {/* Status Radio options */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-400 mb-2">
                  {dict.availability}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'available', label: dict.available, dot: 'bg-[#A3F542]' },
                    { id: 'away', label: dict.away, dot: 'bg-amber-400' },
                    { id: 'quick_move', label: dict.quickMove, dot: 'bg-emerald-400' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSettings({ ...settings, status: s.id })}
                      className={`p-3 rounded-xl border flex items-center space-x-2.5 text-xs font-semibold transition-all cursor-pointer ${
                        settings.status === s.id
                          ? 'bg-[#A3F542]/10 border-[#A3F542] text-white'
                          : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {dict.customStatusText}
                </label>
                <input
                  type="text"
                  value={settings.statusText || ''}
                  onChange={(e) => setSettings({ ...settings, statusText: e.target.value })}
                  placeholder="예: 연락 가능"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:border-[#A3F542] outline-none"
                />
              </div>

              {/* VEHICLE IMAGE STUDIO: PRESETS + CUSTOM UPLOAD + ALWAYS CENTERED GUARANTEE */}
              <div className="pt-3 border-t border-white/10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <ImageIcon className="w-4 h-4 text-[#A3F542]" />
                      <span>{lang === 'TR' ? 'Araç Sayfası Görseli (Hero Visual)' : 'Vehicle Page Visual'}</span>
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {lang === 'TR'
                        ? 'Kullanıcıların /car sayfasında göreceği araç görselini seçin veya kendi aracınızın fotoğrafını yükleyin.'
                        : 'Select a preset or upload your vehicle photo to display on the /car page.'}
                    </p>
                  </div>

                  {settings.vehicleImageUrl && (
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, vehicleImageUrl: '' })}
                      className="text-xs text-gray-400 hover:text-white underline cursor-pointer"
                    >
                      {lang === 'TR' ? 'Varsayılana Sıfırla' : 'Reset to Default'}
                    </button>
                  )}
                </div>

                {/* 1. Live Preview of Active Vehicle Image */}
                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col items-center">
                  <div className="text-[11px] text-gray-400 font-medium mb-2 flex items-center space-x-1.5 self-start">
                    <span className="w-2 h-2 rounded-full bg-[#A3F542]" />
                    <span>{lang === 'TR' ? 'Şu Anki Canlı Araç Görünümü (Tam Ortalanmış):' : 'Current Active Visual (Guaranteed Centered):'}</span>
                  </div>

                  <div className="w-full max-w-[340px] h-[190px] sm:h-[220px] rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 flex items-center justify-center p-3 relative overflow-hidden shadow-inner">
                    <img
                      src={settings.vehicleImageUrl || '/kia-ray-car-cut.jpg'}
                      alt="Active Vehicle Visual"
                      className="max-w-full max-h-full w-auto h-auto object-contain object-center drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)] transition-all mx-auto my-auto"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#06080A] to-transparent pointer-events-none" />
                  </div>

                  <div className="text-[11px] text-[#A3F542] font-semibold mt-2 flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{lang === 'TR' ? 'Yüklenen veya seçilen tüm resimler alanda %100 kusursuz şekilde dikey ve yatay ortalanır.' : 'All images are guaranteed 100% centered horizontally and vertically.'}</span>
                  </div>
                </div>

                {/* 2. Ready-Made Presets (Hazır Şablonlar) */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-300 block">
                    {lang === 'TR' ? '1. Hazır Şablonlardan Seçin:' : '1. Choose from Ready-Made Presets:'}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                    {vehiclePresets.map((preset) => {
                      const isSelected =
                        (preset.url === '/kia-ray-car-cut.jpg' && (!settings.vehicleImageUrl || settings.vehicleImageUrl === '/kia-ray-car-cut.jpg')) ||
                        settings.vehicleImageUrl === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setSettings({ ...settings, vehicleImageUrl: preset.url })}
                          className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer relative group ${
                            isSelected
                              ? 'bg-[#A3F542]/10 border-[#A3F542] shadow-lg shadow-[#A3F542]/15'
                              : 'bg-black/40 border-white/10 hover:border-white/30 hover:bg-black/60'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#A3F542] text-black flex items-center justify-center text-[10px] font-bold">
                              ✓
                            </span>
                          )}
                          <div className="w-full h-16 sm:h-20 flex items-center justify-center mb-1.5 overflow-hidden">
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="max-w-full max-h-full object-contain object-center drop-shadow transition-transform group-hover:scale-105"
                            />
                          </div>
                          <span className="text-xs font-bold text-white leading-tight">{preset.name}</span>
                          <span className="text-[10px] text-gray-400 mt-0.5">{preset.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Custom Image Upload */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-xs font-semibold text-gray-300 block">
                    {lang === 'TR' ? '2. Veya Kendi Aracınızın Özel Resmini Yükleyin:' : '2. Or Upload Your Custom Vehicle Photo:'}
                  </span>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <label className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/20 hover:border-[#A3F542]/60 text-xs font-bold text-gray-200 transition-all cursor-pointer">
                      <Upload className="w-4 h-4 text-[#A3F542]" />
                      <span>{uploadingImage ? (lang === 'TR' ? 'Resim Yükleniyor...' : 'Uploading...') : (lang === 'TR' ? 'Dosya Seç (JPG, PNG, WEBP, SVG)' : 'Choose File (JPG, PNG, WEBP, SVG)')}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
                        onChange={handleImageFileUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>

                    {uploadingImage && (
                      <div className="flex items-center space-x-2 text-xs text-[#A3F542] font-semibold">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{lang === 'TR' ? 'Yükleniyor ve işleniyor...' : 'Uploading...'}</span>
                      </div>
                    )}
                  </div>

                  {uploadSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-400 text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{lang === 'TR' ? 'Özel araç resmi yüklendi ve alana tam ortalandı! Kaydet butonuna basmayı unutmayın.' : 'Custom image uploaded and centered! Click Save to apply.'}</span>
                    </div>
                  )}

                  {uploadError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-red-400 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>

                {/* 4. Manual URL entry */}
                <div className="pt-1">
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">
                    {lang === 'TR' ? 'Manuel Resim URL (İsteğe Bağlı):' : 'Manual Image URL (Optional):'}
                  </label>
                  <input
                    type="text"
                    value={settings.vehicleImageUrl || ''}
                    onChange={(e) => setSettings({ ...settings, vehicleImageUrl: e.target.value })}
                    placeholder="/kia-ray-car-cut.jpg veya https://..."
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-[#A3F542] outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Phone Call Settings */}
            <div className="p-6 rounded-3xl bg-[#12151C] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#A3F542]/10 border border-[#A3F542]/30 flex items-center justify-center text-[#A3F542]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{dict.phoneSettings}</h3>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <span className="text-xs text-gray-400">
                    {settings.phoneEnabled ? dict.enable : dict.disable}
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.phoneEnabled}
                    onChange={(e) => setSettings({ ...settings, phoneEnabled: e.target.checked })}
                    className="w-4 h-4 accent-[#A3F542]"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {dict.phoneNum}
                </label>
                <input
                  type="text"
                  value={settings.phoneNumber || ''}
                  onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
                  placeholder="010-XXXX-XXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:border-[#A3F542] outline-none font-mono"
                />
              </div>
            </div>

            {/* WhatsApp Settings */}
            <div className="p-6 rounded-3xl bg-[#12151C] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366]">
                    <WhatsAppIcon className="w-4 h-4 fill-current" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{dict.whatsAppSettings}</h3>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <span className="text-xs text-gray-400">
                    {settings.whatsAppEnabled ? dict.enable : dict.disable}
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.whatsAppEnabled}
                    onChange={(e) => setSettings({ ...settings, whatsAppEnabled: e.target.checked })}
                    className="w-4 h-4 accent-[#25D366]"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                    {dict.whatsAppNum}
                  </label>
                  <input
                    type="text"
                    value={settings.whatsAppNumber || ''}
                    onChange={(e) => setSettings({ ...settings, whatsAppNumber: e.target.value })}
                    placeholder="+82 10-XXXX-XXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:border-[#25D366] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                    {dict.whatsAppMsg}
                  </label>
                  <input
                    type="text"
                    value={settings.whatsAppMessage || ''}
                    onChange={(e) => setSettings({ ...settings, whatsAppMessage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:border-[#25D366] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* KakaoTalk Settings */}
            <div className="p-6 rounded-3xl bg-[#12151C] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FEE500]/20 border border-[#FEE500]/40 flex items-center justify-center text-[#FEE500]">
                    <KakaoTalkIcon className="w-4 h-4 fill-current" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{dict.kakaoSettings}</h3>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <span className="text-xs text-gray-400">
                    {settings.kakaoTalkEnabled ? dict.enable : dict.disable}
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.kakaoTalkEnabled}
                    onChange={(e) => setSettings({ ...settings, kakaoTalkEnabled: e.target.checked })}
                    className="w-4 h-4 accent-[#FEE500]"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {dict.kakaoUrl}
                </label>
                <input
                  type="text"
                  value={settings.kakaoTalkUrl || ''}
                  onChange={(e) => setSettings({ ...settings, kakaoTalkUrl: e.target.value })}
                  placeholder="https://open.kakao.com/o/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:border-[#FEE500] outline-none font-mono text-xs"
                />
              </div>
            </div>

            {/* Base Domain for QR */}
            <div className="p-6 rounded-3xl bg-[#12151C] border border-white/10 space-y-3">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 flex items-center space-x-2">
                <Globe className="w-4 h-4 text-[#A3F542]" />
                <span>{dict.baseUrl}</span>
              </label>
              <input
                type="text"
                value={settings.baseUrl || ''}
                onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:border-[#A3F542] outline-none font-mono"
              />
            </div>

            {/* Privacy & QR-Only Access Gate */}
            <div className="p-6 rounded-3xl bg-[#12151C] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#A3F542]/10 border border-[#A3F542]/30 flex items-center justify-center text-[#A3F542]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {lang === 'TR' ? 'QR Kod Zorunluluğu (Özel Erişim Kilidi)' : 'QR-Only Access Gate'}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {lang === 'TR'
                        ? 'Sadece araçtaki QR kodu okutanlar iletişim butonlarını görebilir'
                        : 'Only visitors scanning the in-car physical QR can access contacts'}
                    </p>
                  </div>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <span className="text-xs font-bold text-[#A3F542]">
                    {settings.qrOnlyAccess !== false ? (lang === 'TR' ? 'Açık (Korumalı)' : 'Enabled') : (lang === 'TR' ? 'Kapalı' : 'Disabled')}
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.qrOnlyAccess !== false}
                    onChange={(e) => setSettings({ ...settings, qrOnlyAccess: e.target.checked })}
                    className="w-4 h-4 accent-[#A3F542]"
                  />
                </label>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs text-gray-300">
                <div className="flex items-center space-x-2 text-[#A3F542] font-semibold">
                  <span>🛡️</span>
                  <span>{lang === 'TR' ? 'Arama Motoru Gizliliği (Google, Bing vb.)' : 'Search Engine Privacy'}</span>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  {lang === 'TR'
                    ? 'robots.txt ve X-Robots-Tag (noindex, nofollow) tamamen devrededir. Site Google arama sonuçlarında asla listelenmez. Link doğrudan tarayıcıya yazıldığında ise ziyaretçiye araçtaki QR kodu okutması gerektiğini bildiren özel kilit ekranı sunulur.'
                    : 'robots.txt and X-Robots-Tag (noindex, nofollow) are strictly active. The site will never appear in search results. Direct URL visits show a private lock screen prompting to scan the physical QR.'}
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-[#A3F542] text-black font-bold text-sm tracking-wide hover:bg-[#8ee42c] active:scale-95 transition-all flex items-center space-x-2 shadow-lg shadow-[#A3F542]/20 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? dict.saving : dict.saveChanges}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: KOREAN CONTENT */}
        {activeTab === 'content' && settings && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#12151C] border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#A3F542]" />
                <span>Korean Public Copy (한국어 안내 문구 편집)</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Main Heading (헤딩)
                </label>
                <input
                  type="text"
                  value={settings.headline || ''}
                  onChange={(e) => setSettings({ ...settings, headline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:border-[#A3F542] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                    Greeting (인사말)
                  </label>
                  <input
                    type="text"
                    value={settings.greeting || ''}
                    onChange={(e) => setSettings({ ...settings, greeting: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:border-[#A3F542] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                    Sub-Greeting (질문/서브텍스트)
                  </label>
                  <input
                    type="text"
                    value={settings.subGreeting || ''}
                    onChange={(e) => setSettings({ ...settings, subGreeting: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:border-[#A3F542] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Introduction Body Text (안내 본문)
                </label>
                <textarea
                  rows={3}
                  value={settings.bodyText || ''}
                  onChange={(e) => setSettings({ ...settings, bodyText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:border-[#A3F542] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                    Footer Note (하단 감사 문구)
                  </label>
                  <input
                    type="text"
                    value={settings.footerNote || ''}
                    onChange={(e) => setSettings({ ...settings, footerNote: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:border-[#A3F542] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                    Footer Branding (하단 브랜딩)
                  </label>
                  <input
                    type="text"
                    value={settings.footerBranding || ''}
                    onChange={(e) => setSettings({ ...settings, footerBranding: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:border-[#A3F542] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-[#A3F542] text-black font-bold text-sm tracking-wide hover:bg-[#8ee42c] active:scale-95 transition-all flex items-center space-x-2 shadow-lg shadow-[#A3F542]/20 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? dict.saving : dict.saveChanges}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: SECURITY */}
        {activeTab === 'security' && (
          <div className="max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-[#12151C] border border-white/10 space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-[#A3F542]/10 border border-[#A3F542]/30 flex items-center justify-center text-[#A3F542]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{dict.changePwd}</h3>
                <p className="text-xs text-gray-400">Account: {user.username}</p>
              </div>
            </div>

            {pwdMessage && (
              <div
                className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center space-x-2 ${
                  pwdMessage.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                {pwdMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{pwdMessage.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {dict.currPwd}
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:border-[#A3F542] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {dict.newPwd}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:border-[#A3F542] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {dict.confirmPwd}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:border-[#A3F542] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={pwdLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#A3F542] text-black font-bold text-sm tracking-wide hover:bg-[#8ee42c] active:scale-95 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#A3F542]/20 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{pwdLoading ? 'Updating...' : dict.pwdBtn}</span>
              </button>
            </form>
          </div>
        )}

        {/* FULLSCREEN CARD PREVIEW MODAL */}
        {showFullscreenModal && settings && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col p-4 sm:p-8 overflow-y-auto animate-in fade-in">
            {/* Modal Top Bar */}
            <div className="w-full max-w-[920px] mx-auto flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <span className="text-base sm:text-lg font-black text-white">
                  {cardTemplate === 'acrylic' ? 'Şablon 1: Akrilik Stand Kartı' : 'Şablon 2: Yatay Mat Kart'}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#A3F542]/20 text-[#A3F542] border border-[#A3F542]/30 font-mono font-bold">
                  1800 × 1125 HD
                </span>
              </div>

              {/* Template Switcher inside modal */}
              <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setCardTemplate('acrylic')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    cardTemplate === 'acrylic' ? 'bg-[#A3F542] text-black shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Şablon 1 (Akrilik)
                </button>
                <button
                  type="button"
                  onClick={() => setCardTemplate('horizontal')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    cardTemplate === 'horizontal' ? 'bg-[#A3F542] text-black shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Şablon 2 (Yatay Mat)
                </button>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleDownloadFullCard(cardTemplate)}
                  disabled={downloadingCard}
                  className="px-4 py-2 rounded-xl bg-[#A3F542] hover:bg-[#8ee42c] text-black font-extrabold text-xs flex items-center space-x-2 shadow-lg cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{lang === 'TR' ? 'Sistem İçi PNG İndir' : 'Download PNG'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center space-x-1.5 border border-white/15 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#A3F542]" />
                  <span>Yazdır</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowFullscreenModal(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                  title="Kapat"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Card Display */}
            <div className="w-full max-w-[920px] mx-auto my-auto flex items-center justify-center py-4">
              {cardTemplate === 'acrylic' ? (
                <div className="w-full bg-[#090C10] rounded-3xl border-2 border-white/20 p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative overflow-hidden flex flex-col justify-between text-white select-none min-h-[500px]">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#A3F542] to-transparent shadow-[0_0_12px_#A3F542]" />

                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="font-black text-2xl tracking-wider text-white">KIA</span>
                      <span className="text-white/30 text-xl font-light">|</span>
                      <span
                        className="text-[#A3F542] font-black italic text-3xl font-serif drop-shadow-[0_0_10px_rgba(163,245,66,0.6)]"
                        style={{ fontFamily: '"Brush Script MT", "Caveat", cursive, sans-serif' }}
                      >
                        Ray
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-[#A3F542]/20 text-[#A3F542] flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 fill-current" />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-white">
                          차량 연락 안내
                        </span>
                      </div>
                      <div className="text-right text-sm text-gray-300 font-medium leading-tight">
                        차량과 관련하여 연락이 필요하신 경우<br />
                        QR 코드를 스캔하여 간편하게 연락해 주세요.
                      </div>
                    </div>
                  </div>

                  {/* Center Content (No car image) */}
                  <div className="grid grid-cols-12 gap-8 items-center my-auto py-3">
                    <div className="col-span-5 flex flex-col items-center justify-center">
                      <div className="relative p-5 bg-white rounded-2xl shadow-[0_0_35px_rgba(163,245,66,0.35)] border-2 border-[#A3F542]">
                        <span className="absolute -top-2 -left-2 w-4 h-4 border-t-4 border-l-4 border-[#A3F542]" />
                        <span className="absolute -top-2 -right-2 w-4 h-4 border-t-4 border-r-4 border-[#A3F542]" />
                        <span className="absolute -bottom-2 -left-2 w-4 h-4 border-b-4 border-l-4 border-[#A3F542]" />
                        <span className="absolute -bottom-2 -right-2 w-4 h-4 border-b-4 border-r-4 border-[#A3F542]" />

                        <img
                          src={`/api/admin/qr?format=png&size=400&ec=H&url=${encodeURIComponent(
                            settings.baseUrl || 'https://car.fmkal.com'
                          )}`}
                          alt="Vehicle QR"
                          className="w-48 h-48 object-contain"
                        />
                      </div>
                      <div className="flex items-center space-x-1.5 mt-3 text-xs font-bold text-[#A3F542]">
                        <span>[ ]</span>
                        <span>QR 코드를 스캔하여 간편하게 연락해 주세요.</span>
                      </div>
                    </div>

                    <div className="col-span-7 flex flex-col space-y-3.5">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-black/70 border border-white/15 text-sm font-bold shadow-lg">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md">
                            <WhatsAppIcon className="w-4 h-4 fill-current" />
                          </div>
                          <div>
                            <div className="text-white text-base">WhatsApp 문의</div>
                            <div className="text-xs text-gray-400 font-normal">빠르고 편리한 1:1 메시지 상담</div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-2xl bg-black/70 border border-white/15 text-sm font-bold shadow-lg">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-9 h-9 rounded-full bg-[#FEE500] text-[#191919] flex items-center justify-center shrink-0 shadow-md">
                            <span className="text-[10px] font-black">TALK</span>
                          </div>
                          <div>
                            <div className="text-white text-base">카카오톡 문의</div>
                            <div className="text-xs text-gray-400 font-normal">카카오톡 채팅 상담 연결</div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-2xl bg-black/70 border border-white/15 text-sm font-bold shadow-lg">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-9 h-9 rounded-full bg-[#A3F542]/20 text-[#A3F542] flex items-center justify-center shrink-0 shadow-md">
                            <Phone className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-white text-base">전화하기</div>
                            <div className="text-xs text-gray-400 font-normal">차주와 직접 통화 연결</div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/10 text-xs">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-200 font-mono">
                        <LinkIcon className="w-4 h-4 text-[#A3F542]" />
                        <span className="font-bold text-sm">{cardDisplayUrl}</span>
                      </div>
                      <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-[#A3F542]/10 border border-[#A3F542]/30 text-white font-mono">
                        <span>🌐</span>
                        <span className="font-bold text-[#A3F542] text-sm">fmkal.com</span>
                        <span className="text-xs text-gray-400 font-sans font-medium">(공식 웹)</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-200">
                      <HandshakeIcon className="w-5 h-5 text-[#A3F542]" />
                      <span className="font-bold text-sm">빠른 연락에 감사드립니다.</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full bg-[#080A0D] rounded-3xl border-2 border-white/15 p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative overflow-hidden flex flex-col justify-between text-white select-none min-h-[500px]">
                  <div className="absolute top-0 right-32 w-32 h-24 bg-[#A3F542]/10 -skew-x-12 blur-sm pointer-events-none" />

                  <div className="grid grid-cols-12 gap-8 items-center my-auto">
                    <div className="col-span-7 space-y-3.5">
                      <div className="flex items-baseline space-x-2">
                        <span className="font-black text-2xl tracking-wider text-white">KIA</span>
                        <span
                          className="text-[#A3F542] font-black italic text-3xl font-serif drop-shadow-[0_0_8px_rgba(163,245,66,0.5)]"
                          style={{ fontFamily: '"Brush Script MT", "Caveat", cursive, sans-serif' }}
                        >
                          Ray
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono tracking-widest uppercase">
                          VEHICLE CONTACT
                        </span>
                      </div>

                      <h2 className="text-3xl font-black tracking-tight text-white">
                        차량 <span className="text-[#A3F542] drop-shadow-[0_0_10px_rgba(163,245,66,0.4)]">연락</span> 센터
                      </h2>

                      <div className="text-sm text-gray-300 space-y-1">
                        <p className="font-bold text-white">안녕하세요! 차량 관련 문의가 있으신가요?</p>
                        <p className="text-gray-400 leading-snug">
                          차량 이동이 필요하거나 긴급한 연락이 필요하시면 QR 코드를 스캔하거나 아래 방법으로 연락해 주세요.
                        </p>
                      </div>

                      <div className="flex flex-col space-y-2 pt-1">
                        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 font-mono w-fit">
                          <LinkIcon className="w-3.5 h-3.5 text-[#A3F542]" />
                          <span>{cardDisplayUrl}</span>
                        </div>
                        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#A3F542]/10 border border-[#A3F542]/30 text-xs text-white font-mono w-fit">
                          <span>🌐</span>
                          <span className="font-bold text-[#A3F542]">fmkal.com</span>
                          <span className="text-xs text-gray-300 font-sans font-medium">공식 웹사이트</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-5 flex flex-col items-center justify-center">
                      <div className="p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(163,245,66,0.3)] border-2 border-[#A3F542]">
                        <img
                          src={`/api/admin/qr?format=png&size=400&ec=H&url=${encodeURIComponent(
                            settings.baseUrl || 'https://car.fmkal.com'
                          )}`}
                          alt="Vehicle QR"
                          className="w-44 h-44 object-contain"
                        />
                      </div>
                      <div className="flex items-center space-x-1.5 mt-2.5 text-xs font-black text-[#A3F542]">
                        <span>[ ]</span>
                        <span>QR 코드를 스캔하여 연락해 주세요!</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-5 border-t border-white/10 mt-5">
                    <div className="p-3.5 rounded-2xl bg-black/60 border border-white/15 flex items-center space-x-3 text-sm font-bold shadow-md">
                      <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow">
                        <WhatsAppIcon className="w-4 h-4 fill-current" />
                      </div>
                      <div className="leading-tight">
                        <div className="text-white">WhatsApp</div>
                        <div className="text-[11px] text-gray-400 font-normal">문의하기 →</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-black/60 border border-white/15 flex items-center space-x-3 text-sm font-bold shadow-md">
                      <div className="w-8 h-8 rounded-full bg-[#FEE500] text-[#191919] flex items-center justify-center shrink-0 shadow">
                        <span className="text-[9px] font-black">TALK</span>
                      </div>
                      <div className="leading-tight">
                        <div className="text-white">카카오톡</div>
                        <div className="text-[11px] text-gray-400 font-normal">문의하기 →</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-black/60 border border-white/15 flex items-center space-x-3 text-sm font-bold shadow-md">
                      <div className="w-8 h-8 rounded-full bg-[#A3F542]/20 text-[#A3F542] flex items-center justify-center shrink-0 shadow">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="leading-tight">
                        <div className="text-white">전화하기</div>
                        <div className="text-[11px] text-gray-400 font-normal">바로 연결 →</div>
                      </div>
                    </div>
                  </div>

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
        )}
      </div>
    </div>
  );
}
