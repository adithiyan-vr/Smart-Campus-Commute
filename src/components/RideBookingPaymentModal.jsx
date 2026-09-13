import React, { useState } from 'react';

export default function RideBookingPaymentModal({
  isOpen,
  onClose,
  ride,
  user,
  onConfirmBooking
}) {
  const [paymentMethod, setPaymentMethod] = useState('eco_credits'); // 'eco_credits' | 'cash'
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !ride) return null;

  const userCredits = user?.ecoCredits ?? 120;
  const creditsRequired = 25;
  const hasEnoughCredits = userCredits >= creditsRequired;
  const cashAmount = Math.round(ride.pricePerSeat || 50);

  const handleConfirm = async () => {
    if (paymentMethod === 'eco_credits' && !hasEnoughCredits) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirmBooking({
        ride,
        paymentMethod,
        creditsPerSeat: creditsRequired
      });
      onClose();
    } catch (err) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-surface-container-high overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-surface-container-high/60 flex items-center justify-between bg-surface-container-lowest">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">confirmation_number</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-base sm:text-lg text-on-surface">
                Reserve Campus Ride
              </h3>
              <p className="text-[11px] text-secondary font-medium">
                Choose your payment method for this commute
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-secondary hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Ride Summary Card */}
          <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-surface-container-high space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={ride.driver?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
                />
                <div>
                  <div className="font-headline font-bold text-xs sm:text-sm text-on-surface flex items-center gap-1.5">
                    <span>{ride.driver?.name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary font-mono text-[10px] font-bold">
                      ★ {ride.driver?.rating || '5.0'}
                    </span>
                  </div>
                  <div className="text-[11px] text-secondary">
                    {ride.vehicleType || 'Campus Commuter'} · {ride.availableSeats} seat(s) left
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-headline font-bold text-[10px] uppercase">
                {ride.departureTime}
              </span>
            </div>

            <div className="bg-surface-container-low p-2.5 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-2 text-on-surface font-semibold">
                <span className="material-symbols-outlined text-sm text-primary">trip_origin</span>
                <span className="truncate">{ride.pickup}</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface font-bold">
                <span className="material-symbols-outlined text-sm text-emerald-600">location_on</span>
                <span className="truncate">{ride.destination}</span>
              </div>
            </div>
          </div>

          {/* User Eco-Credits Balance Pill */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <div>
                <span className="text-[11px] text-emerald-700 font-semibold block">Your Eco-Credits Balance</span>
                <span className="font-headline font-extrabold text-sm text-emerald-900">
                  {userCredits} Credits Available
                </span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-200/60 px-2 py-0.5 rounded-full">
              University Wallet
            </span>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-headline font-bold uppercase tracking-wider text-secondary">
              Select Payment Method
            </label>

            {/* Option 1: Eco-Credits (Recommended) */}
            <div
              id="pay-option-eco-credits"
              onClick={() => {
                if (hasEnoughCredits) setPaymentMethod('eco_credits');
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                paymentMethod === 'eco_credits'
                  ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                  : hasEnoughCredits
                  ? 'bg-surface-container-lowest border-surface-container-high hover:border-emerald-300'
                  : 'bg-surface-container-low/60 border-surface-container opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors border-emerald-600 bg-white">
                    {paymentMethod === 'eco_credits' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline font-bold text-xs sm:text-sm text-on-surface">
                        Pay with Eco-Credits
                      </span>
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-headline text-[9px] font-extrabold uppercase tracking-wider">
                        Zero Cash
                      </span>
                    </div>
                    <p className="text-[11px] text-secondary mt-0.5">
                      100% Free student trip powered by green campus carpooling.
                    </p>
                    {hasEnoughCredits ? (
                      <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                        ✓ Balance after trip: {userCredits - creditsRequired} Credits
                      </div>
                    ) : (
                      <div className="text-[11px] text-error font-bold mt-1">
                        ⚠️ Insufficient balance ({userCredits}/{creditsRequired} credits needed). Provide rides to earn credits!
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-headline font-black text-base text-emerald-700 block">
                    🌱 25
                  </span>
                  <span className="text-[10px] text-secondary font-bold uppercase">Credits</span>
                </div>
              </div>
            </div>

            {/* Option 2: Cash / Campus Fuel Split */}
            <div
              id="pay-option-cash"
              onClick={() => setPaymentMethod('cash')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                paymentMethod === 'cash'
                  ? 'bg-primary-container/10 border-primary ring-2 ring-primary/20 shadow-sm'
                  : 'bg-surface-container-lowest border-surface-container-high hover:border-primary/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors border-primary bg-white">
                    {paymentMethod === 'cash' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline font-bold text-xs sm:text-sm text-on-surface">
                        Campus Fuel Split / Cash
                      </span>
                    </div>
                    <p className="text-[11px] text-secondary mt-0.5">
                      Direct contribution to driver's gasoline or EV charging cost upon boarding.
                    </p>
                    <div className="text-[11px] text-primary font-semibold mt-1">
                      🌱 Driver still earns +20 Eco-Credits campus carpool incentive.
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-headline font-black text-base text-primary block">
                    ₹{cashAmount}
                  </span>
                  <span className="text-[10px] text-secondary font-bold uppercase">Per Seat</span>
                </div>
              </div>
            </div>

          </div>

          {/* Environmental Incentive Note */}
          <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container flex items-center gap-2 text-[11px] text-secondary">
            <span className="material-symbols-outlined text-primary text-base flex-shrink-0">nature_people</span>
            <span>
              <strong>Win-Win Carpool:</strong> By sharing this ride, {ride.carbonOffsetKg || '2.5'} kg of CO₂ will be prevented from campus atmosphere!
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-surface-container-high/60 bg-surface-container-lowest flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 rounded-xl border border-surface-container-high font-headline font-bold text-xs text-secondary hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-confirm-ride-payment"
            onClick={handleConfirm}
            disabled={isSubmitting || (paymentMethod === 'eco_credits' && !hasEnoughCredits)}
            className={`flex-1 py-2.5 px-4 rounded-xl font-headline font-bold text-xs text-white shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5 ${
              paymentMethod === 'eco_credits'
                ? hasEnoughCredits
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-emerald-300 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-fixed-dim text-on-primary shadow-primary/20'
            }`}
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">
                  {paymentMethod === 'eco_credits' ? 'energy_savings_leaf' : 'check_circle'}
                </span>
                <span>
                  {paymentMethod === 'eco_credits'
                    ? 'Confirm (Pay 25 Credits)'
                    : `Confirm (₹${cashAmount} Cash)`}
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
