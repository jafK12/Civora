'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { useTheme, AppTheme } from '@/context/ThemeContext';
import { SupportedLanguage } from '@/lib/types';
import {
  X,
  ChevronRight,
  User,
  Globe2,
  Moon,
  Sun,
  HelpCircle,
  FileText,
  ShieldCheck,
  LifeBuoy,
  LogOut,
  Trash2,
  ArrowLeft,
  Building2,
  Check,
  AlertTriangle,
  Send,
  ExternalLink,
  Lock,
  CheckCircle2,
} from 'lucide-react';

export type SettingsSubScreen =
  | 'menu'
  | 'profile'
  | 'language'
  | 'theme'
  | 'faq'
  | 'about'
  | 'terms'
  | 'privacy'
  | 'support';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenAuthModal: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onOpenAuthModal,
}) => {
  const { user, setUser, switchUser } = useAuth();
  const { t, currentLanguage, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();

  const [activeScreen, setActiveScreen] = useState<SettingsSubScreen>('menu');

  // Profile Edit State
  const [fullName, setFullName] = useState<string>(user.fullName || '');
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [profileSavedToast, setProfileSavedToast] = useState<boolean>(false);

  // Support Form State
  const [supportMessage, setSupportMessage] = useState<string>('');
  const [supportEmail, setSupportEmail] = useState<string>(user.email || '');
  const [submittingSupport, setSubmittingSupport] = useState<boolean>(false);
  const [supportSuccess, setSupportSuccess] = useState<boolean>(false);

  // Delete Account Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deletingAccount, setDeletingAccount] = useState<boolean>(false);
  const [deleteComplete, setDeleteComplete] = useState<boolean>(false);

  if (!visible) return null;

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, fullName: fullName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setUser({ ...user, fullName: fullName.trim() });
        setProfileSavedToast(true);
        setTimeout(() => setProfileSavedToast(false), 3000);
      }
    } catch {
      // Offline fallback
      setUser({ ...user, fullName: fullName.trim() });
      setProfileSavedToast(true);
      setTimeout(() => setProfileSavedToast(false), 3000);
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Support Request Submission
  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSubmittingSupport(true);
    try {
      await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          contactEmail: supportEmail.trim(),
          message: supportMessage.trim(),
        }),
      });
      setSupportSuccess(true);
      setSupportMessage('');
      setTimeout(() => setSupportSuccess(false), 4000);
    } catch {
      setSupportSuccess(true);
    } finally {
      setSubmittingSupport(false);
    }
  };

  // Handle Account Deletion
  const handleExecuteDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
    } catch {
      // Continue cleanup
    } finally {
      setDeletingAccount(false);
      setDeleteComplete(true);
      setTimeout(() => {
        setDeleteComplete(false);
        setShowDeleteModal(false);
        onClose();
        // Reset to default anonymous/citizen demo
        switchUser('demo-citizen-003');
      }, 2000);
    }
  };

  // Render Sub-screen Headers
  const renderScreenHeader = (title: string) => (
    <div className="flex items-center gap-3 p-4 bg-[#0F2A2E] text-white border-b border-[#24545C]">
      <button
        id="settings-sub-back-btn"
        onClick={() => setActiveScreen('menu')}
        className="p-1.5 rounded-lg bg-[#193F45] text-[#A6BFBB] hover:text-white hover:bg-[#23565F] transition-colors"
        title="Back to Settings"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-0 sm:p-4 bg-[#0A1A1C]/80 backdrop-blur-xs">
      {/* Slide-over Container */}
      <div
        id="settings-slide-over-drawer"
        className="w-full sm:max-w-md h-full sm:h-[92vh] bg-white rounded-none sm:rounded-2xl border border-[#DDE4E2] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-250"
      >
        {/* Top Fixed Drawer Header */}
        {activeScreen === 'menu' ? (
          <div className="p-5 bg-[#0F2A2E] text-white border-b border-[#24545C] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#193F45] border border-[#2B6069] flex items-center justify-center text-[#C97A2B]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">{t.settings.title}</h2>
                <p className="text-xs text-[#8DA3A0]">{t.settings.subtitle}</p>
              </div>
            </div>
            <button
              id="close-settings-drawer-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#193F45] text-[#A6BFBB] hover:text-white hover:bg-[#23565F] transition-colors"
              title="Close Settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : null}

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFA]">
          {/* ============================================================= */}
          {/* SCREEN: MAIN MENU                                             */}
          {/* ============================================================= */}
          {activeScreen === 'menu' && (
            <div className="p-4 sm:p-5 space-y-4">
              {/* Profile Card Preview */}
              <div
                onClick={() => setActiveScreen('profile')}
                className="p-4 bg-white rounded-xl border border-[#DDE4E2] shadow-2xs hover:border-[#287258] transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#EBF5F1] text-[#287258] border border-[#287258]/30 flex items-center justify-center font-bold text-base">
                    {(user.fullName || user.email)[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#12211F]">
                      {user.fullName || 'Anonymous Citizen'}
                    </h4>
                    <p className="text-xs text-[#5B6E6A]">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {t.profileSection.citizenRole}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#8DA3A0]" />
              </div>

              {/* Settings Nav Rows */}
              <div className="bg-white rounded-xl border border-[#DDE4E2] shadow-2xs divide-y divide-[#EBF0EF] overflow-hidden">
                {/* 1. Profile */}
                <button
                  id="settings-row-profile"
                  onClick={() => setActiveScreen('profile')}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F4F8F7] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-[#287258]" />
                    <span className="text-sm font-medium text-[#12211F]">{t.settings.profile}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8DA3A0]" />
                </button>

                {/* 2. Language */}
                <button
                  id="settings-row-language"
                  onClick={() => setActiveScreen('language')}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F4F8F7] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Globe2 className="w-4 h-4 text-sky-600" />
                    <div>
                      <span className="text-sm font-medium text-[#12211F] block">{t.settings.language}</span>
                      <span className="text-xs text-[#5B6E6A]">
                        {currentLanguage === 'en'
                          ? 'English'
                          : currentLanguage === 'am'
                          ? 'አማርኛ (Amharic)'
                          : 'Afaan Oromoo'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8DA3A0]" />
                </button>

                {/* 3. Theme */}
                <button
                  id="settings-row-theme"
                  onClick={() => setActiveScreen('theme')}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F4F8F7] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? (
                      <Moon className="w-4 h-4 text-indigo-500" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-500" />
                    )}
                    <div>
                      <span className="text-sm font-medium text-[#12211F] block">{t.settings.theme}</span>
                      <span className="text-xs text-[#5B6E6A]">
                        {theme === 'dark' ? t.settings.darkTheme : t.settings.lightTheme}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8DA3A0]" />
                </button>
              </div>

              {/* Informational / Static Rows */}
              <div className="bg-white rounded-xl border border-[#DDE4E2] shadow-2xs divide-y divide-[#EBF0EF] overflow-hidden">
                {/* 4. FAQ */}
                <button
                  id="settings-row-faq"
                  onClick={() => setActiveScreen('faq')}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F4F8F7] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-[#C97A2B]" />
                    <span className="text-sm font-medium text-[#12211F]">{t.settings.faq}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8DA3A0]" />
                </button>

                {/* 5. About Us */}
                <button
                  id="settings-row-about"
                  onClick={() => setActiveScreen('about')}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F4F8F7] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-[#287258]" />
                    <span className="text-sm font-medium text-[#12211F]">{t.settings.aboutUs}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8DA3A0]" />
                </button>

                {/* 6. Terms & Conditions */}
                <button
                  id="settings-row-terms"
                  onClick={() => setActiveScreen('terms')}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F4F8F7] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-[#12211F]">{t.settings.terms}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8DA3A0]" />
                </button>

                {/* 7. Privacy Policy */}
                <button
                  id="settings-row-privacy"
                  onClick={() => setActiveScreen('privacy')}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F4F8F7] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-[#287258]" />
                    <span className="text-sm font-medium text-[#12211F]">{t.settings.privacy}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8DA3A0]" />
                </button>
              </div>

              {/* Action Rows */}
              <div className="bg-white rounded-xl border border-[#DDE4E2] shadow-2xs divide-y divide-[#EBF0EF] overflow-hidden">
                {/* 8. Support */}
                <button
                  id="settings-row-support"
                  onClick={() => setActiveScreen('support')}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F4F8F7] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <LifeBuoy className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-medium text-[#12211F]">{t.settings.support}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8DA3A0]" />
                </button>

                {/* 9. Switch Persona / Log Out */}
                <button
                  id="settings-row-logout"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal();
                  }}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F4F8F7] transition-colors text-left text-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium">{t.settings.logout} / Persona</span>
                  </div>
                  <span className="text-xs text-[#5B6E6A]">Switch</span>
                </button>
              </div>

              {/* Danger Zone: Delete Account */}
              <div className="pt-2">
                <button
                  id="settings-row-delete-account"
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full px-4 py-3 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>{t.settings.deleteAccount}</span>
                </button>
              </div>

              {/* Version & Notice Footer */}
              <div className="text-center pt-3 pb-2 text-[11px] text-[#8DA3A0]">
                Civora Service Navigator v1.2 (Civic Tech PoC)
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* SCREEN: 1. PROFILE                                            */}
          {/* ============================================================= */}
          {activeScreen === 'profile' && (
            <div className="flex flex-col h-full">
              {renderScreenHeader(t.settings.profile)}
              <div className="p-5 space-y-5 flex-1">
                {profileSavedToast && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{t.profileSection.savedSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#12211F] block">
                      {t.profileSection.fullNameLabel}
                    </label>
                    <input
                      id="profile-fullname-input"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Yonas Bekele"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#DDE4E2] bg-white text-sm text-[#12211F] focus:outline-none focus:ring-2 focus:ring-[#287258]"
                    />
                  </div>

                  {/* Email (Read-only) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#5B6E6A] block">
                      {t.profileSection.emailLabel}
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#DDE4E2] bg-[#F1F5F4] text-sm text-[#5B6E6A] cursor-not-allowed"
                    />
                  </div>

                  {/* Role Badge (Read-only) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#5B6E6A] block">
                      {t.profileSection.roleLabel}
                    </label>
                    <div className="p-3 rounded-lg bg-white border border-[#DDE4E2] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#8DA3A0]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#12211F]">
                          {t.profileSection.citizenRole}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8DA3A0] uppercase font-semibold">
                        Read-only
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8DA3A0] italic">
                      {t.profileSection.roleBadgeNote}
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      id="save-profile-btn"
                      type="submit"
                      disabled={savingProfile}
                      className="w-full py-2.5 px-4 rounded-lg bg-[#287258] hover:bg-[#1E5743] text-white text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {savingProfile ? 'Saving...' : t.profileSection.saveChanges}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* SCREEN: 2. LANGUAGE                                           */}
          {/* ============================================================= */}
          {activeScreen === 'language' && (
            <div className="flex flex-col h-full">
              {renderScreenHeader(t.settings.language)}
              <div className="p-5 space-y-3">
                <p className="text-xs text-[#5B6E6A]">
                  Select your interface language. Your selection is immediately applied and saved to your profile.
                </p>

                {/* Language Options */}
                <div className="space-y-2 pt-2">
                  {[
                    { code: 'en' as SupportedLanguage, label: 'English', native: 'English (US / International)' },
                    { code: 'am' as SupportedLanguage, label: 'አማርኛ', native: 'Amharic (Ethiopia)' },
                    { code: 'om' as SupportedLanguage, label: 'Afaan Oromoo', native: 'Oromiffa' },
                  ].map((lang) => {
                    const isSelected = currentLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        id={`language-option-${lang.code}`}
                        onClick={() => setLanguage(lang.code)}
                        className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-[#EBF5F1] border-[#287258] shadow-xs'
                            : 'bg-white border-[#DDE4E2] hover:border-[#A6BFBB]'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-bold text-[#12211F]">{lang.label}</div>
                          <div className="text-xs text-[#5B6E6A]">{lang.native}</div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[#287258] text-white flex items-center justify-center">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="p-3 mt-4 rounded-lg bg-[#FAF4ED] border border-[#E8D4BE] text-[11px] text-[#7A4514]">
                  <strong>Multilingual Note:</strong> Navigation, categories, service requirement labels, and report issue types adapt immediately. Municipal office titles reflect statutory Ethiopian administrative naming conventions.
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* SCREEN: 3. THEME                                              */}
          {/* ============================================================= */}
          {activeScreen === 'theme' && (
            <div className="flex flex-col h-full">
              {renderScreenHeader(t.settings.theme)}
              <div className="p-5 space-y-4">
                <p className="text-xs text-[#5B6E6A]">
                  Choose your display appearance. Theme preference is preserved locally in your browser session.
                </p>

                <div className="space-y-2.5">
                  <button
                    id="theme-light-btn"
                    onClick={() => setTheme('light')}
                    className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                      theme === 'light'
                        ? 'bg-[#FAF4ED] border-[#C97A2B] shadow-xs'
                        : 'bg-white border-[#DDE4E2] hover:border-[#A6BFBB]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                        <Sun className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#12211F]">{t.settings.lightTheme}</div>
                        <div className="text-xs text-[#5B6E6A]">Crisp contrast for daytime civic navigation</div>
                      </div>
                    </div>
                    {theme === 'light' && <Check className="w-5 h-5 text-[#C97A2B]" />}
                  </button>

                  <button
                    id="theme-dark-btn"
                    onClick={() => setTheme('dark')}
                    className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                      theme === 'dark'
                        ? 'bg-[#153B41] border-emerald-400 text-white shadow-xs'
                        : 'bg-white border-[#DDE4E2] hover:border-[#A6BFBB]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#0F2A2E] text-emerald-400">
                        <Moon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold">{t.settings.darkTheme}</div>
                        <div className="text-xs opacity-70">Dimmed palette for low-light environments</div>
                      </div>
                    </div>
                    {theme === 'dark' && <Check className="w-5 h-5 text-emerald-400" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* SCREEN: 4. FAQ (Hardcoded static content)                     */}
          {/* ============================================================= */}
          {activeScreen === 'faq' && (
            <div className="flex flex-col h-full">
              {renderScreenHeader(t.settings.faq)}
              <div className="p-5 space-y-4 text-xs">
                <div className="space-y-1.5 p-3.5 bg-white rounded-xl border border-[#DDE4E2]">
                  <h4 className="font-bold text-[#12211F] text-sm flex items-center gap-2">
                    <span className="text-[#C97A2B]">Q:</span> Is Civora an official government application?
                  </h4>
                  <p className="text-[#5B6E6A] leading-relaxed">
                    <strong>No.</strong> Civora is an independent civic transparency and public service navigation Proof-of-Concept (PoC). It is designed to bridge information asymmetries by publishing statutory legal requirements and crowd-verifying public service delivery.
                  </p>
                </div>

                <div className="space-y-1.5 p-3.5 bg-white rounded-xl border border-[#DDE4E2]">
                  <h4 className="font-bold text-[#12211F] text-sm flex items-center gap-2">
                    <span className="text-[#C97A2B]">Q:</span> Are my citizen reports truly anonymous?
                  </h4>
                  <p className="text-[#5B6E6A] leading-relaxed">
                    <strong>Yes.</strong> When submitting reports, your identity is not publicly linked to the complaint. Reports are categorized by issue type, timestamp, and office location to establish patterns of statutory irregularity without endangering citizens.
                  </p>
                </div>

                <div className="space-y-1.5 p-3.5 bg-white rounded-xl border border-[#DDE4E2]">
                  <h4 className="font-bold text-[#12211F] text-sm flex items-center gap-2">
                    <span className="text-[#C97A2B]">Q:</span> How do I become a verified Office Administrator?
                  </h4>
                  <p className="text-[#5B6E6A] leading-relaxed">
                    Municipal and district personnel submit an office administration request with official government credentials and employment verification. Verification is conducted by platform overseers before official reply rights are granted.
                  </p>
                </div>

                <div className="space-y-1.5 p-3.5 bg-white rounded-xl border border-[#DDE4E2]">
                  <h4 className="font-bold text-[#12211F] text-sm flex items-center gap-2">
                    <span className="text-[#C97A2B]">Q:</span> What should I do if an office demands an unlisted fee?
                  </h4>
                  <p className="text-[#5B6E6A] leading-relaxed">
                    Use the <em>&quot;Report Discrepancy / Irregularity&quot;</em> button on the office sheet. Select &quot;Bribe or Irregular Fee Requested&quot; or &quot;Extra Undocumented Requirements&quot; and cite the statutory proclamation published on the service card.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* SCREEN: 5. ABOUT US (Hardcoded static content)                */}
          {/* ============================================================= */}
          {activeScreen === 'about' && (
            <div className="flex flex-col h-full">
              {renderScreenHeader(t.settings.aboutUs)}
              <div className="p-5 space-y-4 text-xs leading-relaxed text-[#5B6E6A]">
                <div className="p-4 rounded-xl bg-[#0F2A2E] text-white space-y-2">
                  <h4 className="text-base font-bold text-[#F3E4D2]">Civora Service Navigator</h4>
                  <p className="text-xs text-[#A6BFBB]">
                    Empowering citizens through statutory clarity, fee transparency, and collective civic accountability across urban centers.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-[#DDE4E2] space-y-2">
                  <h5 className="font-bold text-sm text-[#12211F]">Our Mission</h5>
                  <p>
                    Every day, citizens navigating vital registrations, trade licenses, and land documentation encounter unlisted fee demands, outdated procedural checklists, and premature desk closures. Civora provides a unified, verified legal directory with real-time discrepancy reporting.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-[#DDE4E2] space-y-2">
                  <h5 className="font-bold text-sm text-[#12211F]">The Architecture of Civic Trust</h5>
                  <p>
                    Civora pairs crowd-sourced pattern recognition with statutory legal citations. When recurring issues are reported at a specific branch, public pattern indicators alert neighborhood residents and invite official administrative clarification.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* SCREEN: 6. TERMS & CONDITIONS (Hardcoded static content)      */}
          {/* ============================================================= */}
          {activeScreen === 'terms' && (
            <div className="flex flex-col h-full">
              {renderScreenHeader(t.settings.terms)}
              <div className="p-5 space-y-4 text-xs leading-relaxed text-[#5B6E6A]">
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-[11px]">
                  <strong>Proof-of-Concept Notice:</strong> Civora is developed for public research and civic transparency prototyping. It is not an agency of the federal or municipal government.
                </div>

                <div className="space-y-1.5 p-3.5 bg-white rounded-xl border border-[#DDE4E2]">
                  <h5 className="font-bold text-[#12211F] text-xs">1. Truthful Reporting Covenant</h5>
                  <p>
                    Citizens agree to submit factual reports based on direct experiences. Knowingly submitting defamatory statements, abusive insults, or falsified allegations violates community standards.
                  </p>
                </div>

                <div className="space-y-1.5 p-3.5 bg-white rounded-xl border border-[#DDE4E2]">
                  <h5 className="font-bold text-[#12211F] text-xs">2. Official Administrative Replies</h5>
                  <p>
                    Only authorized municipal delegates may submit official responses. Official responses must cite applicable regulatory directives or corrective measures taken.
                  </p>
                </div>

                <div className="space-y-1.5 p-3.5 bg-white rounded-xl border border-[#DDE4E2]">
                  <h5 className="font-bold text-[#12211F] text-xs">3. Public Ledger Immutability</h5>
                  <p>
                    Civic reports enter a collective public log. While users may delete their accounts and personal data at any time, public accountability observations remain preserved in anonymized form.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* SCREEN: 7. PRIVACY POLICY (Hardcoded static content)          */}
          {/* ============================================================= */}
          {activeScreen === 'privacy' && (
            <div className="flex flex-col h-full">
              {renderScreenHeader(t.settings.privacy)}
              <div className="p-5 space-y-4 text-xs leading-relaxed text-[#5B6E6A]">
                <div className="p-3.5 bg-white rounded-xl border border-[#DDE4E2] space-y-1.5">
                  <h5 className="font-bold text-[#12211F] text-xs">1. Data Collected</h5>
                  <p>
                    We collect email address and optional full name upon authentication. For users applying for Office Administrator privileges, official employment credentials and ID documents are uploaded to private, non-public storage.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-[#DDE4E2] space-y-1.5">
                  <h5 className="font-bold text-[#12211F] text-xs">2. Anonymized Public Reports</h5>
                  <p>
                    Reports submitted to the civic registry are disassociated from personal identities. No citizen email or phone number is displayed on the public reports feed or map overlay.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-[#DDE4E2] space-y-1.5">
                  <h5 className="font-bold text-[#12211F] text-xs">3. Account Purge & Right to be Forgotten</h5>
                  <p>
                    You maintain the right to delete your account permanently. Account deletion immediately destroys your credentials, profile row, and private verification documents, while irrevocably nulling submitter IDs on existing reports.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* SCREEN: 8. SUPPORT (Lightweight backend form)                 */}
          {/* ============================================================= */}
          {activeScreen === 'support' && (
            <div className="flex flex-col h-full">
              {renderScreenHeader(t.settings.support)}
              <div className="p-5 space-y-4 flex-1">
                {supportSuccess && (
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{t.support.successMessage}</span>
                  </div>
                )}

                <div className="text-xs text-[#5B6E6A]">
                  {t.support.desc}
                </div>

                <form onSubmit={handleSendSupport} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#12211F] block">
                      Message / Inquiry
                    </label>
                    <textarea
                      id="support-message-input"
                      rows={4}
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder={t.support.messagePlaceholder}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#DDE4E2] bg-white text-xs text-[#12211F] focus:outline-none focus:ring-2 focus:ring-[#287258] resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#12211F] block">
                      {t.support.emailLabel}
                    </label>
                    <input
                      id="support-email-input"
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder={t.support.emailPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#DDE4E2] bg-white text-xs text-[#12211F] focus:outline-none focus:ring-2 focus:ring-[#287258]"
                    />
                  </div>

                  <button
                    id="submit-support-ticket-btn"
                    type="submit"
                    disabled={submittingSupport || !supportMessage.trim()}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#287258] hover:bg-[#1E5743] text-white text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submittingSupport ? t.support.submitting : t.support.submit}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================= */}
      {/* MODAL: DELETE ACCOUNT CONFIRMATION DIALOG (Real privacy story) */}
      {/* ============================================================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#0A1A1C]/85 backdrop-blur-xs animate-in fade-in-50 duration-150">
          <div className="bg-white rounded-2xl border border-red-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-4 sm:p-5 bg-red-600 text-white flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-700">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold">{t.accountDeletion.title}</h3>
                <p className="text-xs text-red-100">{t.accountDeletion.warning}</p>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs text-[#12211F]">
              {deleteComplete ? (
                <div className="py-6 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm text-emerald-900">
                    {t.accountDeletion.deletedSuccess}
                  </h4>
                </div>
              ) : (
                <>
                  {/* Detailed Privacy Breakdown */}
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 space-y-1">
                    <div className="font-bold text-red-900 flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span>{t.accountDeletion.purgedHeader}</span>
                    </div>
                    <p className="text-red-700 leading-relaxed">
                      {t.accountDeletion.purgedNotice}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#EFF8F4] border border-emerald-200 space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{t.accountDeletion.retainedHeader}</span>
                    </div>
                    <p className="text-emerald-800 leading-relaxed">
                      {t.accountDeletion.retainedNotice}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      id="confirm-delete-account-btn"
                      onClick={handleExecuteDeleteAccount}
                      disabled={deletingAccount}
                      className="flex-1 py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs tracking-wide transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                    >
                      {deletingAccount ? t.accountDeletion.deleting : t.accountDeletion.confirmButton}
                    </button>
                    <button
                      id="cancel-delete-account-btn"
                      onClick={() => setShowDeleteModal(false)}
                      disabled={deletingAccount}
                      className="py-2.5 px-4 rounded-lg border border-[#DDE4E2] bg-white hover:bg-[#F4F8F7] text-xs font-semibold text-[#5B6E6A] transition-colors"
                    >
                      {t.accountDeletion.cancelButton}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
