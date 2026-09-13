import React, { useState } from 'react';

export default function ProfileVerifyView({ user, onUpdateUser, onShowToast, onOpenAuth }) {
  // If user is not signed in, restrict profile access
  if (!user) {
    return (
      <div className="px-4 py-8 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-5 animate-fadeIn">
        <div className="w-20 h-20 rounded-3xl bg-error-container/20 border-2 border-error-container text-error flex items-center justify-center shadow-xl shadow-error/10">
          <span className="material-symbols-outlined text-4xl">lock_person</span>
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-headline text-[11px] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">shield</span>
            <span>Access Restricted</span>
          </span>
          <h2 className="font-headline font-bold text-2xl text-on-surface">
            Profile Access Restricted
          </h2>
          <p className="font-body text-xs text-secondary leading-relaxed max-w-sm">
            Student and driver profile credentials, institutional ID badges, and commuter history are private and restricted strictly to verified university community members.
          </p>
        </div>

        <div className="w-full bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high text-xs text-left space-y-2 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-on-surface">
            <span className="material-symbols-outlined text-primary text-base">verified_user</span>
            <span>Closed-Loop Campus Protection</span>
          </div>
          <p className="text-[11px] text-secondary leading-relaxed">
            To view or modify your campus commuter profile, please sign in with your <span className="font-mono text-primary font-bold">@university.edu</span> credentials or register a new verified student account.
          </p>
        </div>

        <div className="w-full space-y-2.5">
          <button
            id="btn-profile-restricted-signin"
            onClick={onOpenAuth}
            className="w-full py-3 bg-primary text-on-primary font-headline font-bold text-xs rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-fixed-dim transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">login</span>
            <span>Sign In / Register with University ID</span>
          </button>
        </div>

        <div className="text-[11px] text-secondary flex items-center gap-1">
          <span className="material-symbols-outlined text-sm text-secondary">help_outline</span>
          <span>Need help? Contact Campus Transportation Services</span>
        </div>
      </div>
    );
  }

  const [name, setName] = useState(user.name);
  const [major, setMajor] = useState(user.major);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [docUploaded, setDocUploaded] = useState(false);
  const [docName, setDocName] = useState('Student_ID_Fall2024.pdf');

  const handleSave = (e) => {
    e.preventDefault();

    if (!email.toLowerCase().endsWith('@university.edu') && !email.toLowerCase().endsWith('.edu')) {
      onShowToast('Validation Error', 'Institutional email must end with @university.edu');
      return;
    }

    onUpdateUser({
      ...user,
      name,
      major,
      email,
      role
    });

    onShowToast('Profile Updated', 'Student credentials and verification status saved.');
  };

  const handleUploadSim = () => {
    setDocUploaded(true);
    onShowToast('Document Submitted', 'Student verification doc forwarded to Admin Queue for approval.');
  };

  return (
    <div className="px-4 py-3 flex flex-col gap-4 pb-24 max-w-xl mx-auto">
      
      {/* Title */}
      <div>
        <h2 className="font-headline font-bold text-xl text-on-surface">Campus Student Profile</h2>
        <p className="font-body text-xs text-secondary">
          Manage closed-loop verification, student credentials, and ride history.
        </p>
      </div>

      {/* ID Card Display */}
      <div className="bg-gradient-to-tr from-primary to-primary-container p-5 rounded-3xl text-on-primary shadow-lg shadow-primary/20 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/60 shadow-md"
            />
            <div>
              <h3 className="font-headline font-bold text-base">{user.name}</h3>
              <div className="text-xs text-on-primary/90 font-medium">{user.major}</div>
              <div className="text-[11px] font-mono text-on-primary/80 mt-0.5">ID: {user.studentId}</div>
            </div>
          </div>

          <div className="text-right flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>Verified</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-emerald-950/40 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-bold text-emerald-200">
              🌱 {user.ecoCredits ?? 120} Eco-Credits
            </span>
            <div className="text-xs font-semibold">★ {user.rating} ({user.completedRides} rides)</div>
          </div>
        </div>

        {/* Enrolled Courses Badges */}
        <div className="mt-4 pt-3 border-t border-white/20">
          <span className="text-[10px] uppercase font-bold text-white/80 block mb-1.5">
            Verified Semester Courses (Mutual Matching):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {user.enrolledCourses?.map(c => (
              <span key={c} className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-medium">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-sm space-y-3">
        <h4 className="font-headline font-bold text-sm text-on-surface">Account Credentials</h4>

        <div className="space-y-1">
          <label className="text-[10px] font-headline font-bold text-secondary uppercase">Full Name</label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-xs font-semibold text-on-surface border border-surface-container"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-headline font-bold text-secondary uppercase">University Email (@university.edu)</label>
          <input
            id="profile-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-xs font-semibold text-on-surface border border-surface-container"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-headline font-bold text-secondary uppercase">Academic Major & Year</label>
          <input
            id="profile-major"
            type="text"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-xs font-semibold text-on-surface border border-surface-container"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-headline font-bold text-secondary uppercase">Preferred Role</label>
          <div className="grid grid-cols-3 gap-1 bg-surface-container p-1 rounded-xl">
            {['rider', 'driver', 'both'].map(r => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={`py-1.5 rounded-lg text-xs font-headline font-bold uppercase transition-all ${
                  role === r
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-primary text-on-primary rounded-xl font-headline font-bold text-xs shadow hover:bg-primary-fixed-dim hover:text-on-primary-fixed transition-colors"
        >
          Save Profile Updates
        </button>
      </form>

      {/* Verification Document Upload Simulation (PRD 5.8) */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-headline font-bold text-sm text-on-surface">Campus ID & Driver License Verification</h4>
          <span className="text-[11px] font-bold text-primary">Annual Re-check</span>
        </div>
        
        <p className="text-xs text-secondary leading-relaxed">
          Upload your physical student ID card or driving license photo to maintain your verified green badge.
        </p>

        <div className="border-2 border-dashed border-surface-container-highest p-4 rounded-2xl text-center space-y-2 bg-surface-container-low/50">
          <span className="material-symbols-outlined text-3xl text-secondary">upload_file</span>
          <div className="text-xs font-semibold text-on-surface">
            {docUploaded ? docName : 'Click to select student badge or vehicle registration'}
          </div>
          <p className="text-[10px] text-secondary">PDF, JPG or PNG up to 5MB</p>
          
          <button
            type="button"
            onClick={handleUploadSim}
            className="px-4 py-1.5 bg-surface-container hover:bg-surface-container-high rounded-xl text-xs font-bold text-on-surface transition-colors"
          >
            {docUploaded ? '✓ Document Uploaded' : 'Upload ID Document'}
          </button>
        </div>
      </div>

    </div>
  );
}
