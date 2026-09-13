import React, { useState } from 'react';
import GoogleCampusMap from '../components/GoogleCampusMap';
import { 
  calculateDistanceAndDuration, 
  useLiveRouteMetrics, 
  getGoogleMapsDirectionsUrl 
} from '../services/routeCalculator';

export default function LandingExploreView({ 
  rides, 
  waitingMembers = [], 
  announcements = [],
  onOpenNotifications,
  onBookSeat, 
  onPickUpMember, 
  onInspectRoute, 
  onSearch, 
  currentUser, 
  isDemoUser 
}) {
  const [pickup, setPickup] = useState('Dormitory North / Off-Campus Quad');
  const [destination, setDestination] = useState('Main Campus Gate (Hub 1)');
  const [departTime, setDepartTime] = useState('Today, 8:15 AM');
  const [seatsNeeded, setSeatsNeeded] = useState('1 Seat');
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [femaleOnly, setFemaleOnly] = useState(false);
  const [activeFilterPill, setActiveFilterPill] = useState('All');
  
  const isDriver = currentUser?.role === 'driver';
  const [exploreMode, setExploreMode] = useState(isDriver ? 'waiting_riders' : 'driver_rides');

  React.useEffect(() => {
    if (currentUser?.role === 'driver') {
      setExploreMode('waiting_riders');
    } else if (currentUser?.role === 'rider') {
      setExploreMode('driver_rides');
    }
  }, [currentUser?.role]);

  const [inspectedRoute, setInspectedRoute] = useState({
    origin: 'Dormitory North / Off-Campus Quad, Stanford, CA',
    destination: 'Main Campus Gate (Hub 1), Stanford, CA',
    driverName: 'Campus Corridor Match',
    eta: '8 min away'
  });

  // Calculate live route distance, duration, and telemetry directly via live road & Google Maps engine
  const { metrics: liveRouteMetrics, isLoading: isRouteLoading, isGoogleLive } = useLiveRouteMetrics(pickup, destination);

  const filteredWaitingMembers = waitingMembers.filter(m => {
    // STRICT Female-only check: any male passenger must NEVER be included
    if (femaleOnly || activeFilterPill === 'FemaleOnly') {
      const isMale = m.passenger?.gender === 'male' || m.passenger?.name?.toLowerCase().includes('rohan') || m.passenger?.name?.toLowerCase().includes('kevin');
      if (isMale) return false;
      const isFemale = m.passenger?.gender === 'female';
      if (!isFemale) return false;
    }
    if (activeFilterPill === 'Closest' && parseFloat(m.distanceMiles) > 1.5) return false;
    return true;
  });

  const filteredRides = rides.filter(r => {
    // STRICT Female-only check: any male driver must NEVER be included
    if (femaleOnly || activeFilterPill === 'FemaleOnly') {
      const isMale = r.driver?.gender === 'male' || r.driver?.name?.toLowerCase().includes('marcus') || r.driver?.name?.toLowerCase().includes('miller');
      if (isMale) return false;
      const isFemale = r.femaleOnly === true || r.driver?.gender === 'female' || r.driver?.isFemaleDriver === true;
      if (!isFemale) return false;
    }
    if (activeFilterPill === 'Cheapest' && r.pricePerSeat > 45) return false;
    if (activeFilterPill === 'Closest' && parseFloat(r.distanceMiles) > 1.3) return false;
    if (activeFilterPill === 'Faculty' && !r.driver.tag.includes('Verified')) return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-8">
      
      {/* Hero Content Header */}
      <section className="px-4 pt-3 pb-2 flex flex-col items-start text-left">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container/15 text-primary mb-2.5">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          <span className="font-label-sm font-semibold tracking-wide uppercase">Clean Campus Commute</span>
        </div>
        <h1 className="font-headline-lg font-bold text-2xl sm:text-3xl text-on-surface tracking-tight leading-snug">
          Share Rides. Save Money. <span className="text-primary block">Reduce Campus Emissions.</span>
        </h1>
        <p className="font-body-md text-on-surface-variant mt-2 leading-relaxed">
          The smart, eco-friendly carpooling network for university students, faculty, and daily campus commuters.
        </p>
      </section>

      {/* Search & Route Matcher Card */}
      <section className="px-4 mt-2">
        <div className="w-full bg-surface-container-lowest rounded-xl shadow-[0_8px_24px_-4px_rgba(11,28,48,0.08)] p-4 flex flex-col gap-3 border border-surface-container-high/60">
          <div className="flex items-center justify-between pb-1">
            <span className="font-label-md text-secondary font-semibold uppercase tracking-wider text-xs">
              Quick Ride Search
            </span>
            <span className="flex items-center gap-1 font-label-sm text-primary font-medium text-xs">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              28 Active Carpools
            </span>
          </div>

          {/* Input: Pickup */}
          <div className="flex items-center gap-3 bg-surface-container-low px-3.5 py-2.5 rounded-xl transition-colors focus-within:bg-surface-container">
            <span className="material-symbols-outlined text-primary text-xl flex-shrink-0">my_location</span>
            <div className="flex flex-col min-w-0 flex-1">
              <label className="font-label-sm text-secondary uppercase font-semibold text-[10px]">Pickup Location</label>
              <input
                id="input-landing-pickup"
                className="bg-transparent border-0 outline-none text-on-surface font-body-md text-sm placeholder:text-outline p-0 w-full font-medium"
                placeholder="Enter dorm, apartment, or stop..."
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              />
            </div>
          </div>

          {/* Input: Destination */}
          <div className="flex items-center gap-3 bg-surface-container-low px-3.5 py-2.5 rounded-xl transition-colors focus-within:bg-surface-container">
            <span className="material-symbols-outlined text-primary-container text-xl flex-shrink-0">pin_drop</span>
            <div className="flex flex-col min-w-0 flex-1">
              <label className="font-label-sm text-secondary uppercase font-semibold text-[10px]">Destination</label>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <input
                  id="input-landing-destination"
                  className="bg-transparent border-0 outline-none text-on-surface font-body-md text-sm p-0 w-full font-semibold truncate"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
                <span className="font-label-sm bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold text-[11px] flex-shrink-0">Hub 1</span>
              </div>
            </div>
          </div>

          {/* Live Calculated Distance & Duration Telemetry Card directly from Google Maps Engine */}
          <div className="bg-primary-container/10 border border-primary-container/30 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-lg">route</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-headline font-black text-sm text-primary">
                    {liveRouteMetrics.distanceText || `${liveRouteMetrics.distanceMiles} miles`}
                  </span>
                  <span className="text-secondary text-xs">•</span>
                  <span className="font-headline font-bold text-sm text-on-surface">
                    ~{liveRouteMetrics.durationText}
                  </span>
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>{isGoogleLive ? 'Google Maps Live API' : 'Google Maps Route Engine'}</span>
                  </span>
                </div>
                <div className="text-[11px] text-secondary truncate mt-0.5">
                  Est. Fuel Split: <strong className="text-on-surface">{liveRouteMetrics.suggestedFare}</strong> · 🌱 Offset: <strong className="text-emerald-700">{liveRouteMetrics.carbonSavedKg} kg CO₂</strong>
                  {liveRouteMetrics.trafficText && <span className="ml-1 text-[10px] text-emerald-700">({liveRouteMetrics.trafficText})</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
              <a
                href={getGoogleMapsDirectionsUrl({ origin: pickup, destination })}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-headline font-bold text-primary hover:underline flex items-center gap-0.5 px-2 py-1 bg-surface-container-lowest rounded-lg border border-surface-container shadow-xs"
                title="Open real turn-by-turn navigation in Google Maps"
              >
                <span className="material-symbols-outlined text-xs">near_me</span>
                <span>Google Nav</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('campus-live-map-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-[11px] font-headline font-bold text-secondary hover:text-on-surface flex items-center gap-0.5 px-2 py-1 bg-surface-container-low rounded-lg"
                title="Jump to marked Google Map"
              >
                <span>View Map</span>
                <span className="material-symbols-outlined text-xs">arrow_downward</span>
              </button>
            </div>
          </div>

          {/* Dual Row: Date & Seats */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2.5 bg-surface-container-low px-3 py-2 rounded-xl">
              <span className="material-symbols-outlined text-secondary text-lg flex-shrink-0">schedule</span>
              <div className="flex flex-col min-w-0">
                <label className="font-label-sm text-secondary uppercase font-semibold text-[10px]">Depart</label>
                <input
                  className="bg-transparent border-0 outline-none font-body-md text-on-surface font-medium text-xs truncate w-full"
                  value={departTime}
                  onChange={(e) => setDepartTime(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-surface-container-low px-3 py-2 rounded-xl">
              <span className="material-symbols-outlined text-secondary text-lg flex-shrink-0">group</span>
              <div className="flex flex-col min-w-0">
                <label className="font-label-sm text-secondary uppercase font-semibold text-[10px]">Need</label>
                <select
                  value={seatsNeeded}
                  onChange={(e) => setSeatsNeeded(e.target.value)}
                  className="bg-transparent border-0 outline-none font-body-md text-on-surface font-semibold text-xs truncate cursor-pointer"
                >
                  <option value="1 Seat">1 Seat</option>
                  <option value="2 Seats">2 Seats</option>
                  <option value="3 Seats">3 Seats</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filter Checkboxes */}
          <div className="flex flex-col gap-2 pt-1">
            <label className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">verified_user</span>
                <span className="font-body-md text-on-surface font-medium text-xs">Verified .edu Students Only</span>
              </div>
              <input
                id="checkbox-edu-only"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                type="checkbox"
              />
            </label>
            <label className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">female</span>
                <span className="font-body-md text-on-surface font-medium text-xs">Female Drivers Only</span>
              </div>
              <input
                id="checkbox-female-only"
                checked={femaleOnly}
                onChange={(e) => setFemaleOnly(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                type="checkbox"
              />
            </label>
          </div>

          {/* CTA Button */}
          <button
            id="btn-search-rides"
            className="w-full h-12 mt-1 bg-primary text-on-primary rounded-xl font-headline font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,108,73,0.25)] active:scale-[0.98] transition-all hover:bg-primary-fixed-dim hover:text-on-primary-fixed"
            onClick={() => onSearch({ pickup, destination, verifiedOnly, femaleOnly })}
          >
            <span className="material-symbols-outlined text-xl">search</span>
            <span>Search Available Rides</span>
          </button>
        </div>
      </section>

      {/* Quick Gamified Eco Impact Dashboard */}
      <section className="px-4 mt-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              workspace_premium
            </span>
            <h2 className="font-headline font-bold text-base text-on-surface">Campus Impact Stats</h2>
          </div>
          <span className="font-label-sm text-primary font-semibold text-xs">Spring Semester</span>
        </div>

        {/* 3 Gamification Stat Cards */}
        <div className="grid grid-cols-3 gap-2">
          
          {/* Card 1: CO2 */}
          <div className="bg-surface-container-lowest p-3 rounded-xl shadow-sm border border-surface-container-high/60 flex flex-col justify-between relative overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-primary-container/20 text-on-primary-container flex items-center justify-center mb-1.5">
              <span className="material-symbols-outlined text-base">nest_eco_leaf</span>
            </div>
            <div>
              <span className="font-headline font-bold text-base sm:text-lg text-primary tracking-tight">142 kg</span>
              <p className="font-label-sm text-secondary font-medium text-[11px] leading-tight mt-0.5">CO₂ Saved</p>
            </div>
            <div className="absolute -bottom-3 -right-3 text-primary/10 select-none pointer-events-none">
              <span className="material-symbols-outlined text-5xl">forest</span>
            </div>
          </div>

          {/* Card 2: Savings */}
          <div className="bg-surface-container-lowest p-3 rounded-xl shadow-sm border border-surface-container-high/60 flex flex-col justify-between relative overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center mb-1.5">
              <span className="material-symbols-outlined text-base">savings</span>
            </div>
            <div>
              <span className="font-headline font-bold text-base sm:text-lg text-on-surface tracking-tight">₹3,600</span>
              <p className="font-label-sm text-secondary font-medium text-[11px] leading-tight mt-0.5">Avg / Student</p>
            </div>
            <div className="absolute -bottom-3 -right-3 text-secondary/10 select-none pointer-events-none">
              <span className="material-symbols-outlined text-5xl">payments</span>
            </div>
          </div>

          {/* Card 3: Trips */}
          <div className="bg-surface-container-lowest p-3 rounded-xl shadow-sm border border-surface-container-high/60 flex flex-col justify-between relative overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center mb-1.5">
              <span className="material-symbols-outlined text-base">commute</span>
            </div>
            <div>
              <span className="font-headline font-bold text-base sm:text-lg text-on-surface tracking-tight">1,250+</span>
              <p className="font-label-sm text-secondary font-medium text-[11px] leading-tight mt-0.5">Trips Shared</p>
            </div>
            <div className="absolute -bottom-3 -right-3 text-tertiary/10 select-none pointer-events-none">
              <span className="material-symbols-outlined text-5xl">electric_car</span>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Map Preview Container */}
      <section className="px-4 mt-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-xl">map</span>
            <h2 className="font-headline font-bold text-base text-on-surface">Campus Live Route Vector</h2>
          </div>
          <div className="flex items-center gap-1 bg-surface-container px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
            <span className="font-label-sm text-on-secondary-container font-semibold text-xs">Live Corridors</span>
          </div>
        </div>

        {/* Real Interactive Google Maps Campus Container with Route Markers & Telemetry */}
        <div id="campus-live-map-section">
          <GoogleCampusMap
            origin={pickup}
            destination={destination}
            activeDriverName={inspectedRoute.driverName}
            eta={inspectedRoute.eta}
            height="h-64 sm:h-72"
            showInputs={true}
          />
        </div>
      </section>

      {/* Official Campus Bulletins & Announcements Banner */}
      {announcements && announcements.length > 0 && (
        <section className="px-4 mt-5">
          <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">campaign</span>
                </span>
                <div>
                  <h3 className="font-headline font-bold text-xs sm:text-sm text-on-surface">Campus Administration Bulletins</h3>
                  <p className="text-[10px] text-secondary">Live updates and safety notices from University Admin</p>
                </div>
              </div>
              {onOpenNotifications && (
                <button
                  onClick={onOpenNotifications}
                  className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-headline font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>View All ({announcements.length})</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              )}
            </div>

            {/* Top Bulletin Item */}
            <div className="p-2.5 bg-surface-container-lowest rounded-xl border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-primary-container/20 text-on-primary-container font-mono">
                    {announcements[0].target || 'All Campus'}
                  </span>
                  <span className="text-[10px] text-secondary font-mono">{announcements[0].date}</span>
                </div>
                <h4 className="font-headline font-bold text-xs text-on-surface truncate">
                  {announcements[0].title}
                </h4>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] text-primary font-bold whitespace-nowrap self-end sm:self-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Official Broadcast
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Feed Section: Available Rides or Waiting Members */}
      <section className="px-4 mt-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div>
            <h2 className="font-headline font-bold text-base text-on-surface">
              {exploreMode === 'waiting_riders' ? 'Members Waiting for a Ride' : 'Available Rides Near You'}
            </h2>
            <span className="font-body-sm text-secondary text-xs">
              {exploreMode === 'waiting_riders'
                ? `${filteredWaitingMembers.length} verified student riders requesting pickup`
                : `${filteredRides.length} campus commuters departing soon`}
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-xl self-start sm:self-auto">
            <button
              id="landing-tab-driver-rides"
              onClick={() => setExploreMode('driver_rides')}
              className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all flex items-center gap-1.5 ${
                exploreMode === 'driver_rides'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">directions_car</span>
              <span>Driver Rides ({filteredRides.length})</span>
            </button>
            <button
              id="landing-tab-waiting-riders"
              onClick={() => setExploreMode('waiting_riders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all flex items-center gap-1.5 ${
                exploreMode === 'waiting_riders'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">hail</span>
              <span>Pick Up Riders ({filteredWaitingMembers.length})</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-3 scrollbar-none">
          {[
            { id: 'All', label: 'All Listings' },
            { id: 'FemaleOnly', label: exploreMode === 'waiting_riders' ? '👩 Female Riders Only' : '👩 Female Drivers Only' },
            { id: 'Closest', label: 'Closest (<1.5 mi)' },
            ...(exploreMode === 'driver_rides' ? [
              { id: 'Cheapest', label: 'Cheapest (₹40)' },
              { id: 'Faculty', label: 'Faculty Verified' }
            ] : [])
          ].map(pill => (
            <button
              key={pill.id}
              onClick={() => setActiveFilterPill(pill.id)}
              className={`px-3 py-1 rounded-full font-label-sm text-xs transition-all whitespace-nowrap ${
                activeFilterPill === pill.id
                  ? 'bg-primary text-on-primary font-semibold shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant font-medium hover:bg-surface-container'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* CONTENT: WAITING RIDERS OR DRIVER RIDES */}
        {exploreMode === 'waiting_riders' ? (
          /* WAITING MEMBERS FEED */
          <div className="space-y-3">
            {filteredWaitingMembers.length === 0 ? (
              <div className="bg-surface-container-lowest p-8 rounded-2xl text-center space-y-2 border border-surface-container-high">
                <span className="material-symbols-outlined text-4xl text-secondary/50">hail</span>
                <h4 className="font-headline font-bold text-sm text-on-surface">No waiting riders found</h4>
                <p className="text-xs text-secondary">No student riders currently waiting along this filter.</p>
              </div>
            ) : (
              filteredWaitingMembers.map(member => (
                <div
                  key={member.id}
                  id={`waiting-member-card-${member.id}`}
                  className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_4px_16px_rgba(11,28,48,0.05)] border border-surface-container-high/60 relative overflow-hidden flex flex-col gap-3 transition-all hover:shadow-md"
                >
                  {/* Top Row: Passenger Profile & Offered Split */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        className="w-10 h-10 rounded-full object-cover bg-surface-container flex-shrink-0 ring-1 ring-surface-container-highest"
                        src={member.passenger.avatar}
                        alt={member.passenger.name}
                      />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-headline font-bold text-sm text-on-surface truncate">
                            {member.passenger.name}
                          </span>
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-headline font-bold text-[10px] border border-emerald-200">
                            <span className="material-symbols-outlined text-[11px]">person</span>
                            Rider Waiting
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-surface-container text-on-secondary-container font-headline font-bold text-[10px]">
                            {member.passenger.major}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-secondary text-xs">
                          <span className="material-symbols-outlined text-amber-500 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                          <span className="font-body-sm font-semibold text-on-surface">{member.passenger.rating}</span>
                          <span className="font-body-sm text-secondary">({member.passenger.ridesTaken} rides)</span>
                          {member.passenger.mutualCourses?.length > 0 && (
                            <>
                              <span className="text-outline">·</span>
                              <span className="font-label-sm text-primary font-semibold text-[11px]">{member.passenger.mutualCourses[0]}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-headline font-extrabold text-lg text-emerald-700">₹{Math.round(member.offeredContribution)}</span>
                      <span className="block font-label-sm text-secondary text-[10px]">offered split</span>
                    </div>
                  </div>

                  {/* Route Corridor */}
                  <div className="bg-surface-container-low p-2.5 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-emerald-600 text-base flex-shrink-0">trip_origin</span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-body-sm text-xs font-medium text-on-surface truncate">{member.pickup}</span>
                        <div className="flex items-center gap-1 text-secondary">
                          <span className="material-symbols-outlined text-xs">arrow_forward</span>
                          <span className="font-body-sm text-xs font-bold text-on-surface truncate">{member.destination}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="font-headline font-bold text-xs text-on-surface">Leaves ~{member.desiredTime}</span>
                      <span className="font-label-sm text-secondary text-[11px]">
                        {member.distanceMiles} • ~{member.estimatedDuration}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Meta Badges & Action */}
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container font-headline font-semibold text-secondary text-[11px]">
                        <span className="material-symbols-outlined text-xs">event_seat</span>
                        Needs {member.seatsNeeded} Seat{member.seatsNeeded > 1 ? 's' : ''}
                      </span>
                      {member.femaleDriverPreferred && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-headline font-bold text-[10px] border border-pink-200">
                          <span className="material-symbols-outlined text-xs">female</span>
                          Prefers Female Driver
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className="font-label-sm text-secondary text-xs underline hover:text-emerald-700 transition-colors cursor-pointer"
                        onClick={() => {
                          setPickup(member.pickup);
                          setDestination(member.destination);
                          setInspectedRoute({
                            origin: `${member.pickup}, Stanford, CA`,
                            destination: `${member.destination}, Stanford, CA`,
                            driverName: member.passenger.name,
                            eta: member.desiredTime
                          });
                          const el = document.getElementById('campus-live-map-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                          onInspectRoute(`${member.pickup} to ${member.destination}`, member.passenger.name, member.desiredTime);
                        }}
                      >
                        Google Map
                      </button>
                      <button
                        id={`btn-landing-pickup-${member.id}`}
                        className="px-3.5 py-1.5 rounded-lg font-headline font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                        onClick={() => onPickUpMember && onPickUpMember(member)}
                        title="Accept passenger and confirm ride on your route"
                      >
                        <span className="material-symbols-outlined text-[14px]">person_add</span>
                        <span>Pick Up Rider</span>
                      </button>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        ) : (
          /* AVAILABLE RIDES FEED */
          <div className="space-y-3">
            {filteredRides.map(ride => (
              <div
                key={ride.id}
                id={`ride-card-${ride.id}`}
                className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_4px_16px_rgba(11,28,48,0.05)] border border-surface-container-high/60 relative overflow-hidden flex flex-col gap-3 transition-all hover:shadow-md"
              >
                {/* Top Row: Driver & Verified Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      className="w-10 h-10 rounded-full object-cover bg-surface-container flex-shrink-0 ring-1 ring-surface-container-highest"
                      src={ride.driver.avatar}
                      alt={ride.driver.name}
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-headline font-bold text-sm text-on-surface truncate">
                          {ride.driver.name}
                        </span>
                        {ride.femaleOnly || ride.driver?.gender === 'female' ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-pink-100 text-pink-700 font-headline font-bold text-[10px] border border-pink-200">
                            <span className="material-symbols-outlined text-[11px]">female</span>
                            Female Driver
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-surface-container text-secondary font-headline font-medium text-[10px]">
                            <span className="material-symbols-outlined text-[11px]">person</span>
                            Verified Driver
                          </span>
                        )}
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-surface-container text-on-secondary-container font-headline font-bold text-[10px]">
                          {ride.driver.major}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-secondary text-xs">
                        <span className="material-symbols-outlined text-amber-500 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                        <span className="font-body-sm font-semibold text-on-surface">{ride.driver.rating}</span>
                        <span className="font-body-sm text-secondary">({ride.driver.ridesCount} rides)</span>
                        <span className="text-outline">·</span>
                        <span className="font-label-sm text-primary font-semibold text-[11px]">{ride.driver.tag}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-headline font-extrabold text-lg text-primary">₹{Math.round(ride.pricePerSeat)}</span>
                    <span className="block font-label-sm text-secondary text-[10px]">per seat</span>
                  </div>
                </div>

                {/* Transit Path Line */}
                <div className="bg-surface-container-low p-2.5 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-primary text-base flex-shrink-0">trip_origin</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-body-sm text-xs font-medium text-on-surface truncate">{ride.pickup}</span>
                      <div className="flex items-center gap-1 text-secondary">
                        <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        <span className="font-body-sm text-xs font-bold text-on-surface truncate">{ride.destination}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="font-headline font-bold text-xs text-on-surface">{ride.departureTime}</span>
                    <span className="font-label-sm text-secondary text-[11px]">
                      {ride.distanceMiles} {ride.estimatedDuration ? `• ~${ride.estimatedDuration}` : ''}
                    </span>
                  </div>
                </div>

                {/* Card Meta Badges & Action */}
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-headline font-bold text-[11px] ${
                      ride.availableSeats === 1
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-primary-container/20 text-on-primary-container'
                    }`}>
                      <span className="material-symbols-outlined text-xs">
                        {ride.availableSeats === 1 ? 'warning' : 'event_seat'}
                      </span>
                      {ride.availableSeats} Seat{ride.availableSeats > 1 ? 's' : ''} Left
                    </span>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed/30 text-on-tertiary-fixed font-headline font-medium text-[11px]">
                      -{ride.carbonOffsetKg}kg CO₂
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="font-label-sm text-secondary text-xs underline hover:text-primary transition-colors cursor-pointer"
                      onClick={() => {
                        setPickup(ride.pickup);
                        setDestination(ride.destination);
                        setInspectedRoute({
                          origin: `${ride.pickup}, Stanford, CA`,
                          destination: `${ride.destination}, Stanford, CA`,
                          driverName: ride.driver.name,
                          eta: ride.departureTime
                        });
                        const el = document.getElementById('campus-live-map-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                        onInspectRoute(`${ride.pickup} to ${ride.destination}`, ride.driver.name, ride.departureTime);
                      }}
                    >
                      Google Map
                    </button>
                    <button
                      id={`btn-book-seat-${ride.id}`}
                      className={`px-3.5 py-1.5 rounded-lg font-headline font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1.5 ${
                        isDemoUser
                          ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                          : 'bg-primary text-on-primary hover:bg-primary-fixed-dim hover:text-on-primary-fixed'
                      }`}
                      onClick={() => onBookSeat(ride)}
                      title={isDemoUser ? 'Student Demo: Booking access is restricted. Click for details.' : 'Book a seat'}
                    >
                      {isDemoUser && <span className="material-symbols-outlined text-[13px]">lock</span>}
                      <span>Book Seat</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
