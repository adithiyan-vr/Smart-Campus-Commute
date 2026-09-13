import React, { useState } from 'react';

export default function ActiveRideSosModal({ isOpen, onClose, activeRide }) {
  const [sosTransmitted, setSosTransmitted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-surface-container-lowest border-2 border-error rounded-3xl shadow-2xl overflow-hidden text-on-surface">
        
        {/* Red Alert Header */}
        <div className="bg-error text-on-error p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-2xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
              fmd_bad
            </span>
            <div>
              <h3 className="font-headline font-bold text-base uppercase tracking-wider">
                Emergency SOS Trigger
              </h3>
              <p className="text-xs text-on-error/80">Campus Police & Emergency Dispatch</p>
            </div>
          </div>
          <button
            id="btn-close-sos"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          
          {sosTransmitted ? (
            <div className="bg-error-container text-on-error-container p-4 rounded-2xl text-center space-y-2">
              <span className="material-symbols-outlined text-4xl text-error animate-bounce">
                notifications_active
              </span>
              <h4 className="font-headline font-bold text-sm">EMERGENCY ALERT ACTIVE</h4>
              <p className="font-body text-xs">
                Your live campus GPS coordinates, vehicle plate, and route telemetry have been dispatched to University Campus Police Operations.
              </p>
              <div className="font-mono text-xs bg-surface-container-lowest p-2 rounded-xl border border-error/30 mt-2">
                Incident Reference: #SOS-CAMPUS-{Math.floor(100000 + Math.random() * 900000)}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-surface-container-low p-3.5 rounded-2xl border border-surface-container-high text-xs space-y-1">
                <span className="font-headline font-bold text-secondary uppercase text-[10px]">
                  Live Location Broadcast Telemetry
                </span>
                <div className="flex items-center justify-between font-mono font-semibold text-on-surface">
                  <span>GPS: 37.4285° N, 122.1685° W</span>
                  <span className="text-primary font-bold">● High Accuracy</span>
                </div>
                <div className="text-secondary text-[11px]">
                  Main Campus Perimeter · North Corridor
                </div>
              </div>

              {activeRide && (
                <div className="bg-surface-container-low p-3 rounded-2xl border border-surface-container-high text-xs">
                  <span className="font-headline font-bold text-secondary uppercase text-[10px] block mb-1">
                    Active Carpool Details
                  </span>
                  <div className="font-semibold text-on-surface">{activeRide.driverName}</div>
                  <div className="text-secondary font-mono text-[11px]">{activeRide.vehicle || 'Plate: 7XYZ892'}</div>
                </div>
              )}

              <button
                id="btn-broadcast-sos"
                onClick={() => setSosTransmitted(true)}
                className="w-full py-3.5 bg-error text-on-error font-headline font-bold text-sm rounded-xl shadow-lg shadow-error/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-xl">e911_emergency</span>
                <span>BROADCAST IMMEDIATE SOS</span>
              </button>
            </div>
          )}

          {/* Speed Dials */}
          <div className="space-y-2 pt-2 border-t border-surface-container">
            <span className="font-headline font-bold text-secondary text-[10px] uppercase block">
              Direct Phone Speed Dial
            </span>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:6505550199"
                className="flex items-center gap-2 p-2.5 bg-surface-container-low hover:bg-surface-container rounded-xl border border-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-error text-lg">local_police</span>
                <div className="min-w-0 text-left">
                  <div className="font-headline font-bold text-xs truncate">Campus Police</div>
                  <div className="font-mono text-[10px] text-secondary">(650) 555-0199</div>
                </div>
              </a>

              <a
                href="tel:911"
                className="flex items-center gap-2 p-2.5 bg-surface-container-low hover:bg-surface-container rounded-xl border border-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-error text-lg">emergency</span>
                <div className="min-w-0 text-left">
                  <div className="font-headline font-bold text-xs truncate">911 Dispatch</div>
                  <div className="font-mono text-[10px] text-secondary">Dial 911</div>
                </div>
              </a>
            </div>
          </div>

        </div>

        <div className="p-3 bg-surface-container-low border-t border-surface-container text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-surface-container text-on-surface rounded-xl font-headline text-xs font-semibold hover:bg-surface-container-high transition-colors"
          >
            Dismiss Safety Panel
          </button>
        </div>

      </div>
    </div>
  );
}
