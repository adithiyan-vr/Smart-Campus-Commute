import React, { useState } from 'react';

export default function EcoImpactView({ user }) {
  const [commuteDays, setCommuteDays] = useState(4);
  const [distanceMi, setDistanceMi] = useState(6);

  // Carbon calculator logic: approx 0.404 kg CO2 per mile for avg car, split by 2-3 riders
  const weeklyCo2SavedKg = ((distanceMi * 2 * commuteDays * 0.404) * 0.65).toFixed(1);
  const monthlySavingsDollars = (distanceMi * 2 * commuteDays * 4 * 0.45).toFixed(0);

  return (
    <div className="px-4 py-3 flex flex-col gap-4 pb-24 max-w-xl mx-auto">
      
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-container/20 text-on-primary-container text-xs font-bold uppercase tracking-wider mb-1">
          <span className="material-symbols-outlined text-sm">nest_eco_leaf</span>
          <span>Sustainability Hub</span>
        </div>
        <h2 className="font-headline font-bold text-xl text-on-surface">Campus Carbon Offset Engine</h2>
        <p className="font-body text-xs text-secondary">
          Track individual and collective emissions prevented through shared student rides.
        </p>
      </div>

      {/* Eco-Credits Campus Wallet Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-5 rounded-3xl text-white shadow-lg shadow-emerald-700/20 relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-white/15 rounded-xl text-xl backdrop-blur-md">🌱</span>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-100 tracking-wider block">
                  Official Campus Eco-Wallet
                </span>
                <h3 className="font-headline font-extrabold text-lg">My Eco-Credits Balance</h3>
              </div>
            </div>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
              {user ? 'Active Student' : 'Guest'}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-headline font-black text-4xl tracking-tight">
              {user?.ecoCredits ?? 120}
            </span>
            <span className="text-emerald-100 font-bold text-sm">Credits Available</span>
          </div>

          <p className="text-xs text-emerald-100 leading-relaxed">
            Credits are earned automatically when you offer campus rides to students, and can be used directly as payment for your own trips across campus.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/20 text-xs">
            <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl">
              <span className="text-[10px] text-emerald-200 block font-semibold">How to Earn:</span>
              <span className="font-bold">+25–30 Credits</span> per student passenger
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl">
              <span className="text-[10px] text-emerald-200 block font-semibold">How to Spend:</span>
              <span className="font-bold">25 Credits</span> per free ride booked
            </div>
          </div>
        </div>
      </div>

      {/* Main Big Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-sm text-center">
          <span className="material-symbols-outlined text-2xl text-primary mb-1">forest</span>
          <div className="font-headline font-black text-2xl text-on-surface">1,842 kg</div>
          <div className="text-[11px] font-bold text-secondary uppercase">CO₂ Prevented Campus-Wide</div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-sm text-center">
          <span className="material-symbols-outlined text-2xl text-primary-container mb-1">payments</span>
          <div className="font-headline font-black text-2xl text-primary">₹2,45,000</div>
          <div className="text-[11px] font-bold text-secondary uppercase">Student Gas Money Saved</div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-sm text-center">
          <span className="material-symbols-outlined text-2xl text-secondary mb-1">commute</span>
          <div className="font-headline font-black text-2xl text-on-surface">2,410+</div>
          <div className="text-[11px] font-bold text-secondary uppercase">Car Trips Eliminated</div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-sm text-center">
          <span className="material-symbols-outlined text-2xl text-amber-500 mb-1">local_gas_station</span>
          <div className="font-headline font-black text-2xl text-on-surface">420 gal</div>
          <div className="text-[11px] font-bold text-secondary uppercase">Gasoline Conserved</div>
        </div>

      </div>

      {/* Interactive Carbon Calculator (PRD 3.7 Add-on) */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-sm space-y-3">
        <h3 className="font-headline font-bold text-sm text-on-surface flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-base">calculate</span>
          <span>Your Personalized Commute Savings Estimator</span>
        </h3>

        <div className="space-y-2 text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-secondary font-medium">Weekly Commute Days:</span>
              <span className="font-bold text-primary">{commuteDays} Days / Week</span>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              value={commuteDays}
              onChange={(e) => setCommuteDays(parseInt(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-secondary font-medium">One-Way Distance to Campus:</span>
              <span className="font-bold text-primary">{distanceMi} Miles</span>
            </div>
            <input
              type="range"
              min="2"
              max="25"
              value={distanceMi}
              onChange={(e) => setDistanceMi(parseInt(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Calculated Result Card */}
        <div className="bg-surface-container-low p-3.5 rounded-xl flex items-center justify-between border border-surface-container text-xs">
          <div>
            <span className="text-secondary text-[11px] block">Estimated Monthly Impact:</span>
            <span className="font-headline font-bold text-primary text-sm">
              🌱 {(weeklyCo2SavedKg * 4).toFixed(1)} kg CO₂ Saved
            </span>
          </div>
          <div className="text-right">
            <span className="text-secondary text-[11px] block">Wallet Savings:</span>
            <span className="font-headline font-extrabold text-on-surface text-sm text-emerald-600">
              +₹{Math.round(distanceMi * 2 * commuteDays * 4 * 12)} / mo
            </span>
          </div>
        </div>
      </div>

      {/* Department Leaderboard */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-sm space-y-3">
        <h3 className="font-headline font-bold text-sm text-on-surface flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-base">trophy</span>
          <span>Inter-Department Carpool Leaderboard</span>
        </h3>

        <div className="space-y-2 text-xs">
          {[
            { rank: '1', dept: 'Computer Science & Software', co2: '584.2 kg', trips: 412, award: '🥇' },
            { rank: '2', dept: 'Mechanical & Civil Engineering', co2: '419.0 kg', trips: 289, award: '🥈' },
            { rank: '3', dept: 'School of Medicine & BioTech', co2: '320.5 kg', trips: 204, award: '🥉' },
            { rank: '4', dept: 'Undergraduate Humanities', co2: '210.0 kg', trips: 140, award: '' }
          ].map(d => (
            <div key={d.dept} className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low border border-surface-container">
              <div className="flex items-center gap-2">
                <span className="font-bold text-secondary w-4 text-center">{d.rank}</span>
                <span className="font-semibold text-on-surface">{d.dept}</span>
                {d.award && <span className="text-sm">{d.award}</span>}
              </div>
              <span className="font-mono font-bold text-primary text-xs">{d.co2}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
