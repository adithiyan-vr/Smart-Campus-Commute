import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ActiveRideSosModal from './components/ActiveRideSosModal';
import NotificationModal from './components/NotificationModal';
import AuthModal from './components/AuthModal';
import AdminGatekeeperModal from './components/AdminGatekeeperModal';
import DemoBookingRestrictedModal from './components/DemoBookingRestrictedModal';
import LandingExploreView from './views/LandingExploreView';
import FindRideView from './views/FindRideView';
import PostRideView from './views/PostRideView';
import MyRidesView from './views/MyRidesView';
import ChatView from './views/ChatView';
import ProfileVerifyView from './views/ProfileVerifyView';
import EcoImpactView from './views/EcoImpactView';
import AdminPortalView from './views/AdminPortalView';
import { 
  INITIAL_RIDES, 
  INITIAL_USER_RIDES, 
  INITIAL_WAITING_MEMBERS,
  INITIAL_ADMIN_DATA 
} from './data/campusState';
import { database } from './services/database';

export default function App() {
  const [currentView, setCurrentView] = useState('explore'); // 'explore' | 'find' | 'post' | 'my-rides' | 'chat' | 'profile' | 'impact' | 'admin'
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Persistent Database Authenticated User Session & Real-time User List
  const [currentUser, setCurrentUser] = useState(() => database.getActiveSession());
  const [usersList, setUsersList] = useState(() => database.getUsers());

  // Real-time synchronization of users, announcements, and rides across all devices
  useEffect(() => {
    const unsubscribeUsers = database.subscribe((updatedUsers) => {
      setUsersList(updatedUsers);
    });
    const unsubscribeAnnouncements = database.subscribeAnnouncements((updatedAnnouncements) => {
      setAnnouncements(updatedAnnouncements);
    });
    const unsubscribeRides = database.subscribeRides(({ rides: updatedRides, waitingMembers: updatedWaiting }) => {
      if (updatedRides && updatedRides.length > 0) {
        setRides(updatedRides);
      }
      if (updatedWaiting && updatedWaiting.length > 0) {
        setWaitingMembers(updatedWaiting);
      }
    });

    const handleUserLogin = (e) => {
      const data = e.detail;
      if (currentUser?.role === 'admin') {
        showToast(`Live Activity: ${data.name} (${data.role}) signed in at ${data.time}`, 'Live User Login');
      }
    };

    const handleUserRegistered = (e) => {
      const data = e.detail;
      if (currentUser?.role === 'admin') {
        showToast(`New Member: ${data.name} (${data.role}) registered!`, 'New Registration');
      }
    };

    const handleNewAnnouncement = (e) => {
      const ann = e.detail;
      showToast(`📢 Announcement: ${ann.title}`, 'Campus Notice');
      setUnreadNotificationsCount(prev => prev + 1);
    };

    const handleNewRide = (e) => {
      const ride = e.detail;
      showToast(`🚗 New Ride: ${ride.pickup} ➔ ${ride.destination} (${ride.departureTime})`, 'Live Ride Available');
    };

    const handleSessionExpired = (e) => {
      setCurrentUser(null);
      setIsAdmin(false);
      showToast('Session expired or account updated. Please sign in again.', 'Notice');
    };

    window.addEventListener('campuscommute:user_login', handleUserLogin);
    window.addEventListener('campuscommute:user_registered', handleUserRegistered);
    window.addEventListener('campuscommute:new_announcement', handleNewAnnouncement);
    window.addEventListener('campuscommute:new_ride', handleNewRide);
    window.addEventListener('campuscommute:session_expired', handleSessionExpired);

    return () => {
      unsubscribeUsers();
      unsubscribeAnnouncements();
      unsubscribeRides();
      window.removeEventListener('campuscommute:user_login', handleUserLogin);
      window.removeEventListener('campuscommute:user_registered', handleUserRegistered);
      window.removeEventListener('campuscommute:new_announcement', handleNewAnnouncement);
      window.removeEventListener('campuscommute:new_ride', handleNewRide);
      window.removeEventListener('campuscommute:session_expired', handleSessionExpired);
    };
  }, [currentUser?.role]);

  const [rides, setRides] = useState(() => database.getRides().length > 0 ? database.getRides() : INITIAL_RIDES);
  const [userRides, setUserRides] = useState(INITIAL_USER_RIDES);
  const [waitingMembers, setWaitingMembers] = useState(() => database.getWaitingMembers().length > 0 ? database.getWaitingMembers() : INITIAL_WAITING_MEMBERS);

  // Announcements & Notifications (Admin -> User broadcast, persistent & real-time)
  const [announcements, setAnnouncements] = useState(() => database.getAnnouncements());
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(() => Math.min(2, database.getAnnouncements().length));
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Authentication & Gatekeeper Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminGatekeeperOpen, setIsAdminGatekeeperOpen] = useState(false);
  const [isDemoBookingRestrictedOpen, setIsDemoBookingRestrictedOpen] = useState(false);
  const [targetDemoRide, setTargetDemoRide] = useState(null);
  const [authModalMode, setAuthModalMode] = useState('login');

  // Modals & Chat state
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [activeSosRide, setActiveSosRide] = useState(null);
  const [activeChatRide, setActiveChatRide] = useState(null);

  // Search & Filter parameters forwarded across views
  const [searchCriteria, setSearchCriteria] = useState({
    pickup: 'Westwood Commons',
    destination: 'Gate 2 - STEM Quad',
    verifiedOnly: false,
    femaleOnly: false
  });

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: 'Seat booked successfully!',
    badge: 'Confirmed'
  });

  const showToast = (message, badge = 'Confirmed') => {
    setToast({ show: true, message, badge });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  // Safe Navigation Handler enforcing strict Role-Based Access Control and authentication
  const handleNavigateView = (viewName) => {
    if (viewName === 'admin') {
      if (!currentUser || currentUser.role !== 'admin') {
        showToast('Restricted: Admin access available only to verified administrators.', 'Denied');
        setIsAdminGatekeeperOpen(true);
        return;
      }
      setIsAdmin(true);
      setCurrentView('admin');
    } else if (viewName === 'profile') {
      if (!currentUser) {
        showToast('Profile Access Restricted: Sign in with your university credentials to view your profile.', 'Sign In Required');
        setIsAuthOpen(true);
        return;
      }
      setIsAdmin(false);
      setCurrentView('profile');
    } else if (viewName === 'post') {
      if (!currentUser) {
        showToast('Sign in required to post and offer a carpool ride.', 'Sign In Required');
        setIsAuthOpen(true);
        return;
      }
      setIsAdmin(false);
      setCurrentView('post');
    } else {
      setIsAdmin(false);
      setCurrentView(viewName);
    }
  };

  // When Admin is authenticated via Gatekeeper
  const handleAdminAuthenticated = (adminUser) => {
    setCurrentUser(adminUser);
    setIsAdmin(true);
    setCurrentView('admin');
  };

  // When student or admin signs in or registers via AuthModal
  const handleUserAuthenticated = (user) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setIsAdmin(true);
      setCurrentView('admin');
    } else {
      setIsAdmin(false);
      setCurrentView('explore');
    }
  };

  const handleLogout = () => {
    database.logout();
    setCurrentUser(null);
    setIsAdmin(false);
    setCurrentView('explore');
    showToast('Signed out successfully. Now in guest mode.', 'Logged Out');
  };

  const isDemoUser = Boolean(currentUser && currentUser.isDemo);

  // Booking Flow from Landing / Find Ride
  const handleBookSeat = async (ride) => {
    if (!currentUser) {
      showToast('Please sign in with your university credentials to reserve a seat.', 'Sign In Required');
      setAuthModalMode('login');
      setIsAuthOpen(true);
      return;
    }

    // Strict security restriction: Student Demo accounts cannot book seats
    if (isDemoUser) {
      setTargetDemoRide(ride);
      setIsDemoBookingRestrictedOpen(true);
      showToast('Booking Restricted: Student Demo accounts cannot reserve seats. Please register to book.', 'Demo Restricted');
      return;
    }

    try {
      await database.bookSeat(ride.id);
    } catch {
      setRides(prev => prev.map(r => {
        if (r.id === ride.id) {
          return { ...r, availableSeats: Math.max(0, r.availableSeats - 1) };
        }
        return r;
      }));
    }

    const newBooking = {
      id: `my_ride_${Date.now()}`,
      rideId: ride.id,
      driverName: ride.driver.name,
      driverAvatar: ride.driver.avatar,
      role: 'passenger',
      route: `${ride.pickup} ➔ ${ride.destination}`,
      time: `Today, ${ride.departureTime}`,
      price: `₹${Math.round(ride.pricePerSeat)}`,
      status: 'CONFIRMED',
      seatsBooked: 1,
      carbonSavedKg: ride.carbonOffsetKg,
      vehicle: `${ride.vehicleType} (${ride.vehiclePlate})`
    };

    setUserRides(prev => [newBooking, ...prev]);
    showToast(`Reserved 1 seat with ${ride.driver.name} for ₹${Math.round(ride.pricePerSeat)}!`, 'Booked');
  };

  // Inspect route on map
  const handleInspectRoute = (route, driver, time) => {
    showToast(`Route mapped: ${route} (${time})`, 'Route');
    setCurrentView('find');
  };

  // Publish new ride from PostRideView
  const handlePublishRide = async (newRide) => {
    try {
      await database.publishRide(newRide);
    } catch {
      setRides(prev => [newRide, ...prev]);
    }
    
    const driverBooking = {
      id: `my_driver_${Date.now()}`,
      rideId: newRide.id,
      driverName: `${currentUser.name} (You)`,
      driverAvatar: currentUser.avatar,
      role: 'driver',
      route: `${newRide.pickup} ➔ ${newRide.destination}`,
      time: `Today, ${newRide.departureTime}`,
      price: `₹${Math.round(newRide.pricePerSeat)}`,
      status: 'CONFIRMED',
      seatsBooked: 0,
      carbonSavedKg: newRide.carbonOffsetKg,
      vehicle: newRide.vehicleType
    };
    setUserRides(prev => [driverBooking, ...prev]);

    showToast(`Published ride to ${newRide.destination}! Student riders notified.`, 'Published');
    setCurrentView('my-rides');
  };

  // Driver accepts a waiting member to pick up
  const handlePickUpMember = async (member) => {
    try {
      await database.acceptWaitingMember(member.id);
    } catch {
      setWaitingMembers(prev => prev.filter(m => m.id !== member.id));
    }

    // Add confirmed ride to userRides for driver
    const driverPickupBooking = {
      id: `pickup_${Date.now()}`,
      rideId: member.id,
      driverName: `${currentUser?.name || 'You'} (Driver)`,
      driverAvatar: currentUser?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZ3Qu0Pqg2WAXjMZ9cZmvAd0JvDZE-oZUtO0m6t2-ykRGJj_ibeNNwNGodoPRkuT3rB7egsgoeb3DMe0r9wEjKeeOo-0Uy_o05ihBivJjms6ZHOoJ13-m1pju_aiHKPIuqaPbTV7fo4PjAPT50gPPAZ2Vhq6YZINaBuw4bQf8s3w3DVbI3uEbvAVBq_scaXnyaB5KK_koqmU3IZ9u2NVZCwNRUAqFG-ZdwsZwW0xXwn_zXwM4GhCxWxg',
      role: 'driver',
      passengerName: member.passenger.name,
      passengerAvatar: member.passenger.avatar,
      route: `${member.pickup} ➔ ${member.destination}`,
      time: `Today, ${member.desiredTime}`,
      price: `₹${Math.round(member.offeredContribution)}`,
      status: 'CONFIRMED',
      seatsBooked: member.seatsNeeded,
      carbonSavedKg: parseFloat((parseFloat(member.distanceMiles) * 0.404 * 0.85).toFixed(1)),
      vehicle: currentUser?.vehicle?.make ? `${currentUser.vehicle.make} ${currentUser.vehicle.model}` : 'Prius Prime Hybrid'
    };

    setUserRides(prev => [driverPickupBooking, ...prev]);
    showToast(`Picked up ${member.passenger.name}! Reservation confirmed for ${member.desiredTime}.`, 'Rider Confirmed');
    setCurrentView('my-rides');
  };

  // Handle ride status updates (Start Ride, Complete Ride)
  const handleUpdateRideStatus = (rideId, newStatus) => {
    setUserRides(userRides.map(r => r.id === rideId ? { ...r, status: newStatus } : r));
    showToast(`Ride status updated to ${newStatus.replace('_', ' ')}`, 'Status');
  };

  // Cancel ride
  const handleCancelRide = (rideId) => {
    setUserRides(userRides.filter(r => r.id !== rideId));
    showToast('Ride reservation cancelled.', 'Cancelled');
  };

  // Trigger SOS modal
  const handleTriggerSos = (ride) => {
    setActiveSosRide(ride);
    setIsSosOpen(true);
  };

  // Open Chat
  const handleOpenChat = (ride) => {
    setActiveChatRide(ride);
    setCurrentView('chat');
  };

  // Broadcast announcement from Admin to Users (Persistent via database)
  const handleBroadcastAnnouncement = (newAnnouncement) => {
    database.broadcastAnnouncement(newAnnouncement);
    setUnreadNotificationsCount(prev => prev + 1);
    setIsBannerDismissed(false);
    showToast('Campus Announcement Broadcasted', `Dispatched to ${newAnnouncement.target}`);
  };

  const latestAnnouncement = announcements.length > 0 ? announcements[0] : null;

  return (
    <div className="bg-surface text-on-surface font-sans min-h-screen flex flex-col">
      
      {/* 1. Top Header with RBAC Admin and User Profiles */}
      <Header
        currentView={currentView}
        setCurrentView={handleNavigateView}
        user={currentUser}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        onOpenAuth={() => setIsAuthOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        onToggleNotifications={() => {
          setIsNotificationOpen(true);
          setUnreadNotificationsCount(0);
        }}
        onOpenAdminGatekeeper={() => setIsAdminGatekeeperOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. Interactive Toast Notification */}
      <div
        id="bookingToast"
        className={`fixed top-20 left-4 right-4 max-w-md mx-auto z-50 transform transition-all duration-500 pointer-events-none flex items-center justify-between p-3.5 rounded-xl bg-inverse-surface text-inverse-on-surface shadow-2xl ${
          toast.show ? 'translate-y-0 opacity-100' : '-translate-y-28 opacity-0'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="material-symbols-outlined text-primary-fixed text-xl flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <p className="font-body-md text-sm font-medium truncate" id="toastMessage">
            {toast.message}
          </p>
        </div>
        <span className="font-label-sm text-xs text-primary-fixed font-bold uppercase tracking-wider pl-2 flex-shrink-0">
          {toast.badge}
        </span>
      </div>

      {/* 3. Main View Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto pt-16 pb-20 bg-surface">
        
        {/* Live Admin Announcement Broadcast Alert Banner (Shown to Users) */}
        {!isAdmin && latestAnnouncement && !isBannerDismissed && (
          <div className="mx-4 mt-2.5 p-3 bg-primary-container/20 border border-primary-container text-on-surface rounded-2xl flex items-center justify-between gap-3 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-primary text-xl flex-shrink-0 animate-bounce">
                campaign
              </span>
              <div className="min-w-0 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-headline font-bold text-[10px] uppercase bg-primary text-on-primary px-1.5 py-0.2 rounded">
                    Admin Announcement
                  </span>
                  <span className="font-bold text-on-surface truncate">{latestAnnouncement.title}</span>
                </div>
                <span className="text-[10px] text-secondary font-mono">
                  {latestAnnouncement.date} · Target: {latestAnnouncement.target}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsBannerDismissed(true)}
              className="p-1 hover:bg-surface-container rounded-lg text-secondary hover:text-on-surface transition-colors flex-shrink-0"
              title="Dismiss banner"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}

        {/* Role Protected Admin Suite */}
        {(isAdmin || currentView === 'admin') && currentUser?.role === 'admin' ? (
          <AdminPortalView
            users={usersList}
            onShowToast={(msg, badge) => showToast(msg, badge)}
            announcements={announcements}
            onBroadcastAnnouncement={handleBroadcastAnnouncement}
          />
        ) : (
          <>
            {currentView === 'explore' && (
              <LandingExploreView
                rides={rides}
                waitingMembers={waitingMembers}
                announcements={announcements}
                onOpenNotifications={() => {
                  setIsNotificationOpen(true);
                  setUnreadNotificationsCount(0);
                }}
                onBookSeat={handleBookSeat}
                onPickUpMember={handlePickUpMember}
                onInspectRoute={handleInspectRoute}
                currentUser={currentUser}
                onSearch={(criteria) => {
                  setSearchCriteria(criteria);
                  setCurrentView('find');
                }}
                isDemoUser={isDemoUser}
              />
            )}

            {currentView === 'find' && (
              <FindRideView
                rides={rides}
                waitingMembers={waitingMembers}
                onBookSeat={handleBookSeat}
                onPickUpMember={handlePickUpMember}
                currentUser={currentUser}
                isDemoUser={isDemoUser}
                initialFilters={searchCriteria}
              />
            )}

            {currentView === 'post' && (
              <PostRideView
                user={currentUser}
                onPublishRide={handlePublishRide}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            )}

            {currentView === 'my-rides' && (
              <MyRidesView
                userRides={userRides}
                onOpenChat={handleOpenChat}
                onTriggerSos={handleTriggerSos}
                onUpdateRideStatus={handleUpdateRideStatus}
                onCancelRide={handleCancelRide}
              />
            )}

            {currentView === 'chat' && (
              <ChatView
                activeRide={activeChatRide}
                currentUser={currentUser}
                onBack={() => setCurrentView('my-rides')}
              />
            )}

            {currentView === 'profile' && (
              <ProfileVerifyView
                user={currentUser}
                onUpdateUser={(updated) => {
                  setCurrentUser(updated);
                  database.updateUser(updated);
                }}
                onOpenAuth={() => setIsAuthOpen(true)}
                onShowToast={(msg, badge) => showToast(msg, badge)}
              />
            )}

            {currentView === 'impact' && (
              <EcoImpactView
                user={currentUser}
              />
            )}
          </>
        )}
      </main>

      {/* 4. Fixed Bottom Navigation Bar (Admin tab dynamically hidden for regular students) */}
      <BottomNav
        currentView={currentView}
        setCurrentView={handleNavigateView}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        unreadCount={unreadNotificationsCount}
        user={currentUser}
      />

      {/* 5. Modals */}
      <ActiveRideSosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        activeRide={activeSosRide}
      />

      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        announcements={announcements}
        onClearAll={() => database.clearAnnouncements()}
      />

      {/* User Registration & Sign In Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserAuthenticated={handleUserAuthenticated}
        onOpenAdminGatekeeper={() => setIsAdminGatekeeperOpen(true)}
        onShowToast={(msg, badge) => showToast(msg, badge)}
        initialMode={authModalMode}
      />

      {/* Strict Security Admin Gatekeeper Modal */}
      <AdminGatekeeperModal
        isOpen={isAdminGatekeeperOpen}
        onClose={() => setIsAdminGatekeeperOpen(false)}
        onAdminAuthenticated={handleAdminAuthenticated}
        onShowToast={(msg, badge) => showToast(msg, badge)}
        currentUser={currentUser}
      />

      {/* Student Demo Booking Restriction Security Modal */}
      <DemoBookingRestrictedModal
        isOpen={isDemoBookingRestrictedOpen}
        onClose={() => setIsDemoBookingRestrictedOpen(false)}
        onOpenRegister={() => {
          setIsDemoBookingRestrictedOpen(false);
          setAuthModalMode('register');
          setIsAuthOpen(true);
        }}
        ride={targetDemoRide}
      />

    </div>
  );
}
