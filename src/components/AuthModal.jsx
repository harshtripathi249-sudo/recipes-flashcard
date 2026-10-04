import React, { useState } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';

export default function AuthModal({ isOpen, onClose, currentUser, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      setError('Firebase is not yet configured with valid credentials in your environment.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (onAuthSuccess) onAuthSuccess(result.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!isFirebaseConfigured || !auth) {
      setError('Firebase is not yet configured with valid credentials in your environment.');
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      let result;
      if (isSignUp) {
        result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        result = await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      if (onAuthSuccess) onAuthSuccess(result.user);
      onClose();
    } catch (err) {
      let msg = err.message || 'Authentication failed.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      await signOut(auth);
      if (onAuthSuccess) onAuthSuccess(null);
      onClose();
    } catch (err) {
      setError('Failed to sign out.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div className="modal-container auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-eyebrow">
              {currentUser ? 'Account & Cloud Sync' : 'Kitchen Account'}
            </span>
            <h2 id="auth-modal-title" className="modal-title">
              {currentUser ? 'Signed In' : isSignUp ? 'Create Savoria Account' : 'Welcome to Savoria'}
            </h2>
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close authentication dialog"
          >
            ×
          </button>
        </div>

        <div className="modal-body auth-modal-body">
          {!isFirebaseConfigured && (
            <div className="auth-alert-notice" role="alert">
              <span className="alert-icon">ℹ️</span>
              <div className="alert-content">
                <strong>Guest Mode Active (Local Storage)</strong>
                <p>
                  Firebase credentials are not configured yet. All recipes will be saved to your local browser storage. You can continue cooking and managing recipes without signing in.
                </p>
              </div>
            </div>
          )}

          {currentUser ? (
            <div className="auth-signed-in-view">
              <div className="user-profile-badge">
                <div className="user-avatar-placeholder">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : currentUser.email ? currentUser.email[0].toUpperCase() : 'U'}
                </div>
                <div className="user-profile-info">
                  <strong>{currentUser.displayName || 'Savoria Cook'}</strong>
                  <span className="user-email">{currentUser.email || 'Anonymous Account'}</span>
                </div>
              </div>

              <p className="auth-sync-status">
                ✓ Cloud Sync Enabled: Your recipes are securely saved to your personal Firestore collection.
              </p>

              <button 
                type="button" 
                className="btn btn-outline-danger btn-block"
                onClick={handleSignOut}
                disabled={loading}
              >
                {loading ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="auth-error-banner" role="alert">
                  <span>{error}</span>
                </div>
              )}

              {isFirebaseConfigured && (
                <>
                  <button
                    type="button"
                    className="btn btn-secondary btn-block google-signin-btn"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="auth-divider">
                    <span>or continue with email</span>
                  </div>

                  <form onSubmit={handleEmailAuth} className="auth-email-form">
                    <div className="form-group">
                      <label htmlFor="auth-email">Email Address</label>
                      <input 
                        type="email" 
                        id="auth-email" 
                        className="form-input" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="chef@savoria.kitchen"
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="auth-password">Password</label>
                      <input 
                        type="password" 
                        id="auth-password" 
                        className="form-input" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required 
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary btn-block"
                      disabled={loading}
                    >
                      {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                    </button>
                  </form>

                  <div className="auth-toggle-row">
                    <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
                    <button 
                      type="button" 
                      className="btn-link"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError(null);
                      }}
                    >
                      {isSignUp ? 'Sign In' : 'Create One'}
                    </button>
                  </div>
                </>
              )}

              <div className="guest-continue-box">
                <p>No account required to use Savoria:</p>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={onClose}
                >
                  Continue as Guest (Local Storage)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
