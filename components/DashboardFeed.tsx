'use client';

import React, { useMemo, useState, useSyncExternalStore } from 'react';
import { PublicReport, Office, Service } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { CountryPickerModal } from './CountryPickerModal';
import {
  FileText,
  MessageSquare,
  CheckCircle2,
  Clock,
  Building2,
  ExternalLink,
  Activity,
  Flame,
  Globe2,
  MapPin,
  Filter,
} from 'lucide-react';

export interface FeedItem {
  id: string;
  type: 'new_report' | 'pattern_confirmed' | 'official_reply' | 'verified_service';
  title: string;
  subtitle?: string;
  timestamp: string;
  officeId?: string;
  officeName?: string;
  officeCountry?: string;
  reportId?: string;
}

interface DashboardFeedProps {
  reports: PublicReport[];
  offices: Office[];
  services: Service[];
  onSelectOffice: (office: Office) => void;
  onSelectReport: (reportId: string) => void;
}

const emptySubscribe = () => () => {};

export const DashboardFeed: React.FC<DashboardFeedProps> = ({
  reports,
  offices,
  services,
  onSelectOffice,
  onSelectReport,
}) => {
  const { user, setUser } = useAuth();
  const [filterMode, setFilterMode] = useState<'my_country' | 'all'>('my_country');
  const [showCountryPicker, setShowCountryPicker] = useState<boolean>(false);

  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Synthesize reverse-chronological activity items pulling strictly from EXISTING data
  const allFeedItems = useMemo(() => {
    const items: FeedItem[] = [];

    // 1. New reports filed (anonymized, showing office name + issueType)
    reports.forEach((rep) => {
      const office = offices.find((o) => o.id === rep.officeId);
      const officeName = rep.officeName || office?.name || 'Local Civic Office';
      const officeCountry = office?.country || 'Ethiopia';

      items.push({
        id: `feed-report-${rep.id}`,
        type: 'new_report',
        title: `New discrepancy report at ${officeName}`,
        subtitle: `Reported issue: "${rep.issueType}" for ${rep.serviceName || 'civic service'}`,
        timestamp: rep.timestamp,
        officeId: rep.officeId,
        officeName,
        officeCountry,
        reportId: rep.id,
      });

      // 2. Reports that flipped to "pattern_confirmed"
      if (rep.status === 'pattern_confirmed') {
        items.push({
          id: `feed-pattern-${rep.id}`,
          type: 'pattern_confirmed',
          title: `Pattern confirmed at ${officeName}`,
          subtitle: `Multiple verified citizen reports logged for ${rep.serviceName || 'service'} (${rep.issueType})`,
          timestamp: rep.timestamp,
          officeId: rep.officeId,
          officeName,
          officeCountry,
          reportId: rep.id,
        });
      }

      // 3. Official replies posted by office_admins
      if (rep.officialReply) {
        items.push({
          id: `feed-reply-${rep.officialReply.id || rep.id}`,
          type: 'official_reply',
          title: `${rep.officialReply.officeName || officeName} posted an official reply`,
          subtitle: `Institutional response to citizen notice regarding ${rep.serviceName || 'civic procedure'}`,
          timestamp: rep.officialReply.timestamp,
          officeId: rep.officeId,
          officeName,
          officeCountry,
          reportId: rep.id,
        });
      }
    });

    // 4. Services whose lastVerified date was recently updated
    services.forEach((srv) => {
      if (srv.lastVerified) {
        const associatedOffices = offices.filter((o) => srv.officeIds.includes(o.id));
        const officeLabel = associatedOffices.length > 0 ? associatedOffices[0].name : 'Civic registry';
        const officeCountry = associatedOffices[0]?.country || 'Ethiopia';

        // Parse date into ISO timestamp for uniform sorting
        const parsedDate = new Date(srv.lastVerified).toISOString();

        items.push({
          id: `feed-verified-${srv.id}`,
          type: 'verified_service',
          title: `Statutory requirements verified for ${srv.name}`,
          subtitle: `Fee structure (${srv.fee}) and document checklist re-certified under ${srv.source}`,
          timestamp: parsedDate,
          officeId: associatedOffices[0]?.id,
          officeName: officeLabel,
          officeCountry,
        });
      }
    });

    // Sort strictly in reverse-chronological order (newest first)
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [reports, offices, services]);

  // Country-filtered items vs All items
  const userCountry = user.country;

  const myCountryItems = useMemo(() => {
    if (!userCountry) return [];
    return allFeedItems.filter(
      (item) => item.officeCountry?.toLowerCase() === userCountry.toLowerCase()
    );
  }, [allFeedItems, userCountry]);

  const displayedItems = useMemo(() => {
    if (filterMode === 'all') {
      return allFeedItems;
    }
    return myCountryItems;
  }, [filterMode, allFeedItems, myCountryItems]);

  const handleCountrySelected = async (country: string) => {
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, country }),
      });
    } catch {
      // Offline / fallback
    }
    setUser({ ...user, country });
  };

  const formatTimeAgo = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHrs / 24);

      if (diffDays > 30) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      if (diffDays > 0) {
        return `${diffDays}d ago`;
      }
      if (diffHrs > 0) {
        return `${diffHrs}h ago`;
      }
      return 'Just now';
    } catch {
      return isoString;
    }
  };

  const handleItemClick = (item: FeedItem) => {
    if (item.reportId) {
      onSelectReport(item.reportId);
    } else if (item.officeId) {
      const office = offices.find((o) => o.id === item.officeId);
      if (office) {
        onSelectOffice(office);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 w-full pb-24">
      {/* Header section */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#12211F] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#C97A2B]" />
            Civic Activity Feed
          </h2>
          <p className="text-xs text-[#5B6E6A] mt-0.5">
            Real-time timeline of verified notices, pattern flags, and official office replies
          </p>
        </div>

        {/* Current Country Badge & Picker Trigger */}
        <button
          onClick={() => setShowCountryPicker(true)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DDE4E2] text-xs font-semibold text-[#12211F] hover:border-[#287258] hover:bg-[#F6F9F8] transition-colors shadow-2xs"
          title="Change Country"
        >
          <MapPin className="w-3.5 h-3.5 text-[#287258]" />
          <span>{userCountry || 'Set Country'}</span>
          <span className="text-[10px] text-[#8DA3A0] underline ml-1">Change</span>
        </button>
      </div>

      {/* Filter Toggle Bar: My Country vs All Countries */}
      <div className="mb-5 flex items-center justify-between p-1.5 bg-[#EBF0EF] rounded-xl border border-[#DDE4E2]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterMode('my_country')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'my_country'
                ? 'bg-white text-[#12211F] shadow-xs'
                : 'text-[#5B6E6A] hover:text-[#12211F]'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-[#287258]" />
            <span>My Country {userCountry ? `(${userCountry})` : ''}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterMode === 'my_country'
                  ? 'bg-[#EBF5F1] text-[#1B6A58]'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {userCountry ? myCountryItems.length : 0}
            </span>
          </button>

          <button
            onClick={() => setFilterMode('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-white text-[#12211F] shadow-xs'
                : 'text-[#5B6E6A] hover:text-[#12211F]'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5 text-[#C97A2B]" />
            <span>All Countries</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterMode === 'all'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {allFeedItems.length}
            </span>
          </button>
        </div>

        <span className="text-[11px] text-[#5B6E6A] pr-2 hidden sm:inline">
          {filterMode === 'my_country' && userCountry
            ? `Showing events in ${userCountry}`
            : 'Showing all regional events'}
        </span>
      </div>

      {/* Case 1: Unset Country Prompt State */}
      {filterMode === 'my_country' && !userCountry ? (
        <div className="bg-white rounded-2xl border border-[#287258]/30 p-8 sm:p-12 text-center shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF5F1] text-[#287258] flex items-center justify-center mx-auto mb-4 border border-[#287258]/20">
            <MapPin className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#12211F] mb-1.5">
            Set your country to see civic activity near you
          </h3>
          <p className="text-xs text-[#5B6E6A] max-w-md mx-auto mb-6 leading-relaxed">
            Civora personalizes your timeline with verified procedural updates, statutory fee notices, and citizen discrepancy patterns for your jurisdiction.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-xs mx-auto">
            <button
              onClick={() => setShowCountryPicker(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#287258] text-white text-xs font-bold hover:bg-[#1B6A58] transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <Globe2 className="w-4 h-4" />
              <span>Choose Your Country</span>
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className="w-full py-2 px-3 rounded-xl border border-[#DDE4E2] text-xs font-semibold text-[#5B6E6A] hover:bg-[#F6F9F8] transition-colors"
            >
              Browse All Countries
            </button>
          </div>
        </div>
      ) : displayedItems.length === 0 ? (
        /* Case 2: No events found for the active filter */
        <div className="bg-white rounded-2xl border border-[#DDE4E2] p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-[#EBF0EF] text-[#5B6E6A] flex items-center justify-center mx-auto mb-3">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#12211F] mb-1">
            No civic activity recorded for {userCountry || 'this filter'}
          </h3>
          <p className="text-xs text-[#5B6E6A] max-w-sm mx-auto mb-4">
            No discrepancy reports or statutory notices have been logged for this jurisdiction yet.
          </p>
          <button
            onClick={() => setFilterMode('all')}
            className="text-xs font-semibold text-[#287258] underline hover:text-[#1B6A58]"
          >
            View all country activities
          </button>
        </div>
      ) : (
        /* Case 3: Render Feed Items */
        <div className="space-y-3">
          {displayedItems.map((item) => {
            const isPattern = item.type === 'pattern_confirmed';
            const isReply = item.type === 'official_reply';
            const isVerified = item.type === 'verified_service';

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-4 rounded-xl border transition-all cursor-pointer bg-white hover:border-[#287258] hover:shadow-xs group flex items-start gap-3.5 ${
                  isPattern
                    ? 'border-amber-200 bg-amber-50/20'
                    : isReply
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-[#DDE4E2]'
                }`}
              >
                {/* Event Icon */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isPattern
                      ? 'bg-amber-100 text-amber-800'
                      : isReply
                      ? 'bg-[#EBF5F1] text-[#1B6A58]'
                      : isVerified
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-[#F0F5F4] text-[#5B6E6A]'
                  }`}
                >
                  {isPattern ? (
                    <Flame className="w-4 h-4" />
                  ) : isReply ? (
                    <MessageSquare className="w-4 h-4" />
                  ) : isVerified ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isPattern
                            ? 'bg-amber-100 text-amber-900 font-semibold'
                            : isReply
                            ? 'bg-emerald-100 text-emerald-900 font-semibold'
                            : isVerified
                            ? 'bg-blue-100 text-blue-900 font-semibold'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {isPattern
                          ? 'Pattern Confirmed'
                          : isReply
                          ? 'Official Response'
                          : isVerified
                          ? 'Statutory Verification'
                          : 'New Citizen Report'}
                      </span>

                      {item.officeCountry && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                          {item.officeCountry}
                        </span>
                      )}
                    </div>

                    <span
                      className="text-[11px] text-[#8DA3A0] flex items-center gap-1 shrink-0"
                      suppressHydrationWarning
                    >
                      <Clock className="w-3 h-3" />
                      <span suppressHydrationWarning>
                        {isMounted ? formatTimeAgo(item.timestamp) : ''}
                      </span>
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#12211F] mt-1.5 leading-snug group-hover:text-[#1B6A58] transition-colors">
                    {item.title}
                  </h4>

                  {item.subtitle && (
                    <p className="text-xs text-[#5B6E6A] mt-0.5 leading-relaxed line-clamp-2">
                      {item.subtitle}
                    </p>
                  )}

                  {item.officeName && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-[#5B6E6A]">
                      <Building2 className="w-3 h-3 text-[#C97A2B]" />
                      <span className="truncate">{item.officeName}</span>
                      <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-60 group-hover:opacity-100" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Country Picker Modal */}
      <CountryPickerModal
        isOpen={showCountryPicker}
        onClose={() => setShowCountryPicker(false)}
        currentCountry={userCountry}
        offices={offices}
        onSelectCountry={handleCountrySelected}
      />
    </div>
  );
};

