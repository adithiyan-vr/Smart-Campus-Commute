import React, { useState } from 'react';
import { CAMPUS_GATES } from '../data/campusState';
import GoogleCampusMap from '../components/GoogleCampusMap';
import { calculateDistanceAndDuration, useLiveRouteMetrics } from '../services/routeCalculator';

export default function PostRideView({ user, onPublishRide, onOpenAuth }) {
  const [origin, setOrigin] = useState('The Verge Apartments (Clubhouse)');
  const [dropoffGate, setDropoffGate] = useState(CAMPUS_GATES[0]);
  const [date, setDate] = useState('Today, Oct 24');
  const [time, setTime] = useState('8:50 AM');
  const [vehicleType, setVehicleType] = useState('car'); // 'car' | 'eco'
  const [availableSeats, setAvailableSeats] = useState(2);
  const [fuelSplit, setFuelSplit] = useState('50');
  const [femaleOnly, setFemaleOnly] = useState(false);

  // Compute live route distance and duration directly from road & Google Maps engine
  const { metrics: postRouteMetrics, isLoading: isPostRouteLoading, isGoogleLive } = useLiveRouteMetrics(origin, dropoffGate);

  if (!user) {
    return (
      <div className="px-4 py-8 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-5 animate-fadeIn">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border-2 border-primary/30 text-primary flex items-center justify-center shadow-xl shadow-primary/10">
          <span className="material-symbols-outlined text-4xl">directions_car</span>
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-headline text-[11px] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">lock</span>
            <span>Authentication Required</span>
          </span>
          <h2 className="font-headline font-bold text-2xl text-on-surface">
            Sign In to Offer Campus Rides
          </h2>
          <p className="font-body text-xs text-secondary leading-relaxed max-w-sm">
            To ensure campus safety and maintain our closed-loop university carpooling network, only verified students and staff with an active account can publish ride listings.
          </p>
        </div>

        <div className="w-full space-y-2.5">
          <button
            id="btn-post-ride-signin"
            onClick={onOpenAuth}
            className="w-full py-3 bg-primary text-on-primary font-headline font-bold text-xs rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-fixed-dim transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">login</span>
            <span>Sign In to Post Ride</span>
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRide = {
      id: `ride_${Date.now()}`,
      driver: {
        name: user.name,
        gender: user.gender || (femaleOnly ? 'female' : 'male'),
        isFemaleDriver: femaleOnly || user.gender === 'female',
        major: user.major,
        rating: user.rating,
        ridesCount: user.completedRides,
        avatar: user.avatar,
        isVerified: true,
        tag: vehicleType === 'eco' ? 'EV Hybrid' : 'Verified .edu',
        mutualCourses: user.enrolledCourses?.slice(0, 2) || []
      },
      pickup: origin,
      destination: dropoffGate,
      departureTime: time,
      distanceMiles: postRouteMetrics.distanceText || `${postRouteMetrics.distanceMiles} miles`,
      estimatedDuration: postRouteMetrics.durationText || `${postRouteMetrics.durationMinutes} mins`,
      pricePerSeat: parseFloat(fuelSplit) || parseFloat(postRouteMetrics.fuelCostPerSeat) || 50,
      availableSeats: availableSeats,
      totalSeats: availableSeats + 1,
      carbonOffsetKg: postRouteMetrics.carbonSavedKg,
      vehicleType: vehicleType === 'eco' ? 'Prius Prime Hybrid' : 'Civic Sedan',
      vehiclePlate: user.vehicle?.plate || '7XYZ892',
      isEv: vehicleType === 'eco',
      femaleOnly: femaleOnly,
      coords: {
        pickup: Array.isArray(postRouteMetrics.originCoords)
          ? postRouteMetrics.originCoords
          : [postRouteMetrics.originCoords?.lat || 37.4180, postRouteMetrics.originCoords?.lng || -122.1790],
        destination: Array.isArray(postRouteMetrics.destinationCoords || postRouteMetrics.destCoords)
          ? (postRouteMetrics.destinationCoords || postRouteMetrics.destCoords)
          : [postRouteMetrics.destCoords?.lat || 37.4285, postRouteMetrics.destCoords?.lng || -122.1685]
      }
    };

    onPublishRide(newRide);
  };

  return (
    <div className="px-4 py-3 pb-24 max-w-xl mx-auto">
      
      {/* POST A RIDE BOTTOM SHEET / DRAWER COMPONENT (Exact Design System Lines 395-500) */}
      <section className="w-full bg-surface-container-lowest rounded-2xl shadow-[0_12px_32px_rgba(11,28,48,0.1)] p-4 sm:p-5 flex flex-col gap-3.5 border border-surface-container-high/70 relative">
        
        {/* Drawer Pull Handle Bar & Header */}
        <div className="w-12 h-1 bg-surface-container-highest rounded-full mx-auto mb-1"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">add_circle</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">Offer a Ride to Campus</h3>
              <span className="font-body-sm text-primary font-medium text-xs">Earn gas money + eco points</span>
            </div>
          </div>
          <span className="font-label-sm bg-primary-container/20 text-on-primary-container px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
            Driver Hub
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          
          {/* Form: Departure Point */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-secondary font-semibold uppercase text-[10px]">
              Departure Origin
            </label>
            <div className="flex items-center gap-2 bg-surface-container-low px-3.5 py-2.5 rounded-xl border border-surface-container">
              <span className="material-symbols-outlined text-secondary text-base">location_on</span>
              <input
                id="postOrigin"
                className="bg-transparent border-0 outline-none text-on-surface font-body-md text-xs sm:text-sm w-full font-medium"
                placeholder="Where are you leaving from?"
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Form: Campus Dropoff Gate Selector */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-secondary font-semibold uppercase text-[10px]">
              Campus Dropoff Gate
            </label>
            <div className="relative bg-surface-container-low rounded-xl px-3.5 py-2.5 flex items-center justify-between border border-surface-container">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="material-symbols-outlined text-primary text-base">account_balance</span>
                <select
                  id="postGate"
                  value={dropoffGate}
                  onChange={(e) => setDropoffGate(e.target.value)}
                  className="bg-transparent border-0 outline-none text-on-surface font-body-md text-xs sm:text-sm font-semibold cursor-pointer appearance-none pr-6 w-full truncate"
                >
                  {CAMPUS_GATES.map(gate => (
                    <option key={gate} value={gate}>{gate}</option>
                  ))}
                </select>
              </div>
              <span className="material-symbols-outlined text-secondary text-base pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Live Google Map & Distance/Duration Telemetry for Driver */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="material-symbols-outlined text-primary text-base">route</span>
                <span className="font-headline font-bold text-xs text-on-surface">Exact Road Distance & Duration</span>
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[9px] font-bold">
                  {isGoogleLive ? 'Google Maps Live API' : 'Google Maps Route Engine'}
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                -{postRouteMetrics.carbonSavedKg} kg CO₂
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center bg-surface-container-lowest/80 p-2 rounded-lg border border-surface-container">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-secondary font-semibold block">Distance</span>
                <span className="font-headline font-black text-xs text-primary">{postRouteMetrics.distanceMiles} mi</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-secondary font-semibold block">Drive Time</span>
                <span className="font-headline font-bold text-xs text-on-surface">~{postRouteMetrics.durationText}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-secondary font-semibold block">Traffic</span>
                <span className="font-headline font-medium text-[11px] text-emerald-700">{postRouteMetrics.trafficText}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-secondary px-1">
              <span>Fair gas split: <strong className="text-on-surface">{postRouteMetrics.suggestedFare}</strong></span>
              <button
                type="button"
                onClick={() => setFuelSplit(postRouteMetrics.fuelCostPerSeat)}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                Use suggested (₹{postRouteMetrics.fuelCostPerSeat})
              </button>
            </div>

            {/* Embedded Live Google Map Corridor */}
            <div className="rounded-xl overflow-hidden border border-surface-container shadow-xs">
              <GoogleCampusMap
                origin={origin}
                destination={dropoffGate}
                height="200px"
                className="w-full"
              />
            </div>
          </div>

          {/* Departure Date & Time Picker Row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-secondary font-semibold uppercase text-[10px]">Date</label>
              <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-2 rounded-xl border border-surface-container">
                <span className="material-symbols-outlined text-secondary text-base">calendar_today</span>
                <input
                  className="bg-transparent border-0 outline-none text-on-surface font-body-md text-xs w-full font-medium"
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-secondary font-semibold uppercase text-[10px]">Time</label>
              <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-2 rounded-xl border border-surface-container">
                <span className="material-symbols-outlined text-secondary text-base">schedule</span>
                <input
                  className="bg-transparent border-0 outline-none text-on-surface font-body-md text-xs w-full font-medium"
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Vehicle Segmented Control */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-secondary font-semibold uppercase text-[10px]">Vehicle Type</label>
            <div className="grid grid-cols-2 gap-1 bg-surface-container-low p-1 rounded-xl border border-surface-container" id="vehicleSegment">
              <button
                type="button"
                onClick={() => setVehicleType('car')}
                className={`py-2 rounded-lg font-label-sm text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  vehicleType === 'car'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">directions_car</span>
                <span>Car / Sedan / SUV</span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleType('eco')}
                className={`py-2 rounded-lg font-label-sm text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                  vehicleType === 'eco'
                    ? 'bg-surface-container-lowest text-on-surface font-bold shadow-sm'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base text-primary">bolt</span>
                <span>Electric / Hybrid</span>
              </button>
            </div>
          </div>

          {/* Seats Selector & Fuel Contribution */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            
            {/* Seats Pills */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-secondary font-semibold uppercase text-[10px]">Available Seats</label>
              <div className="flex items-center gap-1" id="seatsPills">
                {[1, 2, 3, 4].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setAvailableSeats(num)}
                    className={`flex-1 py-1.5 rounded-lg font-label-sm text-xs font-bold transition-all ${
                      availableSeats === num
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-low text-secondary hover:bg-surface-container'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Fuel Contribution */}
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-secondary font-semibold uppercase text-[10px]">Fuel Split / Seat</label>
              <div className="flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-xl border border-surface-container">
                <span className="font-body-md text-primary font-bold text-sm">₹</span>
                <input
                  className="bg-transparent border-0 outline-none text-on-surface font-body-md text-sm w-full font-bold"
                  type="number"
                  step="5"
                  value={fuelSplit}
                  onChange={(e) => setFuelSplit(e.target.value)}
                />
                <span className="font-label-sm text-secondary text-[10px] flex-shrink-0">suggested</span>
              </div>
            </div>

          </div>

          {/* Female Passengers Only Option */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-surface-container">
            <label htmlFor="post-checkbox-female-only" className="flex items-center gap-2 cursor-pointer select-none">
              <input
                id="post-checkbox-female-only"
                type="checkbox"
                checked={femaleOnly}
                onChange={(e) => setFemaleOnly(e.target.checked)}
                className="rounded text-pink-600 focus:ring-pink-500 h-4 w-4"
              />
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-pink-600 text-base">female</span>
                <span className="font-headline font-bold text-xs text-on-surface">Female Commuters Only</span>
              </div>
            </label>
            <span className="text-[10px] text-pink-700 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-full font-bold">
              Women-Safe Carpool
            </span>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              id="btn-publish-ride"
              type="submit"
              className="w-full h-12 bg-primary text-on-primary rounded-xl font-headline font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,108,73,0.25)] hover:bg-primary-fixed-dim hover:text-on-primary-fixed active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined text-xl">rocket_launch</span>
              <span>Publish Ride Offer</span>
            </button>
            <div className="flex items-center justify-center gap-1.5 text-secondary text-[11px]">
              <span className="material-symbols-outlined text-xs text-primary">verified</span>
              <span>Instant campus verification via university portal</span>
            </div>
          </div>

        </form>

      </section>

    </div>
  );
}
