'use client';

import React, { useState, useEffect } from 'react';
import { Globe2, Navigation, Check, X, MapPin, Loader2, AlertCircle, Phone, Sparkles } from 'lucide-react';
import { Office } from '@/lib/types';

export interface CountryConfirmationConfig {
  country: string;
  source: 'phone' | 'google';
}

interface CountryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCountry?: string | null;
  offices: Office[];
  confirmationConfig?: CountryConfirmationConfig | null;
  onSelectCountry: (country: string) => Promise<void> | void;
}

export const CountryPickerModal: React.FC<CountryPickerModalProps> = ({
  isOpen,
  onClose,
  currentCountry,
  offices,
  confirmationConfig,
  onSelectCountry,
}) => {
  const [detecting, setDetecting] = useState<boolean>(false);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [userWantsManualPicker, setUserWantsManualPicker] = useState<boolean>(false);

  if (!isOpen) return null;

  const showManualList = !confirmationConfig || userWantsManualPicker;

  // Extract unique populated countries from offices in dataset
  const availableCountries = Array.from(
    new Set(offices.map((o) => o.country).filter(Boolean))
  );

  // If none found in offices, ensure Ethiopia and regional hubs are represented
  if (availableCountries.length === 0) {
    availableCountries.push('Ethiopia', 'Kenya', 'Rwanda');
  }

  const handleAutoDetect = () => {
    setDetectError(null);
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setDetectError('Location services not available in this browser environment. Please select manually below.');
      return;
    }

    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          let detected = '';

          // 1. Try reverse geocoding via public client endpoint
          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            if (res.ok) {
              const data = await res.json();
              if (data.countryName) {
                detected = data.countryName;
              }
            }
          } catch {
            // Network fallback
          }

          // 2. Coordinate bounding box heuristics for East Africa civic demo
          if (!detected) {
            if (latitude >= 3.0 && latitude <= 15.0 && longitude >= 33.0 && longitude <= 48.0) {
              detected = 'Ethiopia';
            } else if (latitude >= -5.0 && latitude <= 5.5 && longitude >= 33.5 && longitude <= 42.0) {
              detected = 'Kenya';
            } else if (latitude >= -3.0 && latitude <= -1.0 && longitude >= 28.5 && longitude <= 31.0) {
              detected = 'Rwanda';
            } else {
              detected = 'Ethiopia'; // Default regional jurisdiction
            }
          }

          // Check if detected matches one of our available countries
          const matchedCountry =
            availableCountries.find(
              (c) => c.toLowerCase() === detected.toLowerCase() || detected.toLowerCase().includes(c.toLowerCase())
            ) || detected;

          setSaving(true);
          await onSelectCountry(matchedCountry);
          setSaving(false);
          setDetecting(false);
          onClose();
        } catch {
          setDetectError('Could not resolve location. Please choose a country from the list below.');
          setDetecting(false);
        }
      },
      (err) => {
        setDetecting(false);
        if (err.code === 1) {
          setDetectError('Location permission was denied. Please select your country manually below.');
        } else {
          setDetectError('Location request timed out. Please choose your jurisdiction below.');
        }
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

  const handleManualSelect = async (country: string) => {
    setSaving(true);
    await onSelectCountry(country);
    setSaving(false);
    onClose();
  };

  const handleConfirmDetected = async () => {
    if (!confirmationConfig?.country) return;
    setSaving(true);
    await onSelectCountry(confirmationConfig.country);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#DDE4E2] shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#5B6E6A] hover:bg-[#EBF0EF] hover:text-[#12211F] transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. DETECTION CONFIRMATION STEP (WHEN APPLICABLE) */}
        {!showManualList && confirmationConfig ? (
          <div>
            {confirmationConfig.source === 'phone' ? (
              /* PHONE OTP HIGH-CONFIDENCE CONFIRMATION */
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#12211F]">Phone Country Match</h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        High Confidence
                      </span>
                    </div>
                    <p className="text-xs text-[#5B6E6A]">Extracted from verified E.164 phone number</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F6FAF8] border border-[#D1E8DE]">
                  <p className="text-sm font-medium text-[#12211F] leading-snug">
                    We detected <span className="font-bold text-[#1B6A58]">{confirmationConfig.country}</span> from your phone number — is that right?
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    onClick={handleConfirmDetected}
                    disabled={saving}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#287258] hover:bg-[#1B6A58] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Confirm {confirmationConfig.country}</span>
                  </button>

                  <button
                    onClick={() => setUserWantsManualPicker(true)}
                    disabled={saving}
                    className="py-2.5 px-4 rounded-xl border border-[#DDE4E2] hover:bg-[#F6F9F8] text-[#5B6E6A] hover:text-[#12211F] text-xs font-semibold transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              /* GOOGLE SIGN-IN LOW-CONFIDENCE CONFIRMATION */
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#12211F]">Civic Jurisdiction</h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Locale Hint
                      </span>
                    </div>
                    <p className="text-xs text-[#5B6E6A]">Based on your Google account region</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                  <p className="text-sm font-medium text-[#12211F] leading-snug">
                    Are you in <span className="font-bold text-[#8C531B]">{confirmationConfig.country}</span>?
                  </p>
                  <p className="text-[11px] text-[#7A6B5D] mt-1">
                    Please confirm your primary civic region to personalize local directories and fees.
                  </p>
                </div>

                {/* Equal-weight action options */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={handleConfirmDetected}
                    disabled={saving}
                    className="py-2.5 px-3 rounded-xl border-2 border-[#287258] bg-[#EBF5F1] hover:bg-[#d9ece4] text-[#1B6A58] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-[#287258]" />}
                    <span>Yes, in {confirmationConfig.country}</span>
                  </button>

                  <button
                    onClick={() => setUserWantsManualPicker(true)}
                    disabled={saving}
                    className="py-2.5 px-3 rounded-xl border-2 border-[#DDE4E2] bg-white hover:bg-[#F6F9F8] text-[#12211F] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Globe2 className="w-4 h-4 text-[#5B6E6A]" />
                    <span>Change Country</span>
                  </button>
                </div>
              </div>
            )}

            <p className="text-[11px] text-[#8DA3A0] text-center mt-4">
              Your country selection will filter regional civic activity and office requirements.
            </p>
          </div>
        ) : (
          /* 2. MANUAL COUNTRY PICKER LIST & FALLBACK */
          <div>
            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EBF5F1] text-[#287258] flex items-center justify-center">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#12211F]">Choose Civic Country</h3>
                <p className="text-xs text-[#5B6E6A]">Filter activity feed & directory to your local jurisdiction</p>
              </div>
            </div>

            {/* Auto Detect Button */}
            <div className="mb-4">
              <button
                onClick={handleAutoDetect}
                disabled={detecting || saving}
                className="w-full py-2.5 px-4 rounded-xl bg-[#EBF5F1] text-[#1B6A58] border border-[#287258]/30 text-xs font-bold hover:bg-[#d8ece4] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {detecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Detecting jurisdiction once...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 text-[#287258]" />
                    <span>Auto-Detect Country (One-Time)</span>
                  </>
                )}
              </button>

              {detectError && (
                <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>{detectError}</span>
                </div>
              )}
            </div>

            <div className="relative flex py-1 items-center mb-3">
              <div className="flex-grow border-t border-[#EBF0EF]"></div>
              <span className="flex-shrink mx-3 text-[11px] font-semibold text-[#8DA3A0] uppercase tracking-wider">
                Or select populated region
              </span>
              <div className="flex-grow border-t border-[#EBF0EF]"></div>
            </div>

            {/* Country Options List (strictly countries with offices in the dataset) */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {availableCountries.map((country) => {
                const isSelected = currentCountry?.toLowerCase() === country.toLowerCase();
                const officeCount = offices.filter(
                  (o) => o.country.toLowerCase() === country.toLowerCase()
                ).length;

                return (
                  <button
                    key={country}
                    onClick={() => handleManualSelect(country)}
                    disabled={saving}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-colors ${
                      isSelected
                        ? 'border-[#287258] bg-[#EBF5F1]'
                        : 'border-[#DDE4E2] hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className={`w-4 h-4 ${isSelected ? 'text-[#287258]' : 'text-[#8DA3A0]'}`} />
                      <div>
                        <span className="text-xs font-bold text-[#12211F] block">{country}</span>
                        <span className="text-[11px] text-[#5B6E6A]">
                          {officeCount} {officeCount === 1 ? 'civic office' : 'civic offices'} registered
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#287258]" />}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-[#8DA3A0] text-center mt-4">
              Note: Location is never tracked continuously. Only the country identifier is saved to your profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

