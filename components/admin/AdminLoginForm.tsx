'use client';

import React, { useState } from 'react';
import { Lock, User, AlertCircle, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';

interface AdminLoginFormProps {
  onLoginSuccess: (user: { id: string; username: string }) => void;
  lang: 'EN' | 'TR';
}

export default function AdminLoginForm({ onLoginSuccess, lang }: AdminLoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = {
    EN: {
      title: 'FMKAL Admin Portal',
      subtitle: 'Vehicle Contact Management System',
      usernameLabel: 'Username',
      passwordLabel: 'Password',
      loginBtn: 'Sign In to Dashboard',
      placeholderUser: 'Enter admin username',
      placeholderPass: 'Enter admin password',
      defaultHint: 'Initial credentials: admin / admin1234!',
    },
    TR: {
      title: 'FMKAL Yönetici Paneli',
      subtitle: 'Araç İletişim Yönetim Sistemi',
      usernameLabel: 'Kullanıcı Adı',
      passwordLabel: 'Şifre',
      loginBtn: 'Panele Giriş Yap',
      placeholderUser: 'Yönetici adını girin',
      placeholderPass: 'Yönetici şifresini girin',
      defaultHint: 'İlk kurulum bilgisi: admin / admin1234!',
    },
  }[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      onLoginSuccess(data.user);
    } catch {
      setError('Network error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-[#12151C]/90 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Glow Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#A3F542] to-transparent" />

      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-[#A3F542]/10 border border-[#A3F542]/30 flex items-center justify-center text-[#A3F542] mb-3 shadow-[0_0_20px_rgba(163,245,66,0.15)]">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {t.title}
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          {t.subtitle}
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-2.5 text-red-400 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
            {t.usernameLabel}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.placeholderUser}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-[#A3F542] focus:ring-1 focus:ring-[#A3F542] text-sm text-white placeholder-gray-600 outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
            {t.passwordLabel}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.placeholderPass}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-[#A3F542] focus:ring-1 focus:ring-[#A3F542] text-sm text-white placeholder-gray-600 outline-none transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#A3F542] text-black font-bold text-sm tracking-wide hover:bg-[#8ee42c] active:scale-[0.99] transition-all duration-150 flex items-center justify-center space-x-2 shadow-lg shadow-[#A3F542]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking...</span>
            </>
          ) : (
            <>
              <span>{t.loginBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-white/5 text-center">
        <p className="text-[11px] text-gray-500 font-mono">
          {t.defaultHint}
        </p>
      </div>
    </div>
  );
}
