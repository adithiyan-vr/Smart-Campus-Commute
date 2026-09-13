import React, { useState, useEffect } from 'react';
import GoogleCampusMap from '../components/GoogleCampusMap';
import { calculateDistanceAndDuration, useLiveRouteMetrics } from '../services/routeCalculator';
import { matchesTimeSlot, CAMPUS_TIME_SLOTS, sortRidesByTimeProximity, parseTimeToMinutes } from '../services/timeMatcher';

export default function FindRideView({ 
  rides = [], 
  waitingMembers = [], 
  onBookSeat, 
  onPickUpMember, 
  currentUser, 
  isDemoUser, 
  initialFilters 
}) {
  const [source, setSource] = useState(initialFilters?.pickup || '');
  const [destination, setDestination] = useState(initialFilters?.destination || '');
  const [femaleOnly, setFemaleOnly] = useState(Boolean(initialFilters?.femaleOnly));
  const [maxPrice, setMaxPrice] = useState(100);
  const [minSeats, setMinSeats] = useState(initialFilters?.seatsNeeded || 1);
  const [departTime, setDepartTime] = useState(initialFilters?.departTime || '');
  
  // Role-aware view mode: If user profile is 'driver', default to 'pick_rider'
  const isDriverProfile = currentUser?.role === 'driver';
  const [activeMode, setActiveMode] = useState(isDriverProfile ? 'pick_rider' : 'find_driver');

  // Selected ride (driver route for rider) or selected member (passenger waiting for driver)
  const [selectedRide, setSelectedRide] = useState(rides[0] || null);
  const [selectedMember, setSelectedMember] = useState(waitingMembers[0] || null);

  // Sync mode whenever profile role changes
  useEffect(() => {
    if (currentUser?.role === 'driver') {
      setActiveMode('pick_rider');
    } else if (currentUser?.role === 'rider') {
      setActiveMode('find_driver');
    }
  }, [currentUser?.role]);

  // Sync state whenever initialFilters prop updates
  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.pickup !== undefined) setSource(initialFilters.pickup);
      if (initialFilters.destination !== undefined) setDestination(initialFilters.destination);
      if (initialFilters.femaleOnly !== undefined) setFemaleOnly(Boolean(initialFilters.femaleOnly));
      if (initialFilters.departTime !== undefined) setDepartTime(initialFilters.departTime);
      if (initialFilters.seatsNeeded !== undefined) setMinSeats(initialFilters.seatsNeeded);
    }
  }, [initialFilters]);

  // Compute live distance & duration for typed pickup and destination directly via road engine
  const isDriverMode = activeMode === 'pick_rider';
  const activeOrigin = isDriverMode 
    ? (selectedMember ? selectedMember.pickup : (source || 'Oakwood Apartments')) 
    : (selectedRide ? selectedRide.pickup : (source || 'Oakwood Apartments'));
  const activeDest = isDriverMode 
    ? (selectedMember ? selectedMember.destination : (destination || 'Main Campus Gate')) 
    : (selectedRide ? selectedRide.destination : (destination || 'Main Campus Gate'));

  const { metrics: findRouteMetrics, isLoading: isFindRouteLoading, isGoogleLive } = useLiveRouteMetrics(activeOrigin, activeDest);

  // Filter rides with strict gender guard, exact departure time, and route matching
  const searchResults = React.useMemo(() => {
    return rides.filter(r => {
      // STRICT Female-only check: any male driver must NEVER be included
      if (femaleOnly) {
        const isMale = r.driver?.gender === 'male' || r.driver?.name?.toLowerCase().includes('marcus') || r.driver?.name?.toLowerCase().includes('miller');
        if (isMale) return false;
        const isFemale = r.femaleOnly === true || r.driver?.gender === 'female' || r.driver?.isFemaleDriver === true;
        if (!isFemale) return false;
      }
      if (r.pricePerSeat > maxPrice) return false;
      if (r.availableSeats < minSeats) return false;
      // Filter by departure time slot (exact match)
      if (departTime && !matchesTimeSlot(r.departureTime, departTime, 0)) return false;

      // Filter by pickup if user specified a search query
      if (source && source.trim().length > 1) {
        const srcQuery = source.toLowerCase().trim();
        if (!srcQuery.includes('all')) {
          const words = srcQuery.split(/[\s,/-]+/).filter(w => w.length > 2 && !['the', 'and', 'for', 'all', 'near'].includes(w));
          const pickupLower = r.pickup.toLowerCase();
          const matchesPickup = pickupLower.includes(srcQuery) || 
                                srcQuery.includes(pickupLower) ||
                                (words.length > 0 && words.some(w => pickupLower.includes(w)));
          if (!matchesPickup) return false;
        }
      }

      // Filter by destination if user specified a destination query
      if (destination && destination.trim().length > 1) {
        const destQuery = destination.toLowerCase().trim();
        if (!destQuery.includes('all')) {
          const words = destQuery.split(/[\s,/-]+/).filter(w => w.length > 2 && !['the', 'and', 'for', 'gate', 'hub', 'all'].includes(w));
          const destLower = r.destination.toLowerCase();
          const matchesDest = destLower.includes(destQuery) || 
                              destQuery.includes(destLower) ||
                              (words.length > 0 && words.some(w => destLower.includes(w)));
          if (!matchesDest && words.length > 0) return false;
        }
      }

      return true;
    });
  }, [rides, femaleOnly, maxPrice, minSeats, departTime, source, destination]);

  const sortedSearchResults = React.useMemo(() => {
    return departTime ? sortRidesByTimeProximity(searchResults, departTime) : searchResults;
  }, [searchResults, departTime]);

  // Filter waiting list members seeking rides (for drivers looking for passengers to pick up)
  const filteredWaitingMembers = React.useMemo(() => {
    return waitingMembers.filter(m => {
      if (femaleOnly && m.passenger?.gender !== 'female') return false;
      
      // Filter by pickup
      if (source && source.trim().length > 1) {
        const srcQuery = source.toLowerCase().trim();
        if (!srcQuery.includes('all')) {
          const words = srcQuery.split(/[\s,/-]+/).filter(w => w.length > 2 && !['the', 'and', 'for', 'all', 'near'].includes(w));
          const pickupLower = m.pickup.toLowerCase();
          const match = pickupLower.includes(srcQuery) || 
                        srcQuery.includes(pickupLower) ||
                        (words.length > 0 && words.some(w => pickupLower.includes(w)));
          if (!match) return false;
        }
      }

      // Filter by destination
      if (destination && destination.trim().length > 1) {
        const destQuery = destination.toLowerCase().trim();
        if (!destQuery.includes('all')) {
          const words = destQuery.split(/[\s,/-]+/).filter(w => w.length > 2 && !['the', 'and', 'for', 'gate', 'hub', 'all'].includes(w));
          const destLower = m.destination.toLowerCase();
          const match = destLower.includes(destQuery) || 
                        destQuery.includes(destLower) ||
                        (words.length > 0 && words.some(w => destLower.includes(w)));
          if (!match && words.length > 0) return false;
        }
      }

      // Filter by desired time slot (exact match)
      if (departTime && !matchesTimeSlot(m.desiredTime, departTime, 0)) return false;

      return true;
    });
  }, [waitingMembers, femaleOnly, source, destination, departTime]);

  const sortedWaitingMembers = React.useMemo(() => {
    if (!departTime) return filteredWaitingMembers;
    const targetMins = parseTimeToMinutes(departTime);
    if (targetMins === null) return filteredWaitingMembers;
    return [...filteredWaitingMembers].sort((a, b) => {
      const aMins = parseTimeToMinutes(a.desiredTime) ?? 9999;
      const bMins = parseTimeToMinutes(b.desiredTime) ?? 9999;
      return Math.abs(aMins - targetMins) - Math.abs(bMins - targetMins);
    });
  }, [filteredWaitingMembers, departTime]);

  // Keep selected ride in sync with filtered search results
  useEffect(() => {
    if (sortedSearchResults.length > 0 && (!selectedRide || !sortedSearchResults.some(r => r.id === selectedRide.id))) {
      setSelectedRide(sortedSearchResults[0]);
    }
  }, [sortedSearchResults]);

  // Keep selected member in sync with filtered waiting members
  useEffect(() => {
    if (sortedWaitingMembers.length > 0 && (!selectedMember || !sortedWaitingMembers.some(m => m.id === selectedMember.id))) {
      setSelectedMember(sortedWaitingMembers[0]);
    }
  }, [sortedWaitingMembers]);

  return (
    <div className="px-4 py-3 flex flex-col gap-4 pb-20">
      
      {/* Role Mode Selector Tab */}
      <div className="grid grid-cols-2 p-1 bg-surface-container rounded-2xl border border-surface-container-high shadow-xs">
        <button
          type="button"
          id="btn-tab-find-drivers"
          onClick={() => {
            setActiveMode('find_driver');
            setSelectedRide(rides[0] || null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-headline text-xs font-bold transition-all ${
            !isDriverMode
              ? 'bg-surface-container-lowest text-primary shadow-sm ring-1 ring-primary/20'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">directions_car</span>
          <span>Find Drivers ({sortedSearchResults.length})</span>
        </button>

        <button
          type="button"
          id="btn-tab-pick-riders"
          onClick={() => {
            setActiveMode('pick_rider');
            setSelectedMember(waitingMembers[0] || null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-headline text-xs font-bold transition-all relative ${
            isDriverMode
              ? 'bg-surface-container-lowest text-emerald-700 shadow-sm ring-1 ring-emerald-500/30'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">hail</span>
          <span>Pick Up Riders ({sortedWaitingMembers.length})</span>
          {currentUser?.role === 'driver' && (
            <span className="hidden sm:inline-block ml-1 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
              Driver View
            </span>
          )}
        </button>
      </div>

      {/* Header */}
      <div>
        {isDriverMode ? (
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] mb-1 border border-emerald-300">
              <span className="material-symbols-outlined text-xs">hail</span>
              <span>Driver Portal · Passenger Waitlist</span>
            </div>
            <h2 className="font-headline font-bold text-xl text-on-surface">Members Waiting for a Ride</h2>
            <p className="font-body text-xs text-secondary">
              Review student commuters waiting along campus routes and offer them a ride to earn fuel splits.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="font-headline font-bold text-xl text-on-surface">Find a Campus Commute</h2>
            <p className="font-body text-xs text-secondary">
              Filter verified student drivers commuting toward university gates.
            </p>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-container-high space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          
          <div className="bg-surface-container-low p-2.5 rounded-xl flex items-center gap-2 relative">
            <span className="material-symbols-outlined text-primary text-lg flex-shrink-0">trip_origin</span>
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-headline font-bold text-secondary uppercase block">Pickup Area</label>
              <input
                id="find-input-pickup"
                type="text"
                placeholder="All areas (e.g. Oakwood, Westwood)"
                value={source}
                onChange={(e) => {
                  setSource(e.target.value);
                  setSelectedRide(null);
                  setSelectedMember(null);
                }}
                className="w-full bg-transparent border-0 outline-none text-xs font-semibold text-on-surface p-0 placeholder:text-outline/70"
              />
            </div>
            {source && (
              <button
                type="button"
                onClick={() => setSource('')}
                className="text-secondary hover:text-on-surface p-1 rounded-full text-xs"
                title="Clear pickup"
              >
                ✕
              </button>
            )}
          </div>

          <div className="bg-surface-container-low p-2.5 rounded-xl flex items-center gap-2 relative">
            <span className="material-symbols-outlined text-primary-container text-lg flex-shrink-0">flag</span>
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-headline font-bold text-secondary uppercase block">Campus Gate</label>
              <input
                id="find-input-destination"
                type="text"
                placeholder="All gates (e.g. Main Gate, Gate 2)"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setSelectedRide(null);
                  setSelectedMember(null);
                }}
                className="w-full bg-transparent border-0 outline-none text-xs font-semibold text-on-surface p-0 placeholder:text-outline/70"
              />
            </div>
            {destination && (
              <button
                type="button"
                onClick={() => setDestination('')}
                className="text-secondary hover:text-on-surface p-1 rounded-full text-xs"
                title="Clear gate"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Quick Corridor Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-headline font-bold text-secondary uppercase flex-shrink-0 mr-1">Corridors:</span>
          {[
            { label: 'All Corridors', value: '' },
            { label: 'Oakwood', value: 'Oakwood Apartments' },
            { label: 'Westwood', value: 'Westwood Commons' },
            { label: 'Metro', value: 'Southside Metro' },
            { label: 'Highland Lot', value: 'Highland Park' },
            { label: 'Dorm North', value: 'Dormitory North' }
          ].map(chip => (
            <button
              key={chip.label}
              type="button"
              onClick={() => {
                setSource(chip.value);
                setSelectedRide(null);
                setSelectedMember(null);
              }}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-headline font-bold whitespace-nowrap transition-all ${
                (chip.value === '' && !source) || (chip.value && source.toLowerCase().includes(chip.value.toLowerCase()))
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-secondary hover:text-on-surface'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Departure Time Filter Input & Quick Time Slot Chips */}
        <div className="bg-surface-container-low p-2.5 rounded-xl flex items-center gap-2 relative">
          <span className="material-symbols-outlined text-secondary text-lg flex-shrink-0">schedule</span>
          <div className="flex-1 min-w-0">
            <label className="text-[10px] font-headline font-bold text-secondary uppercase block">
              Departure Time / Slot
            </label>
            <input
              id="find-input-depart-time"
              type="text"
              placeholder="All departure times (e.g. 8:15 AM, 8:30 AM, 9:00 AM)"
              value={departTime}
              onChange={(e) => {
                setDepartTime(e.target.value);
                setSelectedRide(null);
                setSelectedMember(null);
              }}
              className="w-full bg-transparent border-0 outline-none text-xs font-semibold text-on-surface p-0 placeholder:text-outline/70"
            />
          </div>
          {departTime && (
            <button
              type="button"
              onClick={() => {
                setDepartTime('');
                setSelectedRide(null);
                setSelectedMember(null);
              }}
              className="text-secondary hover:text-on-surface p-1 rounded-full text-xs"
              title="Clear departure time to view all rides"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Time Slot Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-headline font-bold text-secondary uppercase flex-shrink-0 mr-1">Time Slots:</span>
          {CAMPUS_TIME_SLOTS.map(slot => (
            <button
              key={slot.id}
              type="button"
              onClick={() => {
                setDepartTime(slot.value);
                setSelectedRide(null);
                setSelectedMember(null);
              }}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-headline font-bold whitespace-nowrap transition-all ${
                (slot.value === '' && !departTime) || (slot.value && departTime.toLowerCase().includes(slot.value.toLowerCase()))
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-secondary hover:text-on-surface'
              }`}
            >
              {slot.label}
            </button>
          ))}
        </div>

        {/* Active Time Slot Banner */}
        {departTime && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs">
            <span className="flex items-center gap-1.5 font-headline font-bold text-primary text-[11px]">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>Showing rides scheduled for: <strong>{departTime}</strong></span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold border border-emerald-300 ml-1">
                Exact Time Match
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                setDepartTime('');
                setSelectedRide(null);
                setSelectedMember(null);
              }}
              className="text-[10px] font-headline font-bold text-secondary hover:text-primary underline"
            >
              Show all times ✕
            </button>
          </div>
        )}

        {/* Dedicated Female Commuters Only Toggle */}
        <div className="flex items-center justify-between pt-1 border-t border-surface-container">
          <label htmlFor="find-checkbox-female-only" className="flex items-center gap-2.5 cursor-pointer select-none">
            <div className={`w-8 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${femaleOnly ? 'bg-pink-600' : 'bg-surface-container-highest'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${femaleOnly ? 'translate-x-3' : 'translate-x-0'}`}></div>
            </div>
            <input
              id="find-checkbox-female-only"
              type="checkbox"
              checked={femaleOnly}
              onChange={(e) => {
                setFemaleOnly(e.target.checked);
                setSelectedRide(null);
                setSelectedMember(null);
              }}
              className="sr-only"
            />
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-pink-600 text-sm">female</span>
              <span className="font-headline font-bold text-xs text-on-surface">
                {isDriverMode ? 'Female Passengers Only' : 'Female Drivers Only'}
              </span>
            </div>
          </label>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            femaleOnly ? 'bg-pink-100 text-pink-700 border border-pink-200' : 'text-secondary bg-surface-container'
          }`}>
            {femaleOnly ? '🛡️ Women-Safe (Male Excluded)' : 'All Commuters'}
          </span>
        </div>

        {/* Live Calculated Distance & Duration Telemetry Card */}
        <div className="bg-primary-container/10 border border-primary-container/30 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs animate-fadeIn">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-primary text-on-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-base">route</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-headline font-black text-xs sm:text-sm text-primary">
                  {findRouteMetrics.distanceText || `${findRouteMetrics.distanceMiles} mi`}
                </span>
                <span className="text-secondary text-xs">•</span>
                <span className="font-headline font-bold text-xs sm:text-sm text-on-surface">
                  ~{findRouteMetrics.durationText}
                </span>
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold">
                  {isGoogleLive ? 'Google Maps Live API' : 'Google Maps Route Engine'}
                </span>
              </div>
              <span className="text-[10px] text-secondary">
                Suggested fair fuel split: <strong className="text-on-surface">{findRouteMetrics.suggestedFare}</strong> · {findRouteMetrics.trafficText}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg flex-shrink-0">
            -{findRouteMetrics.carbonSavedKg}kg CO₂
          </span>
        </div>

        {!isDriverMode && (
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-secondary font-medium">Max Fuel Split:</span>
                <span className="font-bold text-primary">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="20"
                max="150"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-secondary font-medium">Seats Needed:</span>
                <span className="font-bold text-primary">{minSeats} Seat{minSeats > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map(n => (
                  <button
                    key={n}
                    onClick={() => setMinSeats(n)}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                      minSeats === n
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container text-secondary hover:text-on-surface'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Google Campus Route Vector Map */}
      <GoogleCampusMap
        origin={`${activeOrigin}, Stanford, CA`}
        destination={`${activeDest}, Stanford, CA`}
        activeDriverName={isDriverMode ? (currentUser?.name || 'Your Vehicle') : (selectedRide?.driver?.name || 'Live Campus Search')}
        eta={isDriverMode ? (selectedMember?.desiredTime || `${findRouteMetrics.durationText} drive`) : (selectedRide?.departureTime || `${findRouteMetrics.durationText} drive`)}
        height="h-56 sm:h-64"
        showInputs={true}
      />

      {/* RESULTS SECTION: EITHER WAITING PASSENGERS (DRIVER VIEW) OR AVAILABLE DRIVERS (RIDER VIEW) */}
      <div className="space-y-3">
        {isDriverMode ? (
          /* ================= DRIVER VIEW: WAITING LIST OF MEMBERS TO PICK UP ================= */
          <>
            <div className="flex justify-between items-center px-1">
              <span className="font-headline font-bold text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">groups</span>
                <span>Members Waiting to Pick Up ({sortedWaitingMembers.length})</span>
              </span>
              <span className="text-xs text-emerald-600 font-bold">Ready for Pickup</span>
            </div>

            {sortedWaitingMembers.length === 0 ? (
              <div className="bg-surface-container-lowest p-8 rounded-2xl text-center space-y-2 border border-surface-container-high">
                <span className="material-symbols-outlined text-4xl text-secondary/50">hail</span>
                <h4 className="font-headline font-bold text-sm text-on-surface">No waiting members found</h4>
                <p className="text-xs text-secondary">No student riders currently waiting along this route filter.</p>
              </div>
            ) : (
              sortedWaitingMembers.map(member => {
                const isSelected = selectedMember?.id === member.id;
                return (
                  <div
                    key={member.id}
                    id={`member-wait-${member.id}`}
                    onClick={() => setSelectedMember(member)}
                    className={`bg-surface-container-lowest p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                        : 'border-surface-container-high hover:border-emerald-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={member.passenger.avatar}
                          alt={member.passenger.name}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-surface-container-highest"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-headline font-bold text-sm text-on-surface">{member.passenger.name}</span>
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-headline font-bold text-[10px] border border-emerald-200">
                              <span className="material-symbols-outlined text-[11px]">person</span>
                              Rider Waiting
                            </span>
                            <span className="bg-surface-container text-[10px] font-bold px-1.5 py-0.2 rounded text-secondary">
                              {member.passenger.major}
                            </span>
                          </div>
                          <div className="text-xs text-secondary flex items-center gap-1">
                            <span className="material-symbols-outlined text-amber-500 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="font-bold text-on-surface">{member.passenger.rating}</span>
                            <span>·</span>
                            <span>{member.passenger.ridesTaken} rides taken</span>
                            {member.passenger.mutualCourses?.length > 0 && (
                              <>
                                <span>·</span>
                                <span className="text-primary font-medium">{member.passenger.mutualCourses[0]}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-headline font-extrabold text-lg text-emerald-700">₹{Math.round(member.offeredContribution)}</span>
                        <span className="block text-[10px] text-secondary">offered split</span>
                      </div>
                    </div>

                    {/* Path & Times */}
                    <div className="mt-3 bg-surface-container-low p-2.5 rounded-xl flex items-center justify-between text-xs">
                      <div className="truncate">
                        <span className="font-medium text-secondary">Pickup:</span> <span className="font-semibold text-on-surface">{member.pickup}</span>
                        <br />
                        <span className="font-medium text-secondary">Dropoff:</span> <span className="font-semibold text-on-surface">{member.destination}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-bold text-on-surface block">Leaves ~{member.desiredTime}</span>
                        <span className="text-[11px] text-secondary font-medium block">
                          {member.distanceMiles} • ~{member.estimatedDuration}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-surface-container">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-secondary">
                          Needs {member.seatsNeeded} Seat{member.seatsNeeded > 1 ? 's' : ''}
                        </span>
                        {member.femaleDriverPreferred && (
                          <span className="text-[10px] font-bold text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded border border-pink-200">
                            Prefers Female Driver
                          </span>
                        )}
                      </div>

                      <button
                        id={`btn-pickup-member-${member.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onPickUpMember) {
                            onPickUpMember(member);
                          }
                        }}
                        className="px-4 py-1.5 font-headline font-bold text-xs rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                        title="Accept this passenger and confirm pickup on your route"
                      >
                        <span className="material-symbols-outlined text-[15px]">person_add</span>
                        <span>Pick Up Rider</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        ) : (
          /* ================= RIDER VIEW: MATCHING DRIVER ROUTES ================= */
          <>
            <div className="flex justify-between items-center px-1">
              <span className="font-headline font-bold text-xs uppercase tracking-wider text-secondary">
                Matching Driver Routes ({sortedSearchResults.length})
              </span>
              <span className="text-xs text-primary font-medium">Lowest Emission Order</span>
            </div>

            {sortedSearchResults.length === 0 ? (
              <div className="bg-surface-container-lowest p-8 rounded-2xl text-center space-y-3 border border-surface-container-high shadow-xs">
                <span className="material-symbols-outlined text-4xl text-secondary/50">search_off</span>
                <h4 className="font-headline font-bold text-sm text-on-surface">No direct matching rides found</h4>
                <p className="text-xs text-secondary max-w-xs mx-auto">
                  No driver routes currently match {departTime ? `the "${departTime}" time slot` : (source ? `"${source}"` : 'your filters')}. Try selecting another time slot or choosing another corridor.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSource('');
                    setDestination('');
                    setDepartTime('');
                    setFemaleOnly(false);
                    setMaxPrice(100);
                    setMinSeats(1);
                  }}
                  className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-xl shadow hover:bg-primary-fixed-dim transition-all inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">restart_alt</span>
                  <span>View All Available Rides & Times</span>
                </button>
              </div>
            ) : (
              sortedSearchResults.map(ride => {
                const isSelected = selectedRide?.id === ride.id;
                return (
                  <div
                    key={ride.id}
                    onClick={() => setSelectedRide(ride)}
                    className={`bg-surface-container-lowest p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 shadow-md'
                        : 'border-surface-container-high hover:border-surface-variant shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={ride.driver.avatar}
                          alt={ride.driver.name}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-surface-container-highest"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-headline font-bold text-sm text-on-surface">{ride.driver.name}</span>
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
                            <span className="bg-surface-container text-[10px] font-bold px-1.5 py-0.2 rounded text-secondary">
                              {ride.driver.major}
                            </span>
                          </div>
                          <div className="text-xs text-secondary flex items-center gap-1">
                            <span className="material-symbols-outlined text-amber-500 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="font-bold text-on-surface">{ride.driver.rating}</span>
                            <span>·</span>
                            <span className="text-primary font-semibold">{ride.vehicleType}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-headline font-extrabold text-lg text-primary">₹{Math.round(ride.pricePerSeat)}</span>
                        <span className="block text-[10px] text-emerald-700 font-bold">or 25 🌱 Credits</span>
                      </div>
                    </div>

                    {/* Path & Times */}
                    <div className="mt-3 bg-surface-container-low p-2.5 rounded-xl flex items-center justify-between text-xs">
                      <div className="truncate">
                        <span className="font-medium text-secondary">From:</span> <span className="font-semibold text-on-surface">{ride.pickup}</span>
                        <br />
                        <span className="font-medium text-secondary">To:</span> <span className="font-semibold text-on-surface">{ride.destination}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-bold text-on-surface block text-sm">{ride.departureTime}</span>
                          {departTime && matchesTimeSlot(ride.departureTime, departTime, 0) && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold border border-emerald-300">
                              Exact Match
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-secondary font-medium block">
                          {ride.distanceMiles} • ~{ride.estimatedDuration || '6 mins'}
                        </span>
                        <span className="text-[11px] text-primary font-bold">🌱 -{ride.carbonOffsetKg}kg CO₂</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-surface-container">
                      <span className="text-xs font-semibold text-secondary">
                        {ride.availableSeats} of {ride.totalSeats} seats left
                      </span>
                      <button
                        id={`btn-find-book-${ride.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookSeat(ride);
                        }}
                        className={`px-4 py-1.5 font-headline font-bold text-xs rounded-xl shadow active:scale-95 transition-all flex items-center gap-1.5 ${
                          isDemoUser
                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                            : 'bg-primary text-on-primary hover:bg-primary-fixed-dim hover:text-on-primary-fixed'
                        }`}
                        title={isDemoUser ? 'Student Demo: Booking access is restricted. Click for details.' : 'Request a seat'}
                      >
                        {isDemoUser && <span className="material-symbols-outlined text-[13px]">lock</span>}
                        <span>Request Seat</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

    </div>
  );
}
