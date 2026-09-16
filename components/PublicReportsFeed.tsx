'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Office, PublicReport, ReportStatus, ReportIssueType } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import {
  MessageSquareWarning,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ThumbsUp,
  Search,
  Building,
  Briefcase,
  Clock,
  Lock,
  Flame,
  X,
  FileText,
  Filter,
} from 'lucide-react';

interface PublicReportsFeedProps {
  initialOffice?: Office | null;
  onClearOfficeFilter?: () => void;
  onSelectOffice?: (officeId: string) => void;
}

type FilterTab = 'all' | 'pattern_confirmed' | 'responded' | 'unverified';

export const PublicReportsFeed: React.FC<PublicReportsFeedProps> = ({
  initialOffice,
  onClearOfficeFilter,
  onSelectOffice,
}) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<PublicReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [votedReportIds, setVotedReportIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let ignore = false;
    const fetchReports = async () => {
      try {
        const url = initialOffice
          ? `/api/reports?officeId=${encodeURIComponent(initialOffice.id)}`
          : '/api/reports';
        const res = await fetch(url);
        const json = await res.json();
        if (!ignore && json.success && Array.isArray(json.data)) {
          setReports(json.data);
        }
      } catch (err) {
        console.warn('Error fetching reports:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchReports();

    return () => {
      ignore = true;
    };
  }, [initialOffice]);

  const handleVoteHelpful = async (reportId: string) => {
    if (votedReportIds.has(reportId)) return;

    // Optimistic UI update
    setVotedReportIds((prev) => new Set(prev).add(reportId));
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
      )
    );

    try {
      const res = await fetch(`/api/reports/${reportId}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id || 'anonymous-citizen' }),
      });
      const json = await res.json();
      if (!json.success) {
        // Revert on error
        setVotedReportIds((prev) => {
          const next = new Set(prev);
          next.delete(reportId);
          return next;
        });
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId ? { ...r, helpfulCount: Math.max(0, r.helpfulCount - 1) } : r
          )
        );
      }
    } catch {
      // Revert
      setVotedReportIds((prev) => {
        const next = new Set(prev);
        next.delete(reportId);
        return next;
      });
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Tab filter
      if (activeTab !== 'all' && r.status !== activeTab) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesOffice = r.officeName?.toLowerCase().includes(q);
        const matchesService = r.serviceName?.toLowerCase().includes(q);
        const matchesIssue = r.issueType?.toLowerCase().includes(q);
        const matchesDetails = r.details?.toLowerCase().includes(q);
        return matchesOffice || matchesService || matchesIssue || matchesDetails;
      }
      return true;
    });
  }, [reports, activeTab, searchQuery]);

  const getIssueBadgeColor = (issue: ReportIssueType) => {
    switch (issue) {
      case 'bribe requested':
        return 'bg-[#FDF2F2] text-[#B53838] border-[#B53838]/30';
      case 'closed during posted hours':
        return 'bg-[#FFF7ED] text-[#C2410C] border-[#FB923C]/30';
      case 'extra undocumented requirement':
        return 'bg-[#FEF8F0] text-[#C97A2B] border-[#C97A2B]/30';
      case 'wrong info':
        return 'bg-[#F0FDF4] text-[#15803D] border-[#86EFAC]/30';
      default:
        return 'bg-[#F8FAFC] text-[#475569] border-[#CBD5E1]';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0F2A2E] text-white p-5 rounded-2xl border border-[#24545C] shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Civic Accountability Feed
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#1A454B] text-[#F3E4D2] border border-[#2E6872]">
              {reports.length} Reports Logged
            </span>
          </div>
          <p className="text-xs text-[#8DA3A0] mt-1 max-w-xl">
            Live public ledger of citizen reports, statutory discrepancy confirmations, and official
            institutional responses.
          </p>
        </div>

        {initialOffice && (
          <div className="flex items-center gap-2 bg-[#193F45] px-3 py-2 rounded-xl border border-[#2E6872] text-xs">
            <Building className="w-4 h-4 text-[#C97A2B]" />
            <span className="font-semibold text-white truncate max-w-xs">{initialOffice.name}</span>
            {onClearOfficeFilter && (
              <button
                onClick={onClearOfficeFilter}
                className="p-1 rounded hover:bg-[#23565F] text-[#8DA3A0] hover:text-white"
                title="Show all offices"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE4E2] pb-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              activeTab === 'all'
                ? 'bg-[#0F2A2E] text-white border-[#0F2A2E]'
                : 'bg-white text-[#5B6E6A] border-[#DDE4E2] hover:bg-[#F6F9F8]'
            }`}
          >
            All Reports ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('pattern_confirmed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              activeTab === 'pattern_confirmed'
                ? 'bg-[#C97A2B] text-white border-[#C97A2B]'
                : 'bg-white text-[#C97A2B] border-[#DDE4E2] hover:bg-[#FEF8F0]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Pattern Confirmed</span>
          </button>
          <button
            onClick={() => setActiveTab('responded')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              activeTab === 'responded'
                ? 'bg-[#287258] text-white border-[#287258]'
                : 'bg-white text-[#287258] border-[#DDE4E2] hover:bg-[#EFF8F4]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Responded</span>
          </button>
          <button
            onClick={() => setActiveTab('unverified')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              activeTab === 'unverified'
                ? 'bg-[#5B6E6A] text-white border-[#5B6E6A]'
                : 'bg-white text-[#5B6E6A] border-[#DDE4E2] hover:bg-[#F6F9F8]'
            }`}
          >
            Unverified
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#5B6E6A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports or office..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#DDE4E2] rounded-lg focus:outline-none focus:border-[#C97A2B] text-[#12211F] placeholder:text-[#8DA3A0]"
          />
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#5B6E6A] space-y-2">
          <div className="inline-block w-6 h-6 border-2 border-[#C97A2B] border-t-transparent rounded-full animate-spin" />
          <p>Loading civic ledger records...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#DDE4E2] text-[#5B6E6A] space-y-2">
          <FileText className="w-8 h-8 text-[#8DA3A0] mx-auto" />
          <p className="text-sm font-semibold text-[#12211F]">No reports found matching criteria</p>
          <p className="text-xs text-[#5B6E6A]">
            Try adjusting your search terms or selecting a different status filter tab.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const hasResponded = !!report.officialReply;
            const isPatternConfirmed = report.status === 'pattern_confirmed';

            return (
              <div
                key={report.id}
                id={`report-card-${report.id}`}
                className={`bg-white rounded-2xl border p-4 sm:p-5 space-y-4 shadow-xs transition-all ${
                  isPatternConfirmed
                    ? 'border-[#E5A358] ring-1 ring-[#C97A2B]/30'
                    : 'border-[#DDE4E2] hover:border-[#B7C7C3]'
                }`}
              >
                {/* Header: Office & Issue */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${getIssueBadgeColor(
                          report.issueType
                        )}`}
                      >
                        {report.issueType}
                      </span>

                      {isPatternConfirmed && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#FEF8F0] text-[#9C5A18] border border-[#F0D5B5]">
                          <Flame className="w-3.5 h-3.5 text-[#C97A2B]" />
                          Pattern Confirmed (3+ Reports)
                        </span>
                      )}

                      {hasResponded && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#EFF8F4] text-[#19433B] border border-[#287258]/30">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#287258]" />
                          Official Response Posted
                        </span>
                      )}
                    </div>

                    <div className="pt-1">
                      <h3 className="text-sm font-bold text-[#12211F] leading-tight flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#C97A2B] shrink-0" />
                        <span>{report.officeName || 'Civic Office'}</span>
                      </h3>
                      {report.serviceName && (
                        <p className="text-xs text-[#5B6E6A] flex items-center gap-1.5 mt-0.5">
                          <Briefcase className="w-3 h-3 text-[#5B6E6A]" />
                          <span>{report.serviceName}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date & Citizen Tag */}
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-[#5B6E6A] block" suppressHydrationWarning>
                      {new Date(report.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#287258] font-medium bg-[#EFF8F4] px-1.5 py-0.2 rounded border border-[#287258]/20 mt-1">
                      <Lock className="w-2.5 h-2.5" />
                      {report.anonymous ? 'Anonymous Citizen' : 'Citizen Submitter'}
                    </span>
                  </div>
                </div>

                {/* Details */}
                {report.details && (
                  <p className="text-xs text-[#334642] leading-relaxed bg-[#F8FAFA] p-3 rounded-xl border border-[#E9EFEF]">
                    &ldquo;{report.details}&rdquo;
                  </p>
                )}

                {/* Pattern Confirmed Detail Banner */}
                {isPatternConfirmed && !hasResponded && (
                  <div className="p-3 rounded-xl bg-[#FEF8F0] border border-[#F0D5B5] text-xs text-[#7A4B1A] flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#C97A2B] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-[#9C5A18]">
                        High Reliability Civic Pattern
                      </span>
                      <span className="text-[11px] text-[#7A4B1A] leading-snug">
                        Civora algorithmic verification detected 3 or more consistent discrepancies
                        filed for this exact service and location within the last 30 days.
                      </span>
                    </div>
                  </div>
                )}

                {/* Official Institutional Reply (If present) */}
                {report.officialReply && (
                  <div className="p-4 rounded-xl bg-[#EFF8F4] border border-[#B8DFD1] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-[#19433B]">
                        <ShieldCheck className="w-4 h-4 text-[#287258]" />
                        <span>Official Response: {report.officialReply.officeName}</span>
                      </div>
                      <span className="text-[10px] text-[#4A6E64]" suppressHydrationWarning>
                        {new Date(report.officialReply.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-[#20493E] leading-relaxed pl-5 border-l-2 border-[#287258]/30">
                      {report.officialReply.text}
                    </p>
                    {report.officialReply.replierEmail && (
                      <div className="text-[10px] text-[#557D73] pl-5">
                        Verified Sign-off: {report.officialReply.replierEmail}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Actions: Helpful Upvote */}
                <div className="flex items-center justify-between pt-1 border-t border-[#E9EFEF] text-xs text-[#5B6E6A]">
                  <div className="text-[11px] font-mono text-[#8DA3A0]">
                    Ref: {report.id}
                  </div>

                  <button
                    onClick={() => handleVoteHelpful(report.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                      votedReportIds.has(report.id)
                        ? 'bg-[#EFF8F4] text-[#287258] border-[#287258]/30'
                        : 'bg-white text-[#5B6E6A] border-[#DDE4E2] hover:bg-[#F6F9F8] hover:text-[#12211F]'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Helpful ({report.helpfulCount})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
