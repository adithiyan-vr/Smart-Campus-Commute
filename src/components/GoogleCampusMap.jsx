import React, { useState, useEffect } from 'react';
import { 
  calculateDistanceAndDuration,
  useLiveRouteMetrics,
  loadGoogleMapsScript,
  getGoogleMapsEmbedUrl, 
  getGoogleMapsDirectionsUrl,
  CAMPUS_LOCATIONS 
} from '../services/routeCalculator';

export default function GoogleCampusMap({
  origin = 'Oakwood Apartments, Stanford, CA',
  destination = 'Main Campus Gate (Hub 1), Stanford, CA',
  activeDriverName = 'Assigned Driver',
  eta = '3 min away',
  height = 'h-64 sm:h-72',
  interactive = true,
  title = 'Campus Live Route Vector',
  showInputs = true,
  onRouteCalculated = null
}) {
  const [mapType, setMapType] = useState('m'); // 'm' = Roadmap, 'k' = Satellite, 'p' = Terrain
  const [zoom, setZoom] = useState(14);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('google_maps_api_key') || '');
  
  // Interactive route typing inputs
  const [inputOrigin, setInputOrigin] = useState(origin);
  const [inputDestination, setInputDestination] = useState(destination);
  const [isRouteSearchOpen, setIsRouteSearchOpen] = useState(false);

  // Sync with prop changes if passed from parent
  useEffect(() => {
    setInputOrigin(origin);
  }, [origin]);

  useEffect(() => {
    setInputDestination(destination);
  }, [destination]);

  // Try loading Google Maps JS SDK if key is saved
  useEffect(() => {
    if (apiKey) {
      loadGoogleMapsScript(apiKey).catch(() => {});
    }
  }, [apiKey]);

  // Compute live exact road distance, duration, and telemetry directly
  const { metrics: routeMetrics, isLoading: isRouteLoading, isGoogleLive } = useLiveRouteMetrics(inputOrigin, inputDestination);

  // Notify parent component if callback provided
  useEffect(() => {
    if (onRouteCalculated) {
      onRouteCalculated(routeMetrics);
    }
  }, [inputOrigin, inputDestination, routeMetrics.distanceMiles, routeMetrics.durationMinutes]);

  // Google Maps embed URL with saddr (start address marker) and daddr (destination address marker)
  const embedUrl = getGoogleMapsEmbedUrl({
    origin: inputOrigin,
    destination: inputDestination,
    mapType,
    zoom
  });

  // Direct turn-by-turn navigation link
  const directionsUrl = getGoogleMapsDirectionsUrl({
    origin: inputOrigin,
    destination: inputDestination
  });

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    localStorage.setItem('google_maps_api_key', apiKey.trim());
    if (apiKey.trim()) {
      loadGoogleMapsScript(apiKey.trim()).catch(() => {});
    }
    setShowKeyDialog(false);
  };

  const handleSelectQuickHub = (hubType, name) => {
    if (hubType === 'origin') {
      setInputOrigin(name);
    } else {
      setInputDestination(name);
    }
  };

  return (
    <div className={`relative w-full ${height} rounded-3xl overflow-hidden shadow-lg bg-surface-container-high border border-surface-container-highest flex flex-col group`}>
      
      {/* 1. Real Google Maps Iframe with marked Origin A & Destination B */}
      <iframe
        title="Google Campus Route Map"
        src={embedUrl}
        className="w-full h-full border-0 filter contrast-[1.02] brightness-[0.99]"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* 2. Top Bar: Route Markers & Map Controls */}
      <div className="absolute top-2.5 inset-x-2.5 z-10 flex flex-col gap-2 pointer-events-none">
        
        <div className="flex items-center justify-between gap-2">
          
          {/* Active Route Corridor Pill with Quick Edit Button */}
          <div className="pointer-events-auto flex items-center gap-1 bg-surface-container-lowest/95 backdrop-blur-md px-2.5 py-1.5 rounded-full text-on-surface shadow-md border border-surface-container-high text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
            <span className="font-headline font-bold truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none text-[11px] sm:text-xs">
              {inputOrigin.split(',')[0]} ➔ {inputDestination.split(',')[0]}
            </span>
            {showInputs && (
              <button
                onClick={() => setIsRouteSearchOpen(!isRouteSearchOpen)}
                className="ml-1 p-1 hover:bg-surface-container rounded-full text-primary transition-colors flex items-center"
                title={isRouteSearchOpen ? 'Hide route inputs' : 'Type pickup & destination to mark on map'}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {isRouteSearchOpen ? 'expand_less' : 'edit_location_alt'}
                </span>
              </button>
            )}
          </div>

          {/* Map Layer Switcher: Roadmap / Satellite / Terrain */}
          <div className="pointer-events-auto flex items-center bg-surface-container-lowest/95 backdrop-blur-md rounded-xl p-0.5 shadow-md border border-surface-container-high text-[11px] font-headline font-bold">
            <button
              onClick={() => setMapType('m')}
              className={`px-2 py-1 rounded-lg transition-all ${
                mapType === 'm' ? 'bg-primary text-on-primary shadow-xs' : 'text-secondary hover:text-on-surface'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setMapType('k')}
              className={`px-2 py-1 rounded-lg transition-all ${
                mapType === 'k' ? 'bg-primary text-on-primary shadow-xs' : 'text-secondary hover:text-on-surface'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapType('p')}
              className={`hidden sm:inline-block px-2 py-1 rounded-lg transition-all ${
                mapType === 'p' ? 'bg-primary text-on-primary shadow-xs' : 'text-secondary hover:text-on-surface'
              }`}
            >
              Terrain
            </button>
          </div>

        </div>

        {/* Expandable Route Input Bar (When opened directly on map) */}
        {showInputs && isRouteSearchOpen && (
          <div className="pointer-events-auto w-full max-w-md bg-surface-container-lowest/98 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-primary/30 space-y-2 animate-fadeIn text-xs">
            <div className="flex items-center justify-between">
              <span className="font-headline font-bold text-xs text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">route</span>
                Type Pickup & Destination
              </span>
              <button 
                onClick={() => setIsRouteSearchOpen(false)}
                className="text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 bg-surface-container-low px-2.5 py-1.5 rounded-xl border border-surface-container">
                <span className="material-symbols-outlined text-emerald-600 text-base">trip_origin</span>
                <input
                  id="map-input-pickup"
                  type="text"
                  placeholder="Type pickup location (e.g. Oakwood, Dorms...)"
                  value={inputOrigin}
                  onChange={(e) => setInputOrigin(e.target.value)}
                  className="bg-transparent border-0 outline-none text-xs font-semibold text-on-surface w-full"
                />
              </div>

              <div className="flex items-center gap-2 bg-surface-container-low px-2.5 py-1.5 rounded-xl border border-surface-container">
                <span className="material-symbols-outlined text-amber-600 text-base">pin_drop</span>
                <input
                  id="map-input-destination"
                  type="text"
                  placeholder="Type campus destination (e.g. Gate 2, Main Quad...)"
                  value={inputDestination}
                  onChange={(e) => setInputDestination(e.target.value)}
                  className="bg-transparent border-0 outline-none text-xs font-semibold text-on-surface w-full"
                />
              </div>
            </div>

            {/* Quick Campus Hub Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
              <span className="text-secondary font-bold flex-shrink-0">Quick:</span>
              {['Oakwood', 'Main Gate', 'Gate 2 STEM', 'Metro Station'].map(hub => (
                <button
                  key={hub}
                  type="button"
                  onClick={() => handleSelectQuickHub('destination', `${hub}, Stanford, CA`)}
                  className="px-2 py-0.5 bg-surface-container hover:bg-surface-container-high rounded-lg text-secondary hover:text-on-surface font-medium whitespace-nowrap transition-colors"
                >
                  {hub}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 3. Bottom Floating Telemetry Card: Returned Distance, Duration & Actions */}
      <div className="absolute bottom-2.5 inset-x-2.5 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Distance and Duration Telemetry Pill */}
        <div className="pointer-events-auto flex items-center gap-3 bg-surface-container-lowest/95 backdrop-blur-md px-3 py-2 rounded-2xl text-on-surface shadow-lg border border-surface-container-high">
          
          {/* Driving Duration */}
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-base">timer</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-headline font-black text-xs sm:text-sm text-primary leading-tight">
                {routeMetrics.durationText}
              </span>
              <span className="text-[9px] text-secondary font-semibold uppercase tracking-wider leading-none">
                Est. Driving
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-surface-container-high"></div>

          {/* Road Distance */}
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-xl bg-primary-container/25 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-base">straighten</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-headline font-bold text-xs sm:text-sm text-on-surface leading-tight">
                {routeMetrics.distanceMiles} mi
              </span>
              <span className="text-[9px] text-secondary font-semibold uppercase tracking-wider leading-none">
                {routeMetrics.distanceKm} km
              </span>
            </div>
          </div>

          {/* Walking & Biking Comparison (hidden on tiny screens) */}
          <div className="hidden md:flex items-center gap-2 pl-1 text-[10px] text-secondary border-l border-surface-container-high">
            <span className="flex items-center gap-0.5" title="Walking time">
              <span className="material-symbols-outlined text-xs">directions_walk</span>
              <span>{routeMetrics.walkingMinutes}m</span>
            </span>
            <span className="flex items-center gap-0.5" title="Biking time">
              <span className="material-symbols-outlined text-xs">directions_bike</span>
              <span>{routeMetrics.bikingMinutes}m</span>
            </span>
            <span className="flex items-center gap-0.5 text-emerald-600 font-bold" title="CO2 prevented">
              <span className="material-symbols-outlined text-xs">eco</span>
              <span>{routeMetrics.carbonSavedKg}kg</span>
            </span>
          </div>

          {/* Engine Source Badge */}
          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{isGoogleLive ? 'Google Maps Live API' : 'Google Maps Route Engine'}</span>
          </span>

        </div>

        {/* Action Controls: Direct Google Maps Navigation + Settings */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-primary hover:bg-primary-fixed-dim text-on-primary font-headline font-bold text-xs shadow-md transition-all active:scale-95"
            title="Open real turn-by-turn driving directions in Google Maps"
          >
            <span className="material-symbols-outlined text-base">near_me</span>
            <span className="hidden xs:inline">Navigate</span>
          </a>

          {/* Quick API Key Dialog trigger */}
          <button
            onClick={() => setShowKeyDialog(true)}
            className="p-2 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-md text-secondary hover:text-on-surface border border-surface-container-high shadow-md transition-colors"
            title="Google Maps API Configuration"
          >
            <span className="material-symbols-outlined text-base">settings</span>
          </button>
        </div>

      </div>

      {/* Optional Google Maps API Key Modal */}
      {showKeyDialog && (
        <div className="absolute inset-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md p-4 flex flex-col justify-center text-xs text-on-surface animate-fadeIn">
          <div className="max-w-sm mx-auto w-full space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-headline font-bold text-sm text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">map</span>
                Google Maps API Configuration
              </h4>
              <button onClick={() => setShowKeyDialog(false)} className="text-secondary hover:text-on-surface">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <p className="text-secondary text-[11px] leading-relaxed">
              Google Maps is actively running in real-time mode with live origin and destination markers, distance calculations, and duration telemetry. If you have a custom Google Cloud Maps API key, enter it below.
            </p>
            <form onSubmit={handleSaveApiKey} className="space-y-2">
              <input
                type="text"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-surface-container text-xs font-mono text-on-surface outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeyDialog(false)}
                  className="px-3 py-1.5 rounded-xl bg-surface-container text-secondary text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow"
                >
                  Save Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

