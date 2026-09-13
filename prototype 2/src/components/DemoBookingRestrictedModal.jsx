import React from 'react';

export default function DemoBookingRestrictedModal({ 
  isOpen, 
  onClose, 
  onOpenRegister,
  ride 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-surface-container-lowest border-2 border-amber-500 rounded-3xl shadow-2xl overflow-hidden text-on-surface">
        
        {/* Amber Alert Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">no_accounts</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm sm:text-base uppercase tracking-wider">
                Booking Access Restricted
              </h3>
              <p className="text-xs text-amber-100">Student Demo Account Notice</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Target Ride Context (if available) */}
          {ride && (
            <div className="p-3 bg-surface-container-low rounded-2xl border border-surface-container flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-secondary font-headline uppercase font-bold block">
                  Target Carpool Route
                </span>
                <span className="font-bold text-on-surface text-xs truncate">
                  {ride.pickup} ➔ {ride.destination}
                </span>
                <div className="text-[11px] text-secondary">
                  Driver: {ride.driver?.name} · Departure: {ride.departureTime}
                </div>
              </div>
              <span className="px-2 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-lg text-[10px]">
                Restricted
              </span>
            </div>
          )}

          {/* Explanation Banner */}
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-amber-950">
            <span className="material-symbols-outlined text-amber-600 text-lg flex-shrink-0 mt-0.5">
              shield_lock
            </span>
            <div className="space-y-1">
              <span className="font-headline font-bold block">
                Student Demo Evaluation Mode
              </span>
              <p className="text-[11px] leading-relaxed text-amber-900">
                You are currently browsing as a <strong>Guest / Evaluation Demo</strong>. To protect driver availability and prevent false seat reservations on campus corridors, <strong>booking access is restricted for unverified demo profiles</strong>.
              </p>
            </div>
          </div>

          {/* Verification Requirements List */}
          <div className="space-y-2 bg-surface-container-low/60 p-3 rounded-2xl border border-surface-container">
            <span className="text-[10px] font-headline font-bold text-secondary uppercase block">
              To Reserve Seats & Carpool on Campus:
            </span>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                <span>Register your personal verified <strong className="font-mono">@university.edu</strong> email</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                <span>Unlock 1-click reservations, live coordinate chat, & SOS dispatch</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                <span>Accumulate verified eco-credits & Department leaderboard rankings</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              id="btn-demo-register-cta"
              onClick={() => {
                onClose();
                onOpenRegister();
              }}
              className="w-full py-3 bg-primary hover:bg-primary-fixed-dim text-on-primary font-headline font-bold text-xs rounded-xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <span className="material-symbols-outlined text-base">how_to_reg</span>
              <span>Register Real Student Account to Book</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface rounded-xl font-headline text-xs font-semibold transition-colors"
            >
              Continue Browsing as Demo
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-surface-container-low border-t border-surface-container text-[10px] text-secondary text-center">
          🔒 Campus Safety Policy: Closed-loop carpool bookings require an active student registration.
        </div>

      </div>
    </div>
  );
}
