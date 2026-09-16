'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  UserCheck,
  RotateCcw,
  Check,
  KeyRound,
  Info,
  Phone,
  ArrowRight,
  Shield,
  Loader2,
  Lock,
} from 'lucide-react';
import { MOCK_OFFICES } from '@/lib/data/mockData';
import { getCountryFromPhoneNumber, getCountryFromGoogleLocale } from '@/lib/countryDetection';
import { CountryConfirmationConfig } from './CountryPickerModal';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onResetSeed?: () => void;
  onOpenCountryConfirmation?: (config: CountryConfirmationConfig | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  visible,
  onClose,
  onResetSeed,
  onOpenCountryConfirmation,
}) => {
  const { user, demoUsers, switchUser, signInWithPhone, signInWithGoogle, resetDatabase } = useAuth();
  
  const [authTab, setAuthTab] = useState<'phone' | 'google' | 'personas'>('phone');
  
  // Phone Auth State
  const [phoneNumber, setPhoneNumber] = useState<string>('+251 91 123 4567');
  const [phoneStep, setPhoneStep] = useState<'number' | 'otp'>('number');
  const [otpCode, setOtpCode] = useState<string>('');
  const [phoneLoading, setPhoneLoading] = useState<boolean>(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Google Auth State
  const [googleEmail, setGoogleEmail] = useState<string>('citizen.addis@gmail.com');
  const [googleName, setGoogleName] = useState<string>('Dawit Haile');
  const [googleLocale, setGoogleLocale] = useState<string>('am-ET');
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  // Database Reset State
  const [resetting, setResetting] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  if (!visible) return null;

  const availableCountries = Array.from(
    new Set(MOCK_OFFICES.map((o) => o.country).filter(Boolean))
  );
  if (availableCountries.length === 0) {
    availableCountries.push('Ethiopia', 'Kenya', 'Rwanda');
  }

  // PHONE AUTH HANDLERS
  const handleSendOtp = () => {
    setPhoneError(null);
    if (!phoneNumber.trim()) {
      setPhoneError('Please enter a valid phone number with country code');
      return;
    }
    setPhoneLoading(true);
    setTimeout(() => {
      setPhoneLoading(false);
      setPhoneStep('otp');
      setOtpCode('123456'); // Pre-fill sample OTP for convenience
    }, 600);
  };

  const handleVerifyPhoneOtp = async () => {
    setPhoneError(null);
    if (!otpCode || otpCode.trim().length < 4) {
      setPhoneError('Please enter the 6-digit verification code');
      return;
    }

    setPhoneLoading(true);

    try {
      // 1. High-confidence country detection from E.164 phone number
      const detected = getCountryFromPhoneNumber(phoneNumber, availableCountries);

      // 2. Sign in user with phone
      await signInWithPhone(phoneNumber, detected || undefined);

      setPhoneLoading(false);
      onClose();

      // 3. Trigger confirmation step or manual picker
      if (onOpenCountryConfirmation) {
        if (detected) {
          onOpenCountryConfirmation({
            country: detected,
            source: 'phone',
          });
        } else {
          // If no clean country detected, skip straight to manual country picker
          onOpenCountryConfirmation(null);
        }
      }
    } catch {
      setPhoneError('Failed to verify code. Please try again.');
      setPhoneLoading(false);
    }
  };

  // GOOGLE SIGN-IN HANDLERS
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);

    try {
      // 1. Read locale claim from Google token (low-confidence hint)
      const detected = getCountryFromGoogleLocale(googleLocale, availableCountries);

      // 2. Sign in user with Google
      await signInWithGoogle(
        {
          email: googleEmail,
          name: googleName,
          locale: googleLocale,
        },
        detected || undefined
      );

      setGoogleLoading(false);
      onClose();

      // 3. Trigger confirmation step or manual picker
      if (onOpenCountryConfirmation) {
        if (detected) {
          // Show guess confirmation: "Are you in [Country]?"
          onOpenCountryConfirmation({
            country: detected,
            source: 'google',
          });
        } else {
          // If locale doesn't map to dataset country, skip straight to manual picker with no guess shown!
          onOpenCountryConfirmation(null);
        }
      }
    } catch {
      setGoogleLoading(false);
    }
  };

  const handleResetData = async () => {
    setResetting(true);
    await resetDatabase();
    if (onResetSeed) onResetSeed();
    setResetting(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1A1C]/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#DDE4E2] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#0F2A2E] text-white border-b border-[#24545C] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#193F45] border border-[#2E6872] text-[#C97A2B]">
              <KeyRound className="w-5 h-5 text-[#C97A2B]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Citizen Sign In & Country Auto-Detect</h2>
              <p className="text-xs text-[#8DA3A0]">
                Phone OTP & Google OAuth with jurisdiction confirmation
              </p>
            </div>
          </div>
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#193F45] text-[#A6BFBB] hover:text-white hover:bg-[#23565F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#DDE4E2] bg-[#F8FAFA] p-1 gap-1">
          <button
            onClick={() => setAuthTab('phone')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
              authTab === 'phone'
                ? 'bg-white text-[#12211F] shadow-xs border border-[#DDE4E2]'
                : 'text-[#5B6E6A] hover:text-[#12211F]'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-[#287258]" />
            <span>Phone OTP</span>
          </button>

          <button
            onClick={() => setAuthTab('google')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
              authTab === 'google'
                ? 'bg-white text-[#12211F] shadow-xs border border-[#DDE4E2]'
                : 'text-[#5B6E6A] hover:text-[#12211F]'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            onClick={() => setAuthTab('personas')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
              authTab === 'personas'
                ? 'bg-white text-[#12211F] shadow-xs border border-[#DDE4E2]'
                : 'text-[#5B6E6A] hover:text-[#12211F]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-[#24545C]" />
            <span>Personas</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
          {/* ========================================================= */}
          {/* TAB 1: PHONE OTP SIGN IN                                  */}
          {/* ========================================================= */}
          {authTab === 'phone' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#F6FAF8] border border-[#D1E8DE] flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-[#287258] shrink-0 mt-0.5" />
                <div className="text-[11px] text-[#24545C]">
                  <p className="font-bold text-[#12211F]">High-Confidence Detection</p>
                  <p className="text-[#5B6E6A] mt-0.5">
                    Your country is parsed from your E.164 phone country code via <span className="font-mono font-semibold">libphonenumber-js</span> and presented for confirmation.
                  </p>
                </div>
              </div>

              {phoneStep === 'number' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#12211F] mb-1">
                      Mobile Phone Number (E.164 Format)
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+251 91 123 4567"
                      className="w-full px-3 py-2.5 text-sm border border-[#DDE4E2] rounded-xl focus:ring-2 focus:ring-[#287258] outline-none font-mono"
                    />
                  </div>

                  {/* Preset Test Numbers */}
                  <div>
                    <span className="text-[11px] font-semibold text-[#8DA3A0] block mb-1.5">
                      Quick Country Presets for Testing:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPhoneNumber('+251 91 123 4567')}
                        className={`p-2 rounded-lg border text-left text-[11px] transition-colors ${
                          phoneNumber.includes('251')
                            ? 'border-[#287258] bg-[#EBF5F1] text-[#1B6A58] font-bold'
                            : 'border-[#DDE4E2] hover:bg-gray-50 text-[#5B6E6A]'
                        }`}
                      >
                        <span className="block font-semibold">🇪🇹 Ethiopia</span>
                        <span className="font-mono text-[10px] text-[#8DA3A0]">+251...</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPhoneNumber('+254 712 345678')}
                        className={`p-2 rounded-lg border text-left text-[11px] transition-colors ${
                          phoneNumber.includes('254')
                            ? 'border-[#287258] bg-[#EBF5F1] text-[#1B6A58] font-bold'
                            : 'border-[#DDE4E2] hover:bg-gray-50 text-[#5B6E6A]'
                        }`}
                      >
                        <span className="block font-semibold">🇰🇪 Kenya</span>
                        <span className="font-mono text-[10px] text-[#8DA3A0]">+254...</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPhoneNumber('+250 788 123456')}
                        className={`p-2 rounded-lg border text-left text-[11px] transition-colors ${
                          phoneNumber.includes('250')
                            ? 'border-[#287258] bg-[#EBF5F1] text-[#1B6A58] font-bold'
                            : 'border-[#DDE4E2] hover:bg-gray-50 text-[#5B6E6A]'
                        }`}
                      >
                        <span className="block font-semibold">🇷🇼 Rwanda</span>
                        <span className="font-mono text-[10px] text-[#8DA3A0]">+250...</span>
                      </button>
                    </div>
                  </div>

                  {phoneError && (
                    <p className="text-xs text-red-600 font-medium">{phoneError}</p>
                  )}

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={phoneLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0F2A2E] hover:bg-[#193F45] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                  >
                    {phoneLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Send SMS Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5B6E6A]">
                      Code sent to <span className="font-mono font-bold text-[#12211F]">{phoneNumber}</span>
                    </span>
                    <button
                      onClick={() => setPhoneStep('number')}
                      className="text-xs text-[#287258] hover:underline font-semibold"
                    >
                      Change Number
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#12211F] mb-1">
                      Enter 6-Digit OTP Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        className="w-full px-3 py-2.5 text-center tracking-widest text-lg font-mono font-bold border border-[#DDE4E2] rounded-xl focus:ring-2 focus:ring-[#287258] outline-none"
                      />
                    </div>
                  </div>

                  {phoneError && (
                    <p className="text-xs text-red-600 font-medium">{phoneError}</p>
                  )}

                  <button
                    type="button"
                    onClick={handleVerifyPhoneOtp}
                    disabled={phoneLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#287258] hover:bg-[#1B6A58] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {phoneLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Verify & Continue</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: GOOGLE SIGN-IN                                     */}
          {/* ========================================================= */}
          {authTab === 'google' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-900">
                  <p className="font-bold">Low-Confidence Locale Hint</p>
                  <p className="text-amber-800 mt-0.5">
                    Google Sign-In extracts the <span className="font-mono font-semibold">locale</span> claim (default scopes: openid/email/profile). If unmapped, skips straight to manual picker without guessing.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#12211F] mb-1">
                    Google Account
                  </label>
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#DDE4E2] rounded-xl focus:ring-2 focus:ring-[#287258] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#12211F] mb-1">
                    Google ID Token Locale Claim (Signal)
                  </label>
                  <input
                    type="text"
                    value={googleLocale}
                    onChange={(e) => setGoogleLocale(e.target.value)}
                    placeholder="e.g. am-ET, sw-KE, en-US"
                    className="w-full px-3 py-2 text-xs font-mono border border-[#DDE4E2] rounded-xl focus:ring-2 focus:ring-[#287258] outline-none"
                  />
                </div>

                {/* Quick Test Locales */}
                <div>
                  <span className="text-[11px] font-semibold text-[#8DA3A0] block mb-1.5">
                    Test Specific Locale Claims:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setGoogleLocale('am-ET');
                        setGoogleEmail('citizen.addis@gmail.com');
                        setGoogleName('Dawit Haile');
                      }}
                      className={`p-2 rounded-lg border text-left text-[11px] transition-colors ${
                        googleLocale === 'am-ET'
                          ? 'border-amber-400 bg-amber-50 text-amber-900 font-bold'
                          : 'border-[#DDE4E2] hover:bg-gray-50 text-[#5B6E6A]'
                      }`}
                    >
                      <span className="block font-semibold">am-ET (Ethiopia)</span>
                      <span className="text-[10px] text-[#8DA3A0]">Shows guess confirmation</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setGoogleLocale('sw-KE');
                        setGoogleEmail('wambui.nairobi@gmail.com');
                        setGoogleName('Wambui Mwangi');
                      }}
                      className={`p-2 rounded-lg border text-left text-[11px] transition-colors ${
                        googleLocale === 'sw-KE'
                          ? 'border-amber-400 bg-amber-50 text-amber-900 font-bold'
                          : 'border-[#DDE4E2] hover:bg-gray-50 text-[#5B6E6A]'
                      }`}
                    >
                      <span className="block font-semibold">sw-KE (Kenya)</span>
                      <span className="text-[10px] text-[#8DA3A0]">Shows guess confirmation</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setGoogleLocale('rw-RW');
                        setGoogleEmail('uwase.kigali@gmail.com');
                        setGoogleName('Aline Uwase');
                      }}
                      className={`p-2 rounded-lg border text-left text-[11px] transition-colors ${
                        googleLocale === 'rw-RW'
                          ? 'border-amber-400 bg-amber-50 text-amber-900 font-bold'
                          : 'border-[#DDE4E2] hover:bg-gray-50 text-[#5B6E6A]'
                      }`}
                    >
                      <span className="block font-semibold">rw-RW (Rwanda)</span>
                      <span className="text-[10px] text-[#8DA3A0]">Shows guess confirmation</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setGoogleLocale('en-US');
                        setGoogleEmail('visitor.global@gmail.com');
                        setGoogleName('Global Citizen');
                      }}
                      className={`p-2 rounded-lg border text-left text-[11px] transition-colors ${
                        googleLocale === 'en-US'
                          ? 'border-amber-400 bg-amber-50 text-amber-900 font-bold'
                          : 'border-[#DDE4E2] hover:bg-gray-50 text-[#5B6E6A]'
                      }`}
                    >
                      <span className="block font-semibold">en-US (Unmapped)</span>
                      <span className="text-[10px] text-[#8DA3A0]">Skips straight to picker</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#DDE4E2] bg-white hover:bg-gray-50 text-[#12211F] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2.5 disabled:opacity-50 mt-3"
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#5B6E6A]" />
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Sign in with Google (Default Scopes Only)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: DEMO PERSONAS & RESET TOOLS                        */}
          {/* ========================================================= */}
          {authTab === 'personas' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-bold text-[#12211F] block uppercase tracking-wider text-[11px]">
                  Switch Demo Persona:
                </label>

                {demoUsers.map((demo) => {
                  const isSelected = user.id === demo.id;

                  return (
                    <div
                      key={demo.id}
                      id={`persona-option-${demo.id}`}
                      onClick={() => {
                        switchUser(demo.id);
                        onClose();
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#F4FAF8] border-[#287258] ring-1 ring-[#287258]/30 shadow-xs'
                          : 'bg-white border-[#DDE4E2] hover:bg-[#F8FAFA]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg mt-0.5 bg-[#EFF8F4] text-[#287258] border border-[#B8DFD1]">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#12211F]">
                              {demo.fullName || 'Standard Citizen Submitter'}
                            </span>
                            {demo.country && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                {demo.country}
                              </span>
                            )}
                          </div>
                          <span className="text-[#5B6E6A] block">{demo.email}</span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="p-1 rounded-full bg-[#287258] text-white shrink-0 mt-1">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Reset Database Button */}
              <div className="pt-2 border-t border-[#E9EFEF] flex items-center justify-between">
                <span className="text-[11px] text-[#5B6E6A]">Reset sample dataset to clean state:</span>
                <button
                  id="reset-database-seed-btn"
                  onClick={handleResetData}
                  disabled={resetting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DDE4E2] text-[#5B6E6A] hover:text-[#12211F] hover:bg-[#F0F4F3] transition-colors disabled:opacity-50 text-xs font-semibold"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
                  <span>{resetSuccess ? 'Reset Complete!' : 'Reset Seed Data'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F8FAFA] border-t border-[#E9EFEF] flex justify-end">
          <button
            id="auth-modal-done-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#0F2A2E] hover:bg-[#193F45] text-white font-semibold transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

