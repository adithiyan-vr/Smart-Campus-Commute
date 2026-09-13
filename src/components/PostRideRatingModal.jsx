import React, { useState } from 'react';

export default function PostRideRatingModal({
  isOpen,
  onClose,
  ride,
  onSubmitRating
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState(['Punctual Departure', 'Clean Hybrid / EV']);
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !ride) return null;

  const availableTags = [
    '⚡ Punctual Departure',
    '🌿 Clean Hybrid / EV',
    '🛡️ Smooth & Safe Drive',
    '💬 Friendly Conversation',
    '🎓 Great Campus Peer',
    '🎵 Great Commute Music'
  ];

  const toggleTag = (tag) => {
    const cleanTag = tag.replace(/^[^\w\s]+/, '').trim();
    if (selectedTags.includes(cleanTag)) {
      setSelectedTags(selectedTags.filter(t => t !== cleanTag));
    } else {
      setSelectedTags([...selectedTags, cleanTag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (onSubmitRating) {
        await onSubmitRating({
          rideId: ride.id,
          driverName: ride.driverName,
          rating,
          tags: selectedTags,
          note: reviewNote.trim()
        });
      }
      onClose();
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
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-base sm:text-lg text-on-surface">
                Post-Ride Rating
              </h3>
              <p className="text-[11px] text-secondary font-medium">
                Rate your driver & campus commute experience
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

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Driver Card Summary */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low border border-surface-container">
            <img
              src={ride.driverAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
              alt={ride.driverName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/30"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-bold text-sm text-on-surface truncate">
                  {ride.driverName}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary font-mono text-[10px] font-bold">
                  Verified .edu
                </span>
              </div>
              <p className="text-[11px] text-secondary truncate mt-0.5">
                {ride.route || 'Campus Route'} · {ride.time || 'Today'}
              </p>
            </div>
          </div>

          {/* Star Rating Selector */}
          <div className="text-center p-3 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-1.5">
            <span className="text-[11px] uppercase font-bold text-secondary tracking-wider block">
              How was your trip?
            </span>
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                >
                  <span
                    className={`material-symbols-outlined text-3xl sm:text-4xl ${
                      (hoverRating || rating) >= star ? 'text-amber-500' : 'text-surface-container-highest'
                    }`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
            <span className="font-headline font-bold text-xs text-primary block">
              {rating === 5 ? '⭐⭐⭐⭐⭐ Perfect Commute!' :
               rating === 4 ? '⭐⭐⭐⭐ Great Ride!' :
               rating === 3 ? '⭐⭐⭐ Good Commute' :
               rating === 2 ? '⭐⭐ Fair' : '⭐ Needs Improvement'}
            </span>
          </div>

          {/* Praise Tags */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-headline font-bold uppercase tracking-wider text-secondary">
              What made this ride great?
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const cleanTag = tag.replace(/^[^\w\s]+/, '').trim();
                const isSelected = selectedTags.includes(cleanTag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-primary text-on-primary font-bold shadow-xs'
                        : 'bg-surface-container-low text-secondary hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Note Textarea */}
          <div className="space-y-1">
            <label className="text-[11px] font-headline font-bold uppercase tracking-wider text-secondary">
              Leave a note for {ride.driverName.split(' ')[0]} (Optional)
            </label>
            <textarea
              rows={2}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Thanks for the smooth dropoff at Gate 1!"
              className="w-full bg-surface-container-low p-2.5 rounded-xl border border-surface-container text-xs text-on-surface outline-none resize-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Eco-Impact Badge */}
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <div>
                <span className="font-headline font-bold text-emerald-900 block">
                  Campus Carbon Impact
                </span>
                <span className="text-[11px] text-emerald-700">
                  {ride.carbonSavedKg || '2.4'} kg CO₂ saved on this shared trip
                </span>
              </div>
            </div>
            <span className="font-headline font-black text-emerald-800 text-sm">
              +25 Credits
            </span>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl border border-surface-container-high font-headline font-bold text-xs text-secondary hover:bg-surface-container transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              id="btn-submit-post-ride-rating"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-on-primary font-headline font-bold text-xs shadow-[0_4px_16px_rgba(0,108,73,0.25)] hover:bg-primary-fixed-dim hover:text-on-primary-fixed transition-all active:scale-98 flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>Submit Rating</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
