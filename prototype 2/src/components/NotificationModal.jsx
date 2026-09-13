import React from 'react';

export default function NotificationModal({ isOpen, onClose, announcements, onClearAll }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-surface-container-lowest border border-surface-container-high rounded-3xl shadow-2xl overflow-hidden text-on-surface">
        
        {/* Header */}
        <div className="bg-surface-container-low p-4 border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">campaign</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-on-surface">Campus Notification Center</h3>
              <p className="text-[11px] text-secondary">Direct announcements from University Admin</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container text-secondary hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* List of Announcements */}
        <div className="p-4 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {announcements.length === 0 ? (
            <div className="text-center py-8 text-secondary space-y-1">
              <span className="material-symbols-outlined text-3xl opacity-50">notifications_off</span>
              <p className="text-xs font-semibold">No announcements right now.</p>
              <p className="text-[10px]">Campus alerts and admin notices will appear here.</p>
            </div>
          ) : (
            announcements.map(ann => (
              <div
                key={ann.id}
                className="p-3 bg-surface-container-low rounded-2xl border border-surface-container space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className={`font-headline font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    ann.target === 'Drivers' 
                      ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                      : ann.target === 'Passengers' 
                      ? 'bg-blue-100 text-blue-900 border border-blue-200' 
                      : 'bg-primary-container/30 text-on-primary-container'
                  }`}>
                    <span className="material-symbols-outlined text-[11px]">
                      {ann.target === 'Drivers' ? 'directions_car' : ann.target === 'Passengers' ? 'person' : 'campaign'}
                    </span>
                    <span>{ann.target || 'All Campus'}</span>
                  </span>
                  <span className="text-[10px] text-secondary font-mono">{ann.date}</span>
                </div>
                <h4 className="font-headline font-bold text-xs text-on-surface pt-1">{ann.title}</h4>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-container-low border-t border-surface-container flex items-center justify-between">
          <button
            onClick={onClearAll}
            className="text-[11px] text-secondary hover:text-error font-medium transition-colors"
          >
            Clear Notifications
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-primary text-on-primary font-headline font-bold text-xs rounded-xl hover:bg-primary-fixed-dim transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
