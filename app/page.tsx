'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { CivicHeader } from '@/components/CivicHeader';
import { BottomTabBar, ActiveTab } from '@/components/BottomTabBar';
import { DashboardFeed } from '@/components/DashboardFeed';
import { CategoryFilter } from '@/components/CategoryFilter';
import { CivicMap } from '@/components/CivicMap';
import { OfficeDetailSheet } from '@/components/OfficeDetailSheet';
import { ReportModal } from '@/components/ReportModal';
import { PublicReportsFeed } from '@/components/PublicReportsFeed';
import { ProfileScreen } from '@/components/ProfileScreen';
import { AuthModal } from '@/components/AuthModal';
import { CountryPickerModal, CountryConfirmationConfig } from '@/components/CountryPickerModal';
import { MOCK_OFFICES, MOCK_SERVICES } from '@/lib/data/mockData';
import { Office, Service, ServiceCategory, PublicReport } from '@/lib/types';

function CivoraMainApp() {
  const { user, updateUserCountry } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('All Services');
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [feedOffice, setFeedOffice] = useState<Office | null>(null);

  // Auth & Country Picker Modals
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showCountryPicker, setShowCountryPicker] = useState<boolean>(false);
  const [countryConfirmationConfig, setCountryConfirmationConfig] =
    useState<CountryConfirmationConfig | null>(null);

  const [reportingTarget, setReportingTarget] = useState<{
    office: Office;
    service: Service;
  } | null>(null);

  const [reportsList, setReportsList] = useState<PublicReport[]>([]);
  const [reportsCount, setReportsCount] = useState<number>(0);

  const loadReports = () => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setReportsList(json.data);
          setReportsCount(json.data.length);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    let active = true;
    fetch('/api/reports')
      .then((res) => res.json())
      .then((json) => {
        if (active && json.success && Array.isArray(json.data)) {
          setReportsList(json.data);
          setReportsCount(json.data.length);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // Filter offices by category
  const filteredOffices = useMemo(() => {
    if (selectedCategory === 'All Services') {
      return MOCK_OFFICES;
    }

    const categoryServices = MOCK_SERVICES.filter(
      (srv) => srv.category === selectedCategory
    );
    const validServiceIds = new Set(categoryServices.map((s) => s.id));

    return MOCK_OFFICES.filter((office) =>
      office.serviceIds.some((id) => validServiceIds.has(id))
    );
  }, [selectedCategory]);

  const handleSelectOffice = (office: Office) => {
    setSelectedOffice(office);
  };

  const handleDismissSheet = () => {
    setSelectedOffice(null);
  };

  const handleOpenReport = (service: Service, office: Office) => {
    setReportingTarget({ service, office });
  };

  const handleCloseReport = () => {
    setReportingTarget(null);
  };

  const handleReportSubmitted = (_newReport: PublicReport) => {
    loadReports();
  };

  const handleOpenReportsFeedForOffice = (office: Office) => {
    setFeedOffice(office);
    setSelectedOffice(null);
    setActiveTab('reports');
  };

  return (
    <div className="min-h-screen bg-[#F6F9F8] text-[#12211F] flex flex-col font-sans">
      {/* 1. Thin Top Header: Civora brand mark + Live Civic Registry status pill & Auth trigger */}
      <CivicHeader
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenCountryPicker={() => {
          setCountryConfirmationConfig(null);
          setShowCountryPicker(true);
        }}
      />

      {/* 2. Main Tab Views */}
      <div className="flex-1 flex flex-col">
        {/* TAB 1: DASHBOARD FEED */}
        {activeTab === 'dashboard' && (
          <main className="flex-1 bg-[#F8FAFA]">
            <DashboardFeed
              reports={reportsList}
              offices={MOCK_OFFICES}
              services={MOCK_SERVICES}
              onSelectOffice={(office) => {
                setSelectedOffice(office);
                setActiveTab('map');
              }}
              onSelectReport={(reportId) => {
                const report = reportsList.find((r) => r.id === reportId);
                if (report?.officeId) {
                  const office = MOCK_OFFICES.find((o) => o.id === report.officeId);
                  if (office) {
                    setFeedOffice(office);
                  }
                }
                setActiveTab('reports');
              }}
            />
          </main>
        )}

        {/* TAB 2: MAP */}
        {activeTab === 'map' && (
          <main className="flex-1 flex flex-col pb-16">
            {/* Category Filter Bar */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                if (selectedOffice && cat !== 'All Services') {
                  const offers = selectedOffice.serviceIds.some((srvId) => {
                    const s = MOCK_SERVICES.find((ms) => ms.id === srvId);
                    return s?.category === cat;
                  });
                  if (!offers) {
                    setSelectedOffice(null);
                  }
                }
              }}
              filteredCount={filteredOffices.length}
            />

            {/* Map Surface with Overlaid Bottom Sheet */}
            <div className="relative flex-1">
              <CivicMap
                offices={filteredOffices}
                selectedOffice={selectedOffice}
                onSelectOffice={handleSelectOffice}
                onDismiss={handleDismissSheet}
              />

              {/* Office Detail Sheet */}
              <OfficeDetailSheet
                office={selectedOffice}
                services={MOCK_SERVICES}
                onClose={handleDismissSheet}
                onReportPress={handleOpenReport}
                onOpenReportsFeed={handleOpenReportsFeedForOffice}
              />
            </div>
          </main>
        )}

        {/* TAB 3: REPORTS FEED */}
        {activeTab === 'reports' && (
          <main className="flex-1 bg-[#F4F8F7] pb-16">
            <PublicReportsFeed
              initialOffice={feedOffice}
              onClearOfficeFilter={() => setFeedOffice(null)}
              onSelectOffice={(officeId) => {
                const off = MOCK_OFFICES.find((o) => o.id === officeId);
                if (off) setFeedOffice(off);
              }}
            />
          </main>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && (
          <main className="flex-1 bg-[#F8FAFA] pb-16">
            <ProfileScreen onOpenAuth={() => setShowAuthModal(true)} />
          </main>
        )}
      </div>

      {/* 3. Bottom Tab Bar Navigation with 4 tabs */}
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'reports') {
            setFeedOffice(null);
          }
        }}
        reportsBadgeCount={reportsCount}
      />

      {/* Report Discrepancy Modal */}
      <ReportModal
        visible={reportingTarget !== null}
        office={reportingTarget?.office ?? null}
        service={reportingTarget?.service ?? null}
        onClose={handleCloseReport}
        onReportSubmitted={handleReportSubmitted}
      />

      {/* Citizen Authentication & Sign-in Modal */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onResetSeed={loadReports}
        onOpenCountryConfirmation={(config) => {
          setCountryConfirmationConfig(config);
          setShowCountryPicker(true);
        }}
      />

      {/* Country Picker & Confirmation Modal */}
      <CountryPickerModal
        isOpen={showCountryPicker}
        onClose={() => {
          setShowCountryPicker(false);
          setCountryConfirmationConfig(null);
        }}
        currentCountry={user.country}
        offices={MOCK_OFFICES}
        confirmationConfig={countryConfirmationConfig}
        onSelectCountry={async (country) => {
          await updateUserCountry(country);
        }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <CivoraMainApp />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

