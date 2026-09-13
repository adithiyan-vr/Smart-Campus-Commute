import React, { useState } from 'react';

export default function MyRidesView({ 
  userRides, 
  onOpenChat, 
  onTriggerSos, 
  onUpdateRideStatus, 
  onCancelRide 
}) {
  const [filterTab, setFilterTab] = useState('upcoming'); // 'upcoming' | 'past'

  const ridesToDisplay = userRides.filter(r => {
    if (filterTab === 'upcoming') {
      return r.status === 'CONFIRMED' || r.status === 'IN_TRANSIT' || r.status === 'PENDING';
    } else {
      return r.status === 'COMPLETED' || r.status === 'CANCELLED';
    }
  });

  const totalCarbonSaved = userRides.reduce((sum, r) => sum + (parseFloat(r.carbonSavedKg) || 0), 0).toFixed(1);

  return (
    <div className="px-4 py-3 flex flex-col gap-4 pb-24 max-w-2xl mx-auto">
      
      {/* Title & Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline font-bold text-xl text-on-surface">My Campus Commutes</h2>
          <p className="font-body text-xs text-secondary">
            Manage your booked seats and offered carpool routes.
          </p>
        </div>

        <div className="bg-primary-container/20 px-3 py-1 rounded-full text-xs font-bold text-on-primary-container flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">eco</span>
          <span>{totalCarbonSaved} kg CO₂ Saved</span>
        </div>
      </div>

      {/* Tab Controls: Upcoming vs Past */}
      <div className="grid grid-cols-2 p-1 bg-surface-container rounded-2xl border border-surface-container-high">
        <button
          onClick={() => setFilterTab('upcoming')}
          className={`py-2 rounded-xl font-headline text-xs font-bold transition-all ${
            filterTab === 'upcoming'
              ? 'bg-surface-container-lowest text-on-surface shadow-sm'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          Upcoming ({userRides.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length})
        </button>
        <button
          onClick={() => setFilterTab('past')}
          className={`py-2 rounded-xl font-headline text-xs font-bold transition-all ${
            filterTab === 'past'
              ? 'bg-surface-container-lowest text-on-surface shadow-sm'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          Past Rides ({userRides.filter(r => r.status === 'COMPLETED' || r.status === 'CANCELLED').length})
        </button>
      </div>

      {/* Ride Cards List */}
      <div className="space-y-3">
        {ridesToDisplay.length === 0 ? (
          <div className="bg-surface-container-lowest p-8 rounded-2xl text-center space-y-2 border border-surface-container-high">
            <span className="material-symbols-outlined text-4xl text-secondary/50">directions_car</span>
            <h4 className="font-headline font-bold text-sm text-on-surface">No {filterTab} rides found</h4>
            <p className="text-xs text-secondary">Search commutes or offer a ride to connect with campus peers.</p>
          </div>
        ) : (
          ridesToDisplay.map(ride => {
            const isConfirmed = ride.status === 'CONFIRMED';
            const isInTransit = ride.status === 'IN_TRANSIT';

            return (
              <div
                key={ride.id}
                className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-container-high/80 space-y-3 relative overflow-hidden"
              >
                {/* Status Pill Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={ride.driverAvatar}
                      alt={ride.driverName}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-surface-container-highest"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-headline font-bold text-sm text-on-surface">{ride.driverName}</span>
                        <span className="bg-surface-container text-[10px] font-bold px-1.5 py-0.2 rounded text-secondary uppercase">
                          {ride.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-secondary">{ride.time}</div>
                    </div>
                  </div>

                  <span className={`font-headline font-bold text-xs px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    ride.status === 'CONFIRMED' ? 'bg-primary-container/25 text-on-primary-container border border-primary-container' :
                    ride.status === 'IN_TRANSIT' ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse' :
                    ride.status === 'COMPLETED' ? 'bg-surface-container text-secondary' :
                    'bg-error-container text-on-error-container'
                  }`}>
                    {ride.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Route Path */}
                <div className="bg-surface-container-low p-2.5 rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-base">route</span>
                    <span>{ride.route}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-secondary pt-0.5">
                    <span>{ride.vehicle || 'Standard Vehicle'}</span>
                    <span className="font-bold text-primary">{ride.price}</span>
                  </div>
                </div>

                {/* Actions & Simulation for Active Rides */}
                {(isConfirmed || isInTransit) && (
                  <div className="pt-2 border-t border-surface-container flex flex-wrap items-center justify-between gap-2">
                    
                    <div className="flex items-center gap-2">
                      {/* In-app Chat Button */}
                      <button
                        id={`btn-chat-${ride.id}`}
                        onClick={() => onOpenChat(ride)}
                        className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl font-headline font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base text-primary">chat</span>
                        <span>Chat</span>
                      </button>

                      {/* Red Emergency SOS Button */}
                      <button
                        id={`btn-sos-${ride.id}`}
                        onClick={() => onTriggerSos(ride)}
                        className="px-3 py-1.5 bg-error text-on-error rounded-xl font-headline font-bold text-xs flex items-center gap-1 shadow-sm hover:opacity-90 active:scale-95 transition-all"
                      >
                        <span className="material-symbols-outlined text-base">warning</span>
                        <span>SOS</span>
                      </button>
                    </div>

                    {/* Simulation Progression Buttons */}
                    <div className="flex items-center gap-1.5">
                      {isConfirmed && (
                        <button
                          onClick={() => onUpdateRideStatus(ride.id, 'IN_TRANSIT')}
                          className="px-3 py-1.5 bg-primary text-on-primary font-headline font-bold text-xs rounded-xl shadow-sm hover:bg-primary-fixed-dim hover:text-on-primary-fixed transition-all"
                        >
                          Start Ride
                        </button>
                      )}

                      {isInTransit && (
                        <button
                          onClick={() => onUpdateRideStatus(ride.id, 'COMPLETED')}
                          className="px-3 py-1.5 bg-primary text-on-primary font-headline font-bold text-xs rounded-xl shadow-sm hover:bg-primary-fixed-dim hover:text-on-primary-fixed transition-all"
                        >
                          Complete
                        </button>
                      )}

                      <button
                        onClick={() => onCancelRide(ride.id)}
                        className="px-2.5 py-1.5 text-secondary hover:text-error text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
