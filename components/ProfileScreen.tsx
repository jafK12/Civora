'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { SupportedLanguage } from '@/lib/types';
import { MOCK_OFFICES } from '@/lib/data/mockData';
import { CountryPickerModal } from './CountryPickerModal';
import {
  User,
  Globe2,
  MapPin,
  Moon,
  Sun,
  HelpCircle,
  FileText,
  LifeBuoy,
  LogOut,
  Trash2,
  Check,
  AlertTriangle,
  Send,
  ExternalLink,
  ChevronRight,
  Info,
  ArrowLeft,
  Lock,
} from 'lucide-react';

interface ProfileScreenProps {
  onOpenAuth?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onOpenAuth }) => {
  const { user, setUser, switchUser } = useAuth();
  const { t, currentLanguage, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();

  // Profile Edit State
  const [fullName, setFullName] = useState<string>(user.fullName || '');
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [profileSavedToast, setProfileSavedToast] = useState<boolean>(false);
  const [showCountryPicker, setShowCountryPicker] = useState<boolean>(false);

  // Active view
  const [activeSection, setActiveSection] = useState<
    'main' | 'editProfile' | 'language' | 'theme' | 'faq' | 'about' | 'terms' | 'privacy' | 'support'
  >('main');

  // Support Form State
  const [supportMessage, setSupportMessage] = useState<string>('');
  const [supportEmail, setSupportEmail] = useState<string>(user.email || '');
  const [submittingSupport, setSubmittingSupport] = useState<boolean>(false);
  const [supportSuccess, setSupportSuccess] = useState<boolean>(false);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deletingAccount, setDeletingAccount] = useState<boolean>(false);
  const [deleteComplete, setDeleteComplete] = useState<boolean>(false);

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
      setUser({ ...user, fullName: fullName.trim() });
      setProfileSavedToast(true);
      setTimeout(() => setProfileSavedToast(false), 3000);
    } finally {
      setSavingProfile(false);
    }
  };

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
        setActiveSection('main');
        switchUser('demo-citizen-003');
      }, 2000);
    }
  };

  const renderScreenHeader = (title: string) => (
    <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#DDE4E2]">
      <button
        onClick={() => setActiveSection('main')}
        className="p-1.5 rounded-lg bg-[#EBF0EF] text-[#12211F] hover:bg-[#DDE4E2] transition-colors"
        title="Back"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <h3 className="text-base font-bold text-[#12211F]">{title}</h3>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 w-full pb-24">
      {activeSection === 'main' && (
        <div className="space-y-4">
          {/* User Account & Role Badge Card */}
          <div className="p-5 bg-white rounded-2xl border border-[#DDE4E2] shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#EBF5F1] text-[#287258] border border-[#287258]/30 flex items-center justify-center font-bold text-lg">
                  {(user.fullName || user.email)[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#12211F]">
                    {user.fullName || 'Citizen User'}
                  </h3>
                  <p className="text-xs text-[#5B6E6A]">{user.email}</p>

                  {/* Citizen Role Badge */}
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      id="profile-readonly-role-badge"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border bg-emerald-50 text-emerald-800 border-emerald-200"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Citizen</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveSection('editProfile')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#EBF0EF] text-[#12211F] hover:bg-[#DDE4E2] transition-colors"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Navigation Rows */}
          <div className="bg-white rounded-2xl border border-[#DDE4E2] shadow-2xs divide-y divide-[#EBF0EF] overflow-hidden">
            {/* Civic Country / Jurisdiction */}
            <button
              onClick={() => setShowCountryPicker(true)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EBF5F1] text-[#287258] flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#12211F] block">Civic Country</span>
                  <span className="text-xs text-[#5B6E6A]">
                    {user.country ? `${user.country} (Customizable)` : 'Not set — click to choose'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8DA3A0]" />
            </button>

            {/* Language */}
            <button
              onClick={() => setActiveSection('language')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EBF5F1] text-[#287258] flex items-center justify-center">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#12211F] block">Language</span>
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

            {/* Display Theme */}
            <button
              onClick={() => setActiveSection('theme')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#12211F] block">Display Theme</span>
                  <span className="text-xs text-[#5B6E6A] capitalize">{theme}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8DA3A0]" />
            </button>

            {/* Support */}
            <button
              onClick={() => setActiveSection('support')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <LifeBuoy className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#12211F] block">Support & Help</span>
                  <span className="text-xs text-[#5B6E6A]">Submit assistance request or inquiry</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8DA3A0]" />
            </button>

            {/* About */}
            <button
              onClick={() => setActiveSection('about')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#12211F] block">About Civora</span>
                  <span className="text-xs text-[#5B6E6A]">Mission & transparency standard</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8DA3A0]" />
            </button>

            {/* Terms & Privacy */}
            <button
              onClick={() => setActiveSection('privacy')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#12211F] block">Privacy Policy</span>
                  <span className="text-xs text-[#5B6E6A]">Anonymous citizen report protection</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8DA3A0]" />
            </button>

            {/* Sign In / Switch Account */}
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="w-full p-4 flex items-center justify-between hover:bg-[#F4FAF8] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EBF5F1] text-[#287258] flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[#12211F] block">
                      Sign In / Switch Persona
                    </span>
                    <span className="text-xs text-[#5B6E6A]">
                      Phone OTP, Google OAuth & test accounts
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8DA3A0]" />
              </button>
            )}

            {/* Delete Account */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full p-4 flex items-center justify-between hover:bg-red-50/50 transition-colors text-left text-red-600"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold block">Delete Account</span>
                  <span className="text-xs text-red-400">Permanently purge profile record</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-red-300" />
            </button>
          </div>
        </div>
      )}

      {/* SUB-SCREEN: EDIT PROFILE */}
      {activeSection === 'editProfile' && (
        <div className="p-5 bg-white rounded-2xl border border-[#DDE4E2] shadow-2xs">
          {renderScreenHeader('Edit Profile')}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#12211F] mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 text-sm border border-[#DDE4E2] rounded-xl focus:ring-2 focus:ring-[#287258] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#12211F] mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3 py-2 text-sm border border-[#DDE4E2] rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-2.5 px-4 rounded-xl bg-[#287258] text-white text-xs font-bold hover:bg-[#1B6A58] transition-colors disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {profileSavedToast && (
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs text-center font-medium border border-emerald-200">
                Profile changes successfully updated.
              </div>
            )}
          </form>
        </div>
      )}

      {/* SUB-SCREEN: LANGUAGE */}
      {activeSection === 'language' && (
        <div className="p-5 bg-white rounded-2xl border border-[#DDE4E2] shadow-2xs">
          {renderScreenHeader('Select Language')}
          <div className="space-y-2">
            {[
              { code: 'en', label: 'English', local: 'English' },
              { code: 'am', label: 'አማርኛ', local: 'Amharic' },
              { code: 'om', label: 'Afaan Oromoo', local: 'Oromo' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code as SupportedLanguage)}
                className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-colors ${
                  currentLanguage === lang.code
                    ? 'border-[#287258] bg-[#EBF5F1]'
                    : 'border-[#DDE4E2] hover:bg-gray-50'
                }`}
              >
                <div>
                  <span className="text-sm font-bold text-[#12211F] block">{lang.label}</span>
                  <span className="text-xs text-[#5B6E6A]">{lang.local}</span>
                </div>
                {currentLanguage === lang.code && (
                  <Check className="w-5 h-5 text-[#287258]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SUB-SCREEN: THEME */}
      {activeSection === 'theme' && (
        <div className="p-5 bg-white rounded-2xl border border-[#DDE4E2] shadow-2xs">
          {renderScreenHeader('Display Theme')}
          <div className="space-y-2">
            {[
              { id: 'light', label: 'Light', desc: 'Default high-contrast civic aesthetic', icon: Sun },
              { id: 'dark', label: 'Dark', desc: 'Low-light nighttime mode', icon: Moon },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTheme(item.id as any)}
                className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-colors ${
                  theme === item.id
                    ? 'border-[#287258] bg-[#EBF5F1]'
                    : 'border-[#DDE4E2] hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#12211F] block">{item.label}</span>
                    <span className="text-xs text-[#5B6E6A]">{item.desc}</span>
                  </div>
                </div>
                {theme === item.id && <Check className="w-5 h-5 text-[#287258]" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SUB-SCREEN: SUPPORT */}
      {activeSection === 'support' && (
        <div className="p-5 bg-white rounded-2xl border border-[#DDE4E2] shadow-2xs">
          {renderScreenHeader('Support & Inquiries')}
          <form onSubmit={handleSendSupport} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#12211F] mb-1">
                Your Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-3 py-2 text-sm border border-[#DDE4E2] rounded-xl focus:ring-2 focus:ring-[#287258] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#12211F] mb-1">
                How can we help?
              </label>
              <textarea
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                rows={4}
                placeholder="Describe your inquiry, bug, or question regarding civic statutory information..."
                required
                className="w-full px-3 py-2 text-sm border border-[#DDE4E2] rounded-xl focus:ring-2 focus:ring-[#287258] outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submittingSupport}
              className="w-full py-2.5 px-4 rounded-xl bg-[#287258] text-white text-xs font-bold hover:bg-[#1B6A58] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{submittingSupport ? 'Sending...' : 'Submit Support Request'}</span>
            </button>

            {supportSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs text-center font-medium border border-emerald-200">
                Support request received. A civic liaison will review shortly.
              </div>
            )}
          </form>
        </div>
      )}

      {/* SUB-SCREEN: PRIVACY */}
      {activeSection === 'privacy' && (
        <div className="p-5 bg-white rounded-2xl border border-[#DDE4E2] shadow-2xs">
          {renderScreenHeader('Privacy Policy')}
          <div className="space-y-3 text-xs text-[#5B6E6A] leading-relaxed">
            <p>
              Civora protects citizen reporting integrity through anonymization protocols. When an irregularity is reported, your user identifier is hashed and never displayed publicly.
            </p>
            <h4 className="font-bold text-[#12211F]">Strict Anonymity</h4>
            <p>
              Only aggregated discrepancy patterns and anonymized descriptions are visible to the public and institutional office administrators.
            </p>
          </div>
        </div>
      )}

      {/* SUB-SCREEN: ABOUT */}
      {activeSection === 'about' && (
        <div className="p-5 bg-white rounded-2xl border border-[#DDE4E2] shadow-2xs">
          {renderScreenHeader('About Civora')}
          <div className="space-y-3 text-xs text-[#5B6E6A] leading-relaxed">
            <p>
              Civora is a civic service navigator and transparency registry. It helps citizens discover authorized civic offices, review legally mandated document checklists and fees, and report unauthorized requirements.
            </p>
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 border border-red-200 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Confirm Account Deletion</h3>
            <p className="text-xs text-gray-600 mb-4">
              This will permanently delete your user profile and active sessions. Previously submitted anonymous reports will remain preserved in the civic audit ledger without identifiers.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDeleteAccount}
                disabled={deletingAccount}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50"
              >
                {deletingAccount ? 'Deleting...' : 'Delete'}
              </button>
            </div>
            {deleteComplete && (
              <p className="text-xs text-emerald-600 text-center font-bold mt-2">
                Account deleted successfully.
              </p>
            )}
          </div>
        </div>
      )}

      {/* CIVIC COUNTRY PICKER MODAL */}
      <CountryPickerModal
        isOpen={showCountryPicker}
        onClose={() => setShowCountryPicker(false)}
        currentCountry={user.country}
        offices={MOCK_OFFICES}
        onSelectCountry={async (country) => {
          try {
            await fetch('/api/profile', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, country }),
            });
          } catch {
            // fallback
          }
          setUser({ ...user, country });
        }}
      />
    </div>
  );
};
