'use client';

import React, { useState } from 'react';
import { Office, Service, ReportIssueType, PublicReport } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import {
  X,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  FileWarning,
  Building,
  Briefcase,
  Layers,
} from 'lucide-react';

interface ReportModalProps {
  visible: boolean;
  office: Office | null;
  service: Service | null;
  onClose: () => void;
  onReportSubmitted: (report: PublicReport) => void;
}

const ISSUE_OPTIONS: { type: ReportIssueType; label: string; description: string }[] = [
  {
    type: 'wrong info',
    label: 'Incorrect Information',
    description: 'Published statutory fees, working hours, or procedures mismatch reality',
  },
  {
    type: 'bribe requested',
    label: 'Bribe or Irregular Fee Requested',
    description: 'Staff demanded informal payments, cash kickbacks, or facilitation fees',
  },
  {
    type: 'closed during posted hours',
    label: 'Closed During Posted Working Hours',
    description: 'Service counters were deserted, locked, or closed prematurely',
  },
  {
    type: 'extra undocumented requirement',
    label: 'Extra Undocumented Requirements',
    description: 'Staff demanded arbitrary unlisted affidavits, photos, or documents',
  },
  {
    type: 'other',
    label: 'Other Service Delivery Issue',
    description: 'Unwarranted delays, disrespectful treatment, or arbitrary denial of service',
  },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  office,
  service,
  onClose,
  onReportSubmitted,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [issueType, setIssueType] = useState<ReportIssueType>('wrong info');
  const [details, setDetails] = useState<string>('');
  const [anonymous, setAnonymous] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] = useState<PublicReport | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState<boolean>(false);

  const getIssueLabel = (type: ReportIssueType) => {
    switch (type) {
      case 'wrong info':
        return t.issues.wrongInfo;
      case 'bribe requested':
        return t.issues.bribeRequested;
      case 'closed during posted hours':
        return t.issues.closedHours;
      case 'extra undocumented requirement':
        return t.issues.extraRequirement;
      case 'other':
      default:
        return t.issues.other;
    }
  };

  if (!visible || !office || !service) return null;

  const handleResetAndClose = () => {
    setIssueType('wrong info');
    setDetails('');
    setAnonymous(true);
    setIsSubmitting(false);
    setErrorMessage(null);
    setSubmittedReport(null);
    setCopiedReceipt(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officeId: office.id,
          serviceId: service.id,
          officeName: office.name,
          serviceName: service.name,
          issueType,
          details: details.trim(),
          anonymous,
          submitterId: user.id || 'demo-citizen-anon',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMessage(json.error || 'Failed to submit report. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setSubmittedReport(json.data);
      onReportSubmitted(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error submitting report.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReceiptId = () => {
    if (submittedReport) {
      navigator.clipboard.writeText(submittedReport.id);
      setCopiedReceipt(true);
      setTimeout(() => setCopiedReceipt(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1A1C]/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#DDE4E2] shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#0F2A2E] text-white border-b border-[#24545C] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#B53838]/20 border border-[#B53838]/40 text-[#E57A7A]">
              <AlertTriangle className="w-5 h-5 text-[#E57A7A]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {submittedReport ? 'Civic Receipt Issued' : 'File Discrepancy Report'}
              </h2>
              <p className="text-xs text-[#8DA3A0]">
                {submittedReport
                  ? 'Your submission is recorded in the public transparency ledger'
                  : 'Report unauthorized fees, unlisted requirements, or closures'}
              </p>
            </div>
          </div>
          <button
            id="close-report-modal-btn"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg bg-[#193F45] text-[#A6BFBB] hover:text-white hover:bg-[#23565F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm flex-1">
          {submittedReport ? (
            /* Digital Civic Receipt Screen */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#EFF8F4] border border-[#287258]/30 text-[#19433B] space-y-3">
                <div className="flex items-center gap-2 text-[#287258] font-bold">
                  <CheckCircle2 className="w-5 h-5 text-[#287258]" />
                  <span>Report Successfully Registered</span>
                </div>
                <p className="text-xs text-[#335951] leading-relaxed">
                  Thank you for contributing to public service transparency. Your report has been
                  indexed in the Civora accountability ledger.
                </p>

                {/* Receipt Code Box */}
                <div className="p-3 bg-white rounded-lg border border-[#B8DFD1] flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5B6E6A] block">
                      Civic Receipt Reference:
                    </span>
                    <span className="font-mono text-sm font-bold text-[#12211F]">
                      {submittedReport.id}
                    </span>
                  </div>
                  <button
                    onClick={copyReceiptId}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#E4F4ED] hover:bg-[#D1ECE1] text-xs font-semibold text-[#1F5F49] transition-colors"
                  >
                    {copiedReceipt ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#287258]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Pattern Detection Notice */}
              <div className="p-3.5 rounded-xl bg-[#FEF8F0] border border-[#F0D5B5] text-xs text-[#7A4B1A] space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-[#9C5A18]">
                  <ShieldCheck className="w-4 h-4 text-[#C97A2B]" />
                  <span>Automated Pattern Detection</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#7A4B1A]">
                  When 3 or more independent citizen reports document the same discrepancy within 30
                  days, Civora automatically flags the office as{' '}
                  <strong className="font-semibold text-[#9C5A18]">Pattern Confirmed</strong> and
                  notifies the municipal inspectorate.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  id="done-report-receipt-btn"
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 rounded-lg bg-[#0F2A2E] hover:bg-[#184248] text-white text-xs font-semibold transition-colors"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Context Header: Office & Service */}
              <div className="p-3 rounded-xl bg-[#F6F9F8] border border-[#DDE4E2] text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-[#12211F] font-bold">
                  <Building className="w-3.5 h-3.5 text-[#C97A2B]" />
                  <span className="truncate">{office.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#5B6E6A]">
                  <Briefcase className="w-3.5 h-3.5 text-[#5B6E6A]" />
                  <span className="truncate">{service.name}</span>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-[#FDF2F2] border border-[#EAA2A2] text-xs text-[#992222] flex items-start gap-2">
                  <FileWarning className="w-4 h-4 text-[#B53838] shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Issue Category Radio List */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#12211F] block">
                  Select Issue Type <span className="text-[#B53838]">*</span>
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {ISSUE_OPTIONS.map((opt) => {
                    const isSelected = issueType === opt.type;
                    return (
                      <div
                        key={opt.type}
                        onClick={() => setIssueType(opt.type)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-colors flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-[#FDF6ED] border-[#C97A2B] text-[#12211F]'
                            : 'bg-white border-[#DDE4E2] text-[#334642] hover:bg-[#F9FCFC]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="issueType"
                          checked={isSelected}
                          onChange={() => setIssueType(opt.type)}
                          className="mt-0.5 accent-[#C97A2B]"
                        />
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold block leading-tight text-[#12211F]">
                            {getIssueLabel(opt.type)}
                          </span>
                          <span className="text-[11px] text-[#5B6E6A] leading-normal block">
                            {opt.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Details Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#12211F] block">
                  Specific Observation Details <span className="text-[#5B6E6A] font-normal">(optional)</span>
                </label>
                <textarea
                  id="report-details-textarea"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Describe what occurred, what was requested or charged, or how long the counter was closed..."
                  rows={3}
                  className="w-full p-2.5 text-xs text-[#12211F] bg-white border border-[#DDE4E2] rounded-lg focus:outline-none focus:border-[#C97A2B] focus:ring-1 focus:ring-[#C97A2B] placeholder:text-[#8DA3A0]"
                />
              </div>

              {/* Anonymous Mode Privacy Toggle */}
              <div className="p-3 rounded-xl bg-[#F6F9F8] border border-[#DDE4E2] flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#12211F]">
                    <Lock className="w-3.5 h-3.5 text-[#287258]" />
                    <span>Submit Anonymously</span>
                    <span className="text-[10px] font-semibold text-[#287258] bg-[#EFF8F4] px-1.5 py-0.2 rounded border border-[#287258]/20">
                      Default ON
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5B6E6A] leading-snug">
                    Your personal profile name is stripped before publishing to the civic ledger.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#287258]"></div>
                </label>
              </div>

              {/* Submit & Cancel Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 rounded-lg border border-[#DDE4E2] text-xs font-semibold text-[#5B6E6A] hover:bg-[#F0F4F3] transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit-discrepancy-report-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#B53838] hover:bg-[#9B2A2A] text-white text-xs font-semibold transition-colors disabled:opacity-50 shadow-xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Registering...' : 'Submit Report'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
