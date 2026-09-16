'use client';

import React from 'react';
import { ShieldCheck, MapPin, UserCheck, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CivicHeaderProps {
  onOpenAuth?: () => void;
  onOpenCountryPicker?: () => void;
}

export const CivicHeader: React.FC<CivicHeaderProps> = ({
  onOpenAuth,
  onOpenCountryPicker,
}) => {
  const { user } = useAuth();

  return (
    <header className="bg-[#0F2A2E] text-white border-b border-[#DDE4E2]/20 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Civora brand mark + Live Civic Registry status pill */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#193F45] border border-[#24545C] text-[#C97A2B]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">Civora</h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#13353A] text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Civic Registry
            </span>
          </div>
        </div>

        {/* Right side controls: Country indicator & Sign In / Account button */}
        <div className="flex items-center gap-2">
          {/* Country Switcher / Indicator */}
          {user.country ? (
            <button
              onClick={onOpenCountryPicker}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#193F45] hover:bg-[#23565F] text-[#E0EFEA] border border-[#2B6069] text-xs font-semibold transition-colors"
              title="Change jurisdiction country"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{user.country}</span>
            </button>
          ) : (
            <button
              onClick={onOpenCountryPicker}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#193F45]/80 hover:bg-[#193F45] text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
              title="Set civic jurisdiction"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Set Country</span>
            </button>
          )}

          {/* Sign In / Switch Profile button */}
          <button
            id="header-sign-in-btn"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#193F45] hover:bg-[#23565F] text-white border border-[#2B6069] text-xs font-semibold transition-colors"
            title="Sign In / Manage Profile"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#C97A2B]" />
            <span className="hidden sm:inline">
              {user.fullName ? user.fullName.split(' ')[0] : 'Sign In'}
            </span>
            <span className="sm:hidden">Sign In</span>
          </button>
        </div>
      </div>
    </header>
  );
};

