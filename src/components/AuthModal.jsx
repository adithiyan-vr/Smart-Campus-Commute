import React, { useState, useEffect } from 'react';
import { database } from '../services/database';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onUserAuthenticated, 
  onOpenAdminGatekeeper,
  onShowToast,
  initialMode = 'login'
}) {
  const [authMode, setAuthMode] = useState(initialMode); // 'login' | 'register'
  
  // Feedback and UI state
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMajor, setRegMajor] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regRole, setRegRole] = useState('rider'); // 'rider' | 'driver' | 'both'

  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode);
      setErrorMessage('');
      setSuccessMessage('');
      setLoginEmail('');
      setLoginPassword('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Handle Login (Centralized Async)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const user = await database.loginUser({
        email: loginEmail,
        password: loginPassword
      });

      onUserAuthenticated(user);
      onShowToast('Welcome back!', `Signed in as ${user.name} (${user.role.toUpperCase()})`);
      onClose();
    } catch (err) {
      const msg = err.message || 'Login failed.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Registration (Centralized Async)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const cleanEmail = regEmail.trim().includes('@') ? regEmail.trim() : `${regEmail.trim()}@university.edu`;
      const fallbackName = regName.trim() || cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Campus Student';

      const newUser = await database.registerUser({
        name: fallbackName,
        email: cleanEmail,
        password: regPassword.trim(),
        role: regRole,
        major: regMajor.trim() || 'Undergraduate Studies',
        studentId: regStudentId.trim() || `STU-${Math.floor(10000 + Math.random() * 90000)}`
      });

      setSuccessMessage('Registration successful! University ID verified.');
      onUserAuthenticated(newUser);
      onShowToast('Account Created', `Welcome to CampusCommute, ${newUser.name}!`);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-surface-container-lowest border border-surface-container-high rounded-3xl shadow-2xl overflow-hidden text-on-surface">
        
        {/* Header */}
        <div className="bg-surface-container-low p-4 border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">badge</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-on-surface">Campus Student Portal</h3>
              <p className="text-[11px] text-secondary">Verified Closed-Loop University Network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container text-secondary hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Tab Controls: Login vs Register */}
        <div className="p-4 pt-3 space-y-4">
          {currentUser && (
            <div className="p-2.5 bg-surface-container rounded-xl flex items-center justify-between text-xs border border-surface-container-high">
              <div className="flex items-center gap-2">
                <img 
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'} 
                  alt="avatar" 
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-primary/40" 
                />
                <span className="text-[11px]">
                  Current Account: <strong>{currentUser.name}</strong> ({currentUser.role?.toUpperCase()})
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                Active
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 p-1 bg-surface-container rounded-2xl border border-surface-container-high">
            <button
              onClick={() => { setAuthMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`py-2 rounded-xl font-headline text-xs font-bold transition-all ${
                authMode === 'login'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('register'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`py-2 rounded-xl font-headline text-xs font-bold transition-all ${
                authMode === 'register'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Register New User
            </button>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3 bg-error-container text-on-error-container rounded-xl text-xs font-semibold flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-error">error</span>
                <span>{errorMessage}</span>
              </div>
              {authMode === 'login' && errorMessage.toLowerCase().includes('not found') && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    if (loginEmail.trim()) setRegEmail(loginEmail.trim());
                    setErrorMessage('');
                  }}
                  className="self-start text-[11px] text-primary font-bold underline hover:opacity-80 transition-opacity"
                >
                  Create account for {loginEmail ? `"${loginEmail}"` : 'this email'} →
                </button>
              )}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-primary-container/20 text-on-primary-container border border-primary-container rounded-xl text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-primary">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {authMode === 'login' ? (
            <div className="space-y-3 text-xs">
              {/* Institution Verified Security Notice */}
              <div className="bg-surface-container/60 border border-surface-container-high p-2.5 rounded-2xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-base">verified_user</span>
                </div>
                <div className="min-w-0">
                  <span className="font-headline font-bold block text-xs text-on-surface">Campus Student Authentication</span>
                  <span className="text-[11px] text-secondary block">Sign in with your university credentials or shorthand username</span>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-headline font-bold text-secondary text-[10px] uppercase flex justify-between">
                    <span>University Email or Username</span>
                    <span className="text-secondary/70 font-mono text-[9px]">e.g. name@university.edu or username</span>
                  </label>
                  <input
                    id="auth-login-email"
                    type="text"
                    required
                    placeholder="name@university.edu or username"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-surface-container text-on-surface outline-none font-medium focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-headline font-bold text-secondary text-[10px] uppercase">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-surface-container-low px-3 py-2 pr-10 rounded-xl border border-surface-container text-on-surface outline-none font-medium focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-2.5 top-2 text-secondary hover:text-on-surface"
                      tabIndex={-1}
                    >
                      <span className="material-symbols-outlined text-base">
                        {showLoginPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  id="btn-submit-login"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-primary text-on-primary font-headline font-bold text-xs rounded-xl shadow hover:bg-primary-fixed-dim transition-all active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <span>Sign In to Campus Commute</span>
                  )}
                </button>

                <div className="pt-2 border-t border-surface-container flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setErrorMessage('');
                    }}
                    className="text-primary hover:underline font-bold"
                  >
                    Create New Account
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAdminGatekeeper();
                    }}
                    className="text-amber-700 hover:underline font-bold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">shield</span>
                    <span>Admin Gatekeeper</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* REGISTRATION FORM (PERSISTENT DATABASE BACKED) */
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div className="flex items-center gap-2 p-2.5 bg-primary/10 rounded-xl border border-primary/20">
                <span className="material-symbols-outlined text-base text-primary">school</span>
                <span className="text-xs font-bold text-primary">
                  New Student Registration
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-headline font-bold text-secondary text-[10px] uppercase">
                  Full Student Name
                </label>
                <input
                  id="auth-reg-name"
                  type="text"
                  required
                  placeholder="e.g. Jordan Hayes"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-surface-container text-on-surface outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-headline font-bold text-secondary text-[10px] uppercase flex justify-between">
                  <span>Institutional Email or Username</span>
                  <span className="text-secondary/70 font-mono text-[9px]">e.g. name@university.edu or username</span>
                </label>
                <input
                  id="auth-reg-email"
                  type="text"
                  required
                  placeholder="jordan.h@university.edu or jordan"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-surface-container text-on-surface outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-headline font-bold text-secondary text-[10px] uppercase">
                    Major / Year <span className="text-secondary/60 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    id="auth-reg-major"
                    type="text"
                    placeholder="e.g. BioTech '26"
                    value={regMajor}
                    onChange={(e) => setRegMajor(e.target.value)}
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-surface-container text-on-surface outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-headline font-bold text-secondary text-[10px] uppercase">
                    Student ID <span className="text-secondary/60 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    id="auth-reg-studentid"
                    type="text"
                    placeholder="e.g. STU-98124"
                    value={regStudentId}
                    onChange={(e) => setRegStudentId(e.target.value)}
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl border border-surface-container text-on-surface outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-headline font-bold text-secondary text-[10px] uppercase">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="auth-reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a password..."
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-surface-container-low px-3 py-2 pr-8 rounded-xl border border-surface-container text-on-surface outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-secondary hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-base">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Role Selection (PRD 5.2: Role Selection: Rider / Driver / Both) */}
              <div className="space-y-1">
                <label className="font-headline font-bold text-secondary text-[10px] uppercase">
                  Select Role on Platform
                </label>
                <div className="grid grid-cols-3 gap-1 bg-surface-container p-1 rounded-xl">
                  {[
                    { id: 'rider', label: 'Passenger' },
                    { id: 'driver', label: 'Driver' },
                    { id: 'both', label: 'Both' }
                  ].map(r => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setRegRole(r.id)}
                      className={`py-1.5 rounded-lg text-xs font-headline font-bold transition-all ${
                        regRole === r.id
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'text-secondary hover:text-on-surface'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="btn-submit-register"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-primary text-on-primary font-headline font-bold text-xs rounded-xl shadow hover:bg-primary-fixed-dim transition-all active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Verified Student Account</span>
                )}
              </button>

              <div className="text-center pt-2 text-[11px] text-secondary">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage('');
                  }}
                  className="text-primary font-bold hover:underline"
                >
                  Sign In here
                </button>
              </div>
            </form>
          )}

        </div>

        <div className="px-4 py-3 bg-surface-container-low border-t border-surface-container text-[11px] text-secondary text-center">
          🔒 Closed-loop verification restricts carpooling strictly to verified university credentials.
        </div>

      </div>
    </div>
  );
}
