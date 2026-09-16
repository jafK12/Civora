'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  APIProvider,
  Map as GoogleMapComponent,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { Office } from '@/lib/types';
import {
  Building2,
  Crosshair,
  AlertTriangle,
} from 'lucide-react';

interface CivicMapProps {
  offices: Office[];
  selectedOffice: Office | null;
  onSelectOffice: (office: Office) => void;
  onDismiss: () => void;
}

// Center coordinates for Addis Ababa civic offices
const DEFAULT_CENTER = { lat: 9.0100, lng: 38.7750 };
const DEFAULT_ZOOM = 13;

// Helper component to center and pan camera dynamically
function MapCameraHandler({ selectedOffice }: { selectedOffice: Office | null }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (selectedOffice) {
      map.panTo({
        lat: selectedOffice.location.lat,
        lng: selectedOffice.location.lng,
      });
      if ((map.getZoom() ?? 0) < 14) {
        map.setZoom(15);
      }
    }
  }, [map, selectedOffice]);

  return null;
}

export const CivicMap: React.FC<CivicMapProps> = ({
  offices,
  selectedOffice,
  onSelectOffice,
  onDismiss,
}) => {
  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    '';

  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [hoveredOffice, setHoveredOffice] = useState<Office | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation failed:', err.message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Helper to determine clean pin styling based on level and selection
  const getMarkerTheme = (level: Office['officeLevel'], isSelected: boolean) => {
    if (isSelected) {
      return {
        pinBg: 'bg-[#C97A2B]',
        pinBorder: 'border-white',
        pinRing: 'ring-4 ring-[#C97A2B]/40',
        tagBg: 'bg-[#0F2A2E] text-white border-[#C97A2B] shadow-lg',
        iconColor: 'text-white',
        dotBg: 'bg-[#C97A2B]',
      };
    }
    switch (level) {
      case 'district':
        return {
          pinBg: 'bg-[#C97A2B]',
          pinBorder: 'border-white',
          pinRing: 'group-hover:ring-3 group-hover:ring-[#C97A2B]/30',
          tagBg: 'bg-white/95 text-[#12211F] border-slate-200/90 shadow-sm',
          iconColor: 'text-white',
          dotBg: 'bg-[#C97A2B]',
        };
      case 'regional':
        return {
          pinBg: 'bg-[#1E3A4B]',
          pinBorder: 'border-white',
          pinRing: 'group-hover:ring-3 group-hover:ring-[#1E3A4B]/30',
          tagBg: 'bg-white/95 text-[#12211F] border-slate-200/90 shadow-sm',
          iconColor: 'text-white',
          dotBg: 'bg-[#1E3A4B]',
        };
      case 'local':
      default:
        return {
          pinBg: 'bg-[#1B6A58]',
          pinBorder: 'border-white',
          pinRing: 'group-hover:ring-3 group-hover:ring-[#1B6A58]/30',
          tagBg: 'bg-white/95 text-[#12211F] border-slate-200/90 shadow-sm',
          iconColor: 'text-white',
          dotBg: 'bg-[#1B6A58]',
        };
    }
  };

  // Helper to get compact display name for clean map rendering
  const getCleanOfficeName = (name: string) => {
    return (
      name
        .replace(/ Civic Office/gi, '')
        .replace(/ Civic Center/gi, '')
        .replace(/ Public Center/gi, '')
        .replace(/ Municipal Office/gi, '') || name
    );
  };

  return (
    <div
      id="civic-map-container"
      className="relative w-full h-[620px] lg:h-[calc(100vh-140px)] bg-[#0C2225] overflow-hidden select-none border-b border-[#24545C]/30"
    >
      {apiKey ? (
        <APIProvider
          apiKey={apiKey}
          onLoad={() => setMapError(null)}
          onError={(e) => {
            console.error('Google Maps API failed to load:', e);
            setMapError('Failed to initialize Google Maps. Falling back to schematic mode.');
          }}
        >
          <div className="w-full h-full relative">
            <GoogleMapComponent
              defaultCenter={DEFAULT_CENTER}
              defaultZoom={DEFAULT_ZOOM}
              mapId="DEMO_MAP_ID"
              mapTypeId={mapTypeId}
              gestureHandling="greedy"
              disableDefaultUI={false}
              streetViewControl={true}
              mapTypeControl={false}
              fullscreenControl={false}
              zoomControl={true}
              onClick={() => {
                onDismiss();
                setHoveredOffice(null);
              }}
              className="w-full h-full"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            >
              <MapCameraHandler selectedOffice={selectedOffice} />

              {/* User Real-Time Location Marker */}
              {userLocation && (
                <AdvancedMarker position={userLocation} title="Your current location">
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-75" />
                    <div className="relative w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  </div>
                </AdvancedMarker>
              )}

              {/* Civic Office Clean Map Pins */}
              {offices.map((office) => {
                const isSelected = selectedOffice?.id === office.id;
                const isHovered = hoveredOffice?.id === office.id;
                const theme = getMarkerTheme(office.officeLevel, isSelected);

                return (
                  <AdvancedMarker
                    key={office.id}
                    position={{ lat: office.location.lat, lng: office.location.lng }}
                    title={`${office.name} (${office.officeLevel})`}
                    onClick={() => onSelectOffice(office)}
                  >
                    <div
                      id={`office-marker-${office.id}`}
                      className="relative flex flex-col items-center group cursor-pointer transition-all duration-200 -translate-y-1/2"
                      onMouseEnter={() => setHoveredOffice(office)}
                      onMouseLeave={() => setHoveredOffice(null)}
                    >
                      {/* Selection Pulse Ring */}
                      {isSelected && (
                        <div className="absolute -top-1 w-11 h-11 rounded-full bg-[#C97A2B]/35 animate-ping pointer-events-none" />
                      )}

                      {/* Crisp Modern Pin Head */}
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 ${theme.pinBorder} ${theme.pinBg} ${theme.pinRing} shadow-md transition-transform duration-200 group-hover:scale-110 ${
                            isSelected ? 'scale-110' : ''
                          }`}
                        >
                          <Building2 className={`w-4 h-4 ${theme.iconColor}`} />
                        </div>

                        {/* Pin Teardrop Tip */}
                        <div
                          className={`w-2 h-2 ${theme.pinBg} rotate-45 -mt-1 rounded-2xs border-r border-b border-white/70`}
                        />

                        {/* Soft Ground Shadow */}
                        <div className="w-3.5 h-1 bg-black/30 rounded-full mt-0.5 blur-[0.6px]" />
                      </div>

                      {/* Clean Floating Micro-Label Tag */}
                      <div
                        className={`mt-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold tracking-tight transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap shadow-xs ${
                          theme.tagBg
                        } ${
                          isSelected
                            ? 'scale-105 shadow-md z-30'
                            : isHovered
                            ? 'scale-105 opacity-100 shadow-md z-20'
                            : 'opacity-95'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${theme.dotBg}`} />
                        <span className="truncate max-w-[130px] sm:max-w-[170px]">
                          {getCleanOfficeName(office.name)}
                        </span>
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}
            </GoogleMapComponent>
          </div>
        </APIProvider>
      ) : (
        /* Fallback schematic representation if API key is not present */
        <div className="w-full h-full flex items-center justify-center flex-col text-center p-6 text-white">
          <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
          <h3 className="text-base font-bold mb-1">Google Maps Key Required</h3>
          <p className="text-xs text-[#8DA3A0] max-w-md mb-4">
            Provision or configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your workspace secrets to render satellite and real-time street map layers.
          </p>
        </div>
      )}

      {/* Floating Top Left Badge: Real-time Map Indicator & Style Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="bg-[#0F2A2E]/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#24545C] text-xs text-[#E5EFEB] shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wide">Live Civic Map</span>
          <span className="text-[#8DA3A0] text-[11px]">• Addis Ababa</span>
        </div>

        {/* Satellite / Road view switcher */}
        <div className="bg-[#0F2A2E]/90 backdrop-blur-md p-0.5 rounded-lg border border-[#24545C] flex items-center shadow-lg">
          <button
            onClick={() => setMapTypeId('roadmap')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
              mapTypeId === 'roadmap'
                ? 'bg-[#19433B] text-emerald-300 shadow-xs'
                : 'text-[#8DA3A0] hover:text-white'
            }`}
          >
            Streets
          </button>
          <button
            onClick={() => setMapTypeId('hybrid')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
              mapTypeId === 'hybrid'
                ? 'bg-[#19433B] text-emerald-300 shadow-xs'
                : 'text-[#8DA3A0] hover:text-white'
            }`}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Floating Top Right: Geolocation button */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          id="btn-locate-me"
          onClick={handleLocateMe}
          disabled={locating}
          className="flex items-center gap-1.5 bg-[#0F2A2E]/95 backdrop-blur-md hover:bg-[#153B41] border border-[#24545C] px-3 py-1.5 rounded-lg text-xs font-medium text-[#E5EFEB] shadow-lg transition-all hover:border-[#C97A2B]"
          title="Find my current location"
        >
          <Crosshair className={`w-3.5 h-3.5 text-[#C97A2B] ${locating ? 'animate-spin' : ''}`} />
          <span>{locating ? 'Locating...' : 'Locate Me'}</span>
        </button>
      </div>
    </div>
  );
};
