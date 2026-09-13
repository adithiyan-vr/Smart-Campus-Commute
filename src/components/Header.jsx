import React from 'react';

export default function Header({ 
  currentView, 
  setCurrentView, 
  user, 
  isAdmin, 
  setIsAdmin, 
  onOpenAuth,
  unreadNotificationsCount = 0,
  onToggleNotifications,
  onOpenAdminGatekeeper,
  onLogout
}) {
  const isUserAdmin = user?.role === 'admin';
  const isUserDemo = Boolean(user && user.isDemo);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe border-b border-surface-container-high/60">
      <div className="h-16 px-4 max-w-5xl mx-auto flex items-center justify-between gap-2">
        
        {/* Brand Logo & Subtitle */}
        <div 
          className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer group"
          onClick={() => setCurrentView('explore')}
        >
          {/* Logo SVG from Design System */}
          <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="36" height="36">
              <defs>
                <linearGradient id="hdr_g1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#10B981"/>
                  <stop offset="100%" stop-color="#059669"/>
                </linearGradient>
              </defs>
              <rect width="100" height="100" rx="24" fill="url(#hdr_g1)"/>
              <path d="M30 62 C30 52, 40 46, 50 46 C60 46, 70 52, 70 62" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" fill="none"/>
              <circle cx="38" cy="65" r="5" fill="#FFFFFF"/>
              <circle cx="62" cy="65" r="5" fill="#FFFFFF"/>
              <path d="M42 46 L46 32 C47 28, 53 28, 54 32 L58 46" stroke="#FFFFFF" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
              <path d="M60 26 C68 22, 74 27, 72 35 C66 38, 60 33, 60 26 Z" fill="#A7F3D0"/>
              <path d="M60 26 C65 31, 68 33, 72 35" stroke="#047857" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-headline font-bold text-lg text-on-surface tracking-tight truncate leading-tight">
              CampusCommute
            </span>
            <span className="font-headline font-bold text-[11px] text-primary tracking-wide uppercase truncate">
              {isAdmin ? 'Admin Portal Suite' : (
                currentView === 'explore' ? 'Smart Campus Carpool' :
                currentView === 'find' ? 'Find A Ride' :
                currentView === 'post' ? 'Post A Ride' :
                currentView === 'my-rides' ? 'My Commutes' :
                currentView === 'chat' ? 'Ride Coordination' :
                currentView === 'impact' ? 'Campus Sustainability' :
                'Student Profile'
              )}
            </span>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          
          {/* Admin Switcher: Always accessible so evaluators & administrators can review users */}
          <button
            id="btn-toggle-admin-mode"
            onClick={() => {
              if (isUserAdmin) {
                const nextAdmin = !isAdmin;
                setIsAdmin(nextAdmin);
                setCurrentView(nextAdmin ? 'admin' : 'explore');
              } else {
                onOpenAdminGatekeeper();
              }
            }}
            className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-xl font-headline text-xs font-semibold border transition-all ${
              isAdmin
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200'
            }`}
            title="Open Campus Administration Suite to monitor and review users"
          >
            <span className="material-symbols-outlined text-base">
              {isAdmin ? 'admin_panel_settings' : 'shield_person'}
            </span>
            <span>{isAdmin ? 'Exit Admin' : 'Admin Suite'}</span>
          </button>

          {/* Post Ride Action Button (Shown when not in admin view) */}
          {!isAdmin && (
            <button
              id="btn-header-post-ride"
              onClick={() => setCurrentView('post')}
              className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-3 sm:px-3.5 bg-primary-container text-on-primary-container rounded-xl font-headline text-xs sm:text-sm font-semibold transition-colors hover:bg-primary hover:text-on-primary shadow-sm"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span className="hidden xs:inline">Post Ride</span>
            </button>
          )}

          {/* Notifications Bell */}
          <button
            id="btn-header-notifications"
            onClick={onToggleNotifications}
            className="relative p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors"
            title="Campus Announcements & Notifications"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-error text-white font-bold text-[10px] rounded-full ring-2 ring-surface animate-bounce">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Profile Chip & Auth Controls */}
          {user ? (
            <div className="flex items-center gap-1.5">
              {/* Live Eco-Credits Balance Chip */}
              <button
                id="btn-header-eco-credits"
                onClick={() => setCurrentView('impact')}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 rounded-2xl text-xs font-headline font-bold transition-all shadow-xs active:scale-95 group"
                title={`Your Campus Eco-Credits: ${user.ecoCredits ?? 120}. Click to open Sustainability & Wallet Hub.`}
              >
                <span className="text-sm group-hover:scale-110 transition-transform">🌱</span>
                <span>{user.ecoCredits ?? 120}</span>
                <span className="hidden md:inline text-[10px] text-emerald-700 font-semibold uppercase">Credits</span>
              </button>

              {isUserDemo && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-[10px] font-headline font-bold">
                  <span className="material-symbols-outlined text-[12px] text-amber-600">lock</span>
                  <span>Demo (Booking Restricted)</span>
                </span>
              )}
              <div 
                id="btn-user-chip"
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-2.5 py-1 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high transition-all cursor-pointer group"
                title={`${user.name} (${user.role?.toUpperCase()}) - Click to switch or manage account`}
              >
                <div className="relative flex items-center justify-center">
                  <img
                    alt="Profile"
                    className={`w-7 h-7 rounded-full object-cover ring-2 transition-all ${
                      isUserAdmin 
                        ? 'ring-amber-500' 
                        : isUserDemo 
                        ? 'ring-amber-400' 
                        : 'ring-primary/40 group-hover:ring-primary'
                    }`}
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                  />
                  <span 
                    className={`absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-3.5 h-3.5 rounded-full ring-1 ring-surface ${
                      isUserAdmin 
                        ? 'bg-amber-600 text-white' 
                        : isUserDemo 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-primary-container text-on-primary-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[9px] leading-none font-bold">
                      {isUserAdmin ? 'shield' : isUserDemo ? 'lock' : 'check'}
                    </span>
                  </span>
                </div>
                <div className="hidden sm:flex flex-col text-left leading-none">
                  <span className="font-headline font-bold text-xs text-on-surface truncate max-w-[110px]">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                id="btn-header-logout"
                onClick={onLogout}
                className="p-1.5 rounded-xl hover:bg-surface-container text-secondary hover:text-error transition-colors"
                title="Sign out of account"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
              </button>
            </div>
          ) : (
            <button
              id="btn-header-signin"
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-primary text-on-primary rounded-xl font-headline text-xs font-bold shadow-sm hover:bg-primary-fixed-dim transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-base">login</span>
              <span>Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
