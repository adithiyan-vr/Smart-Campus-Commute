import React, { useState, useEffect } from 'react';
import { INITIAL_ADMIN_DATA } from '../data/campusState';
import { database } from '../services/database';

export default function AdminPortalView({ 
  users: propUsers, 
  onShowToast, 
  announcements, 
  onBroadcastAnnouncement 
}) {
  const [adminTab, setAdminTab] = useState('users'); // 'users' default for immediate review
  const [adminData, setAdminData] = useState(INITIAL_ADMIN_DATA);
  const [dbUsers, setDbUsers] = useState(() => propUsers || database.getUsers());
  const [userSearch, setUserSearch] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementTarget, setAnnouncementTarget] = useState('All Campus');

  // Real-time synchronization when users prop updates or database notifies
  useEffect(() => {
    if (propUsers) {
      setDbUsers(propUsers);
    }
  }, [propUsers]);

  const [liveAnnouncements, setLiveAnnouncements] = useState(() => announcements || database.getAnnouncements());
  const [latestLoginAlert, setLatestLoginAlert] = useState(null);

  useEffect(() => {
    if (announcements) {
      setLiveAnnouncements(announcements);
    }
  }, [announcements]);

  useEffect(() => {
    const unsubUsers = database.subscribe((updated) => {
      setDbUsers(updated);
    });
    const unsubAnn = database.subscribeAnnouncements((updatedAnn) => {
      setLiveAnnouncements(updatedAnn);
    });
    const handleLoginEvent = (e) => {
      const data = e.detail;
      setLatestLoginAlert(data);
      if (onShowToast) {
        onShowToast('Real-Time User Activity', `${data.name} (${data.role}) signed in at ${data.time}`);
      }
    };
    window.addEventListener('campuscommute:user_login', handleLoginEvent);

    return () => {
      unsubUsers();
      unsubAnn();
      window.removeEventListener('campuscommute:user_login', handleLoginEvent);
    };
  }, [onShowToast]);

  const activeAnnouncements = liveAnnouncements;

  // Approve / Reject verification
  const handleVerifyAction = (id, approved) => {
    setAdminData(prev => ({
      ...prev,
      verifications: prev.verifications.filter(v => v.id !== id),
      metrics: {
        ...prev.metrics,
        pendingVerifications: Math.max(0, prev.metrics.pendingVerifications - 1)
      }
    }));
    onShowToast('Verification Updated', approved ? 'Student ID approved and green verified badge activated.' : 'Verification rejected and reason logged.');
  };

  // Suspend/Ban User in Persistent Database
  const handleToggleUserStatus = async (userId) => {
    const targetUser = dbUsers.find(u => u.id === userId);
    if (!targetUser) return;
    const newStatus = targetUser.status === 'Active' ? 'Suspended' : 'Active';
    const updatedList = await database.updateUserStatus(userId, newStatus);
    setDbUsers(updatedList);
    onShowToast('User Status Updated', `${targetUser.name} marked as ${newStatus}. Central DB updated.`);
  };

  // Resolve report
  const handleResolveReport = (reportId) => {
    setAdminData(prev => ({
      ...prev,
      reports: prev.reports.map(r => r.id === reportId ? { ...r, status: 'RESOLVED' } : r),
      metrics: {
        ...prev.metrics,
        openReports: Math.max(0, prev.metrics.openReports - 1)
      }
    }));
    onShowToast('Dispute Resolved', 'Case marked as resolved and notes archived.');
  };

  // Broadcast announcement
  const handleBroadcastAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementTitle.trim()) return;

    const newAnn = {
      id: `ann_${Date.now()}`,
      title: announcementTitle.trim(),
      date: 'Just Now',
      target: announcementTarget
    };

    if (onBroadcastAnnouncement) {
      onBroadcastAnnouncement(newAnn);
    } else {
      setAdminData(prev => ({
        ...prev,
        announcements: [newAnn, ...prev.announcements]
      }));
    }

    setAnnouncementTitle('');
    onShowToast('Announcement Broadcasted', `Notification dispatched to ${announcementTarget}!`);
  };

  return (
    <div className="px-4 py-3 flex flex-col gap-4 pb-24 max-w-4xl mx-auto">
      
      {/* Admin Suite Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-container-high pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-800 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-xl text-on-surface">Campus Administration Suite</h2>
            <p className="font-body text-xs text-secondary">
              Platform governance, student ID approvals, safety enforcement, and ride oversight.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-[10px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Sync Active</span>
          </div>
          <button
            onClick={async () => {
              await database.syncFromCentralServer?.();
              setDbUsers([...database.getUsers()]);
              onShowToast('Database Synced', 'Live user directory refreshed from Central Server.');
            }}
            className="px-2.5 py-1 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container text-secondary hover:text-on-surface text-xs font-bold transition-all flex items-center gap-1"
            title="Refresh from Central Server"
          >
            <span className="material-symbols-outlined text-sm">sync</span>
            <span>Refresh</span>
          </button>
          <span className="font-headline font-bold text-xs bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full uppercase tracking-wider">
            Super Admin
          </span>
        </div>
      </div>

      {/* Live Real-Time Login Alert Banner */}
      {latestLoginAlert && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-950 animate-fadeIn shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping flex-shrink-0"></span>
            <span className="font-headline font-bold text-emerald-800 flex-shrink-0">⚡ Live User Login:</span>
            <span className="truncate">
              <strong>{latestLoginAlert.name}</strong> ({latestLoginAlert.role}) logged in at <span className="font-mono">{latestLoginAlert.time}</span> from a campus device.
            </span>
          </div>
          <button 
            onClick={() => setLatestLoginAlert(null)}
            className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-800 transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Admin Segmented Subtabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'dashboard', label: 'Overview', icon: 'dashboard' },
          { id: 'users', label: `User Directory (${dbUsers.length})`, icon: 'group' },
          { id: 'verifications', label: `Verifications (${adminData.verifications.length})`, icon: 'badge' },
          { id: 'reports', label: `Disputes (${adminData.reports.filter(r => r.status !== 'RESOLVED').length})`, icon: 'report_problem' },
          { id: 'announcements', label: 'Announcements', icon: 'campaign' }
        ].map(tab => (
          <button
            key={tab.id}
            id={`admin-tab-${tab.id}`}
            onClick={() => setAdminTab(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-headline text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              adminTab === tab.id
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-low text-secondary hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: DASHBOARD METRICS (PRD 6.1) */}
      {adminTab === 'dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-sm">
              <span className="text-secondary text-[11px] font-headline font-bold uppercase">Total Registered</span>
              <div className="font-headline font-black text-2xl text-on-surface mt-1">{dbUsers.length}</div>
              <span className="text-[11px] text-primary font-semibold">Real-time database sync</span>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-sm">
              <span className="text-secondary text-[11px] font-headline font-bold uppercase">Active Rides Now</span>
              <div className="font-headline font-black text-2xl text-primary mt-1">{adminData.metrics.activeRides}</div>
              <span className="text-[11px] text-primary font-semibold">Live on campus corridors</span>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-sm">
              <span className="text-secondary text-[11px] font-headline font-bold uppercase">Completed Today</span>
              <div className="font-headline font-black text-2xl text-on-surface mt-1">{adminData.metrics.ridesCompletedToday}</div>
              <span className="text-[11px] text-secondary font-medium">98.4% safe finish</span>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-sm">
              <span className="text-secondary text-[11px] font-headline font-bold uppercase">Pending Verifications</span>
              <div className="font-headline font-black text-2xl text-amber-600 mt-1">{adminData.verifications.length}</div>
              <span className="text-[11px] text-amber-700 font-semibold">Requires ID check</span>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-sm">
              <span className="text-secondary text-[11px] font-headline font-bold uppercase">Open Reports</span>
              <div className="font-headline font-black text-2xl text-error mt-1">
                {adminData.reports.filter(r => r.status !== 'RESOLVED').length}
              </div>
              <span className="text-[11px] text-error font-semibold">Pending resolution</span>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-sm">
              <span className="text-secondary text-[11px] font-headline font-bold uppercase">CO2 Prevented</span>
              <div className="font-headline font-black text-2xl text-primary mt-1">{adminData.metrics.totalCo2SavedKg} kg</div>
              <span className="text-[11px] text-primary font-semibold">Campus green target 84%</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER DIRECTORY (PRD 6.2) */}
      {adminTab === 'users' && (
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-headline font-bold text-sm text-on-surface">Registered Students & Drivers</h3>
            <input
              id="admin-search-users"
              type="text"
              placeholder="Search user name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="bg-surface-container-low px-3 py-1.5 rounded-xl text-xs outline-none border border-surface-container text-on-surface w-48 sm:w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-secondary font-headline uppercase text-[10px]">
                <tr>
                  <th className="p-2.5 rounded-l-xl">User</th>
                  <th className="p-2.5">Email</th>
                  <th className="p-2.5">Role</th>
                  <th className="p-2.5">Eco-Credits</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Last Login / Active</th>
                  <th className="p-2.5 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high">
                {(() => {
                  const filtered = dbUsers.filter(u => 
                    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                    u.email.toLowerCase().includes(userSearch.toLowerCase())
                  );
                  if (filtered.length === 0) {
                    return (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-secondary">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-3xl text-secondary/60">group_off</span>
                            <p className="font-headline font-bold text-sm text-on-surface">No registered accounts found</p>
                            <p className="text-xs text-secondary max-w-sm">
                              {userSearch 
                                ? `No users match "${userSearch}".` 
                                : "No student accounts have registered yet. Newly registered users will appear here automatically in real-time."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  return filtered.map(u => (
                    <tr key={u.id} className="hover:bg-surface-container-low/50">
                      <td className="p-2.5 font-bold text-on-surface flex items-center gap-2">
                        <img src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} alt="" className="w-6 h-6 rounded-full object-cover" />
                        <span>{u.name}</span>
                      </td>
                      <td className="p-2.5 text-secondary font-mono text-[11px]">{u.email}</td>
                      <td className="p-2.5 font-semibold text-primary">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold ${
                          u.role === 'admin' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-primary/10 text-primary'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-emerald-700 font-mono text-xs">
                        🌱 {u.ecoCredits ?? 120}
                      </td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'Active' ? 'bg-primary-container/20 text-on-primary-container' : 'bg-error-container text-on-error-container'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${u.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-secondary/40'}`}></span>
                          <span className="text-[11px] font-mono text-secondary">{u.lastLoginAt || 'Never'}</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-right">
                        {u.role === 'admin' ? (
                          <span className="text-[11px] text-secondary font-bold italic">Protected</span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleUserStatus(u.id)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                                u.status === 'Active'
                                  ? 'bg-amber-500/15 text-amber-900 hover:bg-amber-500/25'
                                  : 'bg-primary text-on-primary hover:bg-primary/90'
                              }`}
                            >
                              {u.status === 'Active' ? 'Suspend' : 'Reactivate'}
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to permanently remove user "${u.name}"?`)) {
                                  await database.deleteUser(u.id);
                                  onShowToast(`Account for ${u.name} removed.`, 'Removed');
                                }
                              }}
                              className="p-1 rounded-lg text-secondary hover:text-error hover:bg-error-container/20 transition-colors"
                              title="Delete account"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: VERIFICATION QUEUE (PRD 6.3) */}
      {adminTab === 'verifications' && (
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-sm space-y-3">
          <h3 className="font-headline font-bold text-sm text-on-surface">Pending Student ID & Vehicle Uploads</h3>

          {adminData.verifications.length === 0 ? (
            <p className="text-xs text-secondary p-4 text-center">No pending verifications in queue!</p>
          ) : (
            <div className="space-y-2.5">
              {adminData.verifications.map(v => (
                <div key={v.id} className="p-3 bg-surface-container-low rounded-xl border border-surface-container flex items-center justify-between text-xs gap-3">
                  <div>
                    <div className="font-headline font-bold text-sm text-on-surface">{v.studentName}</div>
                    <div className="text-[11px] text-secondary font-mono">{v.email}</div>
                    <div className="text-[11px] text-primary font-semibold mt-0.5">Document: {v.docType} ({v.date})</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerifyAction(v.id, true)}
                      className="px-3 py-1.5 bg-primary text-on-primary rounded-lg font-headline font-bold text-xs shadow-sm hover:bg-primary-fixed-dim transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerifyAction(v.id, false)}
                      className="px-3 py-1.5 bg-error text-on-error rounded-lg font-headline font-bold text-xs shadow-sm hover:opacity-90 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DISPUTES & REPORTS (PRD 6.5) */}
      {adminTab === 'reports' && (
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-sm space-y-3">
          <h3 className="font-headline font-bold text-sm text-on-surface">Campus Reports & Safety Escalations</h3>

          <div className="space-y-2.5">
            {adminData.reports.map(rep => (
              <div key={rep.id} className="p-3.5 bg-surface-container-low rounded-xl border border-surface-container space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-headline font-bold text-sm text-on-surface">{rep.subject}</div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    rep.status === 'RESOLVED' ? 'bg-surface-container text-secondary' : 'bg-error-container text-on-error-container'
                  }`}>
                    {rep.status}
                  </span>
                </div>
                
                <div className="text-secondary text-[11px]">
                  Reported by <strong className="text-on-surface">{rep.reportedBy}</strong> · Ride ID: {rep.rideId} · Severity: {rep.severity}
                </div>

                {rep.status !== 'RESOLVED' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleResolveReport(rep.id)}
                      className="px-3 py-1 bg-primary text-on-primary rounded-lg font-headline font-bold text-xs shadow-sm"
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: BROADCAST ANNOUNCEMENTS (PRD 6.7) */}
      {adminTab === 'announcements' && (
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-sm space-y-4">
          <h3 className="font-headline font-bold text-sm text-on-surface">Broadcast Campus-Wide Notification</h3>

          <form onSubmit={handleBroadcastAnnouncement} className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-headline font-bold text-secondary uppercase block mb-1">
                Announcement Message / Title
              </label>
              <input
                id="input-announcement-title"
                type="text"
                placeholder="e.g. Inclement Weather: Carpool Speed Limit Enforced"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                className="w-full bg-surface-container-low p-2.5 rounded-xl border border-surface-container text-on-surface outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-headline font-bold text-secondary uppercase block mb-1">
                Target Audience
              </label>
              <select
                value={announcementTarget}
                onChange={(e) => setAnnouncementTarget(e.target.value)}
                className="w-full bg-surface-container-low p-2.5 rounded-xl border border-surface-container text-on-surface outline-none font-semibold"
              >
                <option value="All Campus">All Campus (Drivers & Passengers)</option>
                <option value="Drivers">Registered Drivers Only</option>
                <option value="Passengers">Passengers Only</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 bg-primary text-on-primary font-headline font-bold text-xs rounded-xl shadow hover:bg-primary-fixed-dim transition-colors"
            >
              Send Campus Notification
            </button>
          </form>

          {/* Past Announcements */}
          <div className="pt-3 border-t border-surface-container space-y-2">
            <span className="text-[10px] font-headline font-bold text-secondary uppercase block">
              Recent Sent Broadcasts
            </span>
            {activeAnnouncements.map(ann => (
              <div key={ann.id} className="p-2.5 bg-surface-container-low rounded-xl border border-surface-container text-xs flex justify-between items-center">
                <span className="font-semibold text-on-surface">{ann.title}</span>
                <span className="text-[10px] text-secondary font-mono">{ann.date} ({ann.target})</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
