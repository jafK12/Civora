'use client';

import React, { useState } from 'react';
import { Office, Service } from '@/lib/types';
import { useTranslation } from '@/context/LanguageContext';
import {
  X,
  Building2,
  MapPin,
  Clock,
  FileCheck,
  Coins,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquareWarning,
} from 'lucide-react';

interface OfficeDetailSheetProps {
  office: Office | null;
  services: Service[];
  onClose: () => void;
  onReportPress: (service: Service, office: Office) => void;
  onOpenReportsFeed: (office: Office) => void;
}

export const OfficeDetailSheet: React.FC<OfficeDetailSheetProps> = ({
  office,
  services,
  onClose,
  onReportPress,
  onOpenReportsFeed,
}) => {
  const { t } = useTranslation();
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

  if (!office) return null;

  const officeServices = services.filter((s) => office.serviceIds.includes(s.id));

  const getOfficeLevelBadge = (level: Office['officeLevel']) => {
    switch (level) {
      case 'district':
        return 'bg-[#2D2316] text-[#E5A358] border-[#C97A2B]/40';
      case 'regional':
        return 'bg-[#1D2A3A] text-sky-300 border-sky-500/30';
      case 'local':
      default:
        return 'bg-[#18312B] text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div
      id="office-detail-sheet"
      className="fixed inset-x-0 bottom-0 lg:bottom-4 lg:right-6 lg:left-auto lg:w-[480px] max-h-[85vh] lg:max-h-[calc(100vh-140px)] z-40 bg-white rounded-t-2xl lg:rounded-2xl shadow-2xl border border-[#DDE4E2] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300"
    >
      {/* Drag handle for mobile */}
      <div className="w-full flex justify-center pt-2 pb-1 lg:hidden">
        <div className="w-12 h-1.5 rounded-full bg-slate-300" />
      </div>

      {/* Office Header */}
      <div className="p-4 sm:p-5 bg-[#0F2A2E] text-white border-b border-[#24545C]">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border uppercase tracking-wider ${getOfficeLevelBadge(
                  office.officeLevel
                )}`}
              >
                {office.officeLevel} office
              </span>
              <span className="text-xs text-[#8DA3A0]">
                {officeServices.length} {t.officeDetail.verifiedCount}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {office.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-[#B2C6C2] pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#C97A2B] shrink-0" />
              <span className="truncate">{office.address}</span>
            </div>
          </div>

          <button
            id="close-detail-sheet-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#193F45] text-[#A6BFBB] hover:text-white hover:bg-[#23565F] transition-colors"
            title={t.officeDetail.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar for Office */}
        <div className="mt-4 pt-3 border-t border-[#24545C]/60 flex items-center justify-between gap-2">
          <button
            id="view-office-reports-btn"
            onClick={() => onOpenReportsFeed(office)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#193F45] hover:bg-[#215159] text-xs font-semibold text-[#F3E4D2] transition-colors border border-[#2B6069]"
          >
            <MessageSquareWarning className="w-3.5 h-3.5 text-[#C97A2B]" />
            <span>{t.officeDetail.reportsForOffice}</span>
          </button>

          <span className="text-[11px] text-[#8DA3A0] italic">
            {t.officeDetail.tapToInspect}
          </span>
        </div>
      </div>

      {/* Services List Scroll Area */}
      <div className="overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#F8FAFA] flex-1">
        <div className="text-xs font-bold uppercase tracking-wider text-[#5B6E6A] px-1">
          {t.officeDetail.verifiedTariffs}
        </div>

        {officeServices.map((service) => {
          const isExpanded = expandedServiceId === service.id;

          return (
            <div
              key={service.id}
              id={`service-item-${service.id}`}
              className="bg-white rounded-xl border border-[#DDE4E2] overflow-hidden shadow-xs hover:border-[#B7C7C3] transition-colors"
            >
              {/* Service Summary Click Header */}
              <div
                onClick={() => setExpandedServiceId(isExpanded ? null : service.id)}
                className="p-3.5 cursor-pointer flex items-start justify-between gap-3 select-none"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EFF8F4] text-[#287258] border border-[#287258]/20">
                      {service.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#12211F] leading-tight">
                    {service.name}
                  </h3>
                  {/* Verified Fee Callout */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8B4800]">
                    <Coins className="w-3.5 h-3.5 text-[#C97A2B]" />
                    <span>{service.fee}</span>
                  </div>
                </div>

                <div className="p-1 text-[#5B6E6A]">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Expanded Detailed Requirements & Statutory Info */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-[#E9EFEF] space-y-3.5 bg-[#FAFDFD]">
                  {/* Service Hours */}
                  <div className="flex items-start gap-2 text-xs text-[#12211F]">
                    <Clock className="w-4 h-4 text-[#5B6E6A] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-[#12211F]">{t.officeDetail.hoursLabel}:</span>
                      <span className="text-[#5B6E6A]">{service.hours}</span>
                    </div>
                  </div>

                  {/* Required Documents Checklist */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#12211F]">
                      <FileCheck className="w-4 h-4 text-[#287258]" />
                      <span>{t.officeDetail.requirementsLabel}:</span>
                    </div>
                    <ul className="space-y-1 pl-5 list-disc text-xs text-[#334642]">
                      {service.requiredDocuments.map((doc, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Legal Source Citation & Last Verified Trust Badge */}
                  <div className="p-2.5 rounded-lg bg-[#F5F9F8] border border-[#DDE4E2] space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-[#19433B] font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#287258]" />
                      <span>{t.officeDetail.statutoryCitation}:</span>
                    </div>
                    <p className="text-[11px] text-[#4A5E5A] italic leading-snug pl-5">
                      {service.source}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B4800] bg-[#F3E4D2] px-2 py-0.5 rounded border border-[#C97A2B]/30">
                        {t.officeDetail.lastVerified}: {service.lastVerified}
                      </span>
                    </div>
                  </div>

                  {/* Report Discrepancy Button */}
                  <div className="pt-1">
                    <button
                      id={`report-discrepancy-btn-${service.id}`}
                      onClick={() => onReportPress(service, office)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#B53838] hover:bg-[#9B2A2A] text-white text-xs font-semibold transition-colors shadow-xs"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-white" />
                      <span>{t.officeDetail.reportDiscrepancy}</span>
                    </button>
                    <p className="text-[10px] text-center text-[#5B6E6A] mt-1">
                      Anonymous mode defaults to ON • No personal info required
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
