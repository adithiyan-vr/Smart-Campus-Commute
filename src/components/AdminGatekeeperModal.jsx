import React, { useState, useEffect } from 'react';
import { database } from '../services/database';

export default function AdminGatekeeperModal({ isOpen, onClose, onAdminAuthenticated, onShowToast, currentUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const adminUser = await database.adminLogin({ email, password });
      onAdminAuthenticated(adminUser);
      onShowToast('Admin Authenticated', 'Administrative Suite unlocked.');
      onClose();
    } catch (err) {
      setError(err.message || 'Access Denied: Invalid administrator credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-surface-container-lowest border-2 border-amber-500 rounded-3xl shadow-2xl overflow-hidden text-on-surface">
        
        {/* Security Shield Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-base uppercase tracking-wider">
                Dedicated Administrator Gatekeeper
              </h3>
              <p className="text-xs text-amber-100">Authorized Personnel Only</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          
          {/* Current User Warning if logged in as normal student */}
          {currentUser && currentUser.role !== 'admin' && (
            <div className="bg-amber-100/70 border border-amber-300 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-amber-950">
              <span className="material-symbols-outlined text-amber-700 text-lg flex-shrink-0 mt-0.5">
                block
              </span>
              <div>
                <span className="font-headline font-bold block text-amber-900">Normal Account Blocked</span>
                <span>
                  Currently signed in as <strong>{currentUser.name}</strong> ({currentUser.role}). Normal student accounts cannot access administrative tools. You must authenticate with the campus administrator account.
                </span>
              </div>
            </div>
          )}

          <div className="bg-surface-container/70 border border-surface-container-high p-3 rounded-2xl flex items-start gap-2.5 text-xs text-on-surface">
            <span className="material-symbols-outlined text-amber-600 text-lg flex-shrink-0 mt-0.5">
              shield_lock
            </span>
            <div className="flex-1">
              <span className="font-headline font-bold block text-on-surface">Authorized Administrator Access</span>
              <span className="text-[11px] text-secondary block mt-0.5">
                Restricted to authorized campus transportation officers. Please enter your administrator email and security password to access control systems.
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake">
              <span className="material-symbols-outlined text-base text-error">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-3 text-xs">
            <div>
              <label className="font-headline font-bold text-secondary text-[10px] uppercase block mb-1">
                Admin Email or Username
              </label>
              <input
                id="input-gatekeeper-email"
                type="text"
                required
                placeholder="admin@university.edu or admin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-low p-2.5 rounded-xl border border-surface-container text-on-surface outline-none font-medium focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-headline font-bold text-secondary text-[10px] uppercase block mb-1">
                Admin Security Password
              </label>
              <div className="relative">
                <input
                  id="input-gatekeeper-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-low p-2.5 pr-10 rounded-xl border border-surface-container text-on-surface outline-none font-medium focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-secondary hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              id="btn-gatekeeper-login"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-headline font-bold text-xs rounded-xl shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-base">lock_open</span>
              <span>{isLoading ? 'Verifying Administrator Credentials...' : 'Authenticate & Unlock Admin Console'}</span>
            </button>
          </form>

        </div>

        <div className="p-3 bg-surface-container-low border-t border-surface-container text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-surface-container text-secondary hover:text-on-surface rounded-xl font-headline text-xs font-semibold transition-colors"
          >
            Cancel / Return to Student View
          </button>
        </div>

      </div>
    </div>
  );
}
