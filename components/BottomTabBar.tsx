'use client';

import React from 'react';
import { Home, MapPin, Flag, User } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'map' | 'reports' | 'profile';

interface BottomTabBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  reportsBadgeCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  reportsBadgeCount = 0,
}) => {
  return (
    <nav
      id="bottom-tab-bar"
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0F2A2E] border-t border-[#24545C] shadow-2xl safe-area-inset-bottom"
    >
      <div className="max-w-md md:max-w-2xl mx-auto px-3 py-1 flex items-center justify-around">
        {/* Tab 1: Dashboard */}
        <button
          id="tab-btn-dashboard"
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 relative ${
            activeTab === 'dashboard'
              ? 'text-[#C97A2B] scale-105'
              : 'text-[#8DA3A0] hover:text-white'
          }`}
        >
          <div className="relative p-1">
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold tracking-tight leading-tight">
            Dashboard
          </span>
          {activeTab === 'dashboard' && (
            <span className="w-1 h-1 rounded-full bg-[#C97A2B] mt-0.5" />
          )}
        </button>

        {/* Tab 2: Map */}
        <button
          id="tab-btn-map"
          onClick={() => onTabChange('map')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 relative ${
            activeTab === 'map'
              ? 'text-[#C97A2B] scale-105'
              : 'text-[#8DA3A0] hover:text-white'
          }`}
        >
          <div className="relative p-1">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold tracking-tight leading-tight">
            Map
          </span>
          {activeTab === 'map' && (
            <span className="w-1 h-1 rounded-full bg-[#C97A2B] mt-0.5" />
          )}
        </button>

        {/* Tab 3: Reports */}
        <button
          id="tab-btn-reports"
          onClick={() => onTabChange('reports')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 relative ${
            activeTab === 'reports'
              ? 'text-[#C97A2B] scale-105'
              : 'text-[#8DA3A0] hover:text-white'
          }`}
        >
          <div className="relative p-1">
            <Flag className="w-5 h-5" />
            {reportsBadgeCount > 0 && (
              <span
                id="reports-badge-count"
                className="absolute -top-0.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold bg-[#C97A2B] text-white flex items-center justify-center ring-2 ring-[#0F2A2E]"
              >
                {reportsBadgeCount > 99 ? '99+' : reportsBadgeCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold tracking-tight leading-tight">
            Reports
          </span>
          {activeTab === 'reports' && (
            <span className="w-1 h-1 rounded-full bg-[#C97A2B] mt-0.5" />
          )}
        </button>

        {/* Tab 4: Profile */}
        <button
          id="tab-btn-profile"
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 relative ${
            activeTab === 'profile'
              ? 'text-[#C97A2B] scale-105'
              : 'text-[#8DA3A0] hover:text-white'
          }`}
        >
          <div className="relative p-1">
            <User className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold tracking-tight leading-tight">
            Profile
          </span>
          {activeTab === 'profile' && (
            <span className="w-1 h-1 rounded-full bg-[#C97A2B] mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
};
