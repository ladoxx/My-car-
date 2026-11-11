'use client';

import React, { useState, useEffect } from 'react';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { RefreshCw } from 'lucide-react';

export default function AdminClient() {
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [lang, setLang] = useState<'EN' | 'TR'>('EN');

  useEffect(() => {
    // Check existing session
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser({ id: data.user.userId, username: data.user.username });
          }
        }
      } catch {
        // Silently treat as logged out
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    setUser(null);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#08090C] flex items-center justify-center text-[#A3F542]">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="text-sm font-mono tracking-wider">CHECKING SESSION...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#08090C] flex flex-col justify-between p-4 sm:p-8">
        <div className="flex justify-end w-full max-w-md mx-auto">
          <div className="flex items-center rounded-xl bg-black/40 border border-white/10 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setLang('EN')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                lang === 'EN' ? 'bg-[#A3F542] text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('TR')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                lang === 'TR' ? 'bg-[#A3F542] text-black font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              TR
            </button>
          </div>
        </div>

        <div className="my-auto">
          <AdminLoginForm
            onLoginSuccess={(userData) => setUser(userData)}
            lang={lang}
          />
        </div>

        <div className="text-center text-[11px] text-gray-500 font-mono py-2">
          FMKAL VEHICLE CONTACT SYSTEM · SECURE ADMIN
        </div>
      </div>
    );
  }

  return (
    <AdminDashboard
      user={user}
      onLogout={handleLogout}
      lang={lang}
      setLang={setLang}
    />
  );
}
