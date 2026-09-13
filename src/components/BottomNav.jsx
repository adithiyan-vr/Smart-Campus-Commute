import React from 'react';

export default function BottomNav({ currentView, setCurrentView, isAdmin, setIsAdmin, unreadCount = 0, user }) {
  const isUserAdmin = user?.role === 'admin';

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/95 backdrop-blur-xl shadow-[0_-2px_16px_rgba(0,0,0,0.06)] border-t border-surface-container-high">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        
        {/* Explore / Feed */}
        <button
          id="nav-btn-explore"
          onClick={() => {
            setIsAdmin(false);
            setCurrentView('explore');
          }}
          className={`flex flex-col items-center justify-center gap-1 min-w-[56px] h-12 transition-all ${
            !isAdmin && currentView === 'explore'
              ? 'text-primary font-bold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">explore</span>
          <span className="font-headline text-[11px]">Explore</span>
        </button>

        {/* Find a Ride */}
        <button
          id="nav-btn-find"
          onClick={() => {
            setIsAdmin(false);
            setCurrentView('find');
          }}
          className={`flex flex-col items-center justify-center gap-1 min-w-[56px] h-12 transition-all ${
            !isAdmin && currentView === 'find'
              ? 'text-primary font-bold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">search</span>
          <span className="font-headline text-[11px]">Find</span>
        </button>

        {/* Post a Ride */}
        <button
          id="nav-btn-post"
          onClick={() => {
            setIsAdmin(false);
            setCurrentView('post');
          }}
          className={`flex flex-col items-center justify-center gap-1 min-w-[56px] h-12 transition-all ${
            !isAdmin && currentView === 'post'
              ? 'text-primary font-bold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">add_circle</span>
          <span className="font-headline text-[11px]">Post</span>
        </button>

        {/* My Rides */}
        <button
          id="nav-btn-my-rides"
          onClick={() => {
            setIsAdmin(false);
            setCurrentView('my-rides');
          }}
          className={`relative flex flex-col items-center justify-center gap-1 min-w-[56px] h-12 transition-all ${
            !isAdmin && (currentView === 'my-rides' || currentView === 'chat')
              ? 'text-primary font-bold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">commute</span>
          <span className="font-headline text-[11px]">My Rides</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-error animate-pulse"></span>
          )}
        </button>

        {/* Impact */}
        <button
          id="nav-btn-impact"
          onClick={() => {
            setIsAdmin(false);
            setCurrentView('impact');
          }}
          className={`flex flex-col items-center justify-center gap-1 min-w-[56px] h-12 transition-all ${
            !isAdmin && currentView === 'impact'
              ? 'text-primary font-bold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">eco</span>
          <span className="font-headline text-[11px]">Impact</span>
        </button>

        {/* Admin Suite: Always present for real-time monitoring */}
        <button
          id="nav-btn-admin"
          onClick={() => {
            if (isUserAdmin) {
              setIsAdmin(true);
              setCurrentView('admin');
            } else {
              setCurrentView('admin');
            }
          }}
          className={`flex flex-col items-center justify-center gap-1 min-w-[56px] h-12 transition-all ${
            isAdmin || currentView === 'admin'
              ? 'text-amber-700 font-bold'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          title="Campus Admin Suite & Real-Time Monitoring"
        >
          <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
          <span className="font-headline text-[11px]">Admin</span>
        </button>

      </div>
    </nav>
  );
}
