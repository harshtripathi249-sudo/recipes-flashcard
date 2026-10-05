import React, { useState } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import { validateEmail, getFirebaseAuthErrorMessage } from '../lib/validation';

export default function AuthModal({ isOpen, onClose, currentUser, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState(null);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const firebaseProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || '';
  const firebaseConsoleAuthUrl = firebaseProjectId 
    ? `https://console.firebase.google.com/project/${firebaseProjectId}/authentication/settings`
    : 'https://console.firebase.google.com';

  // Granular email validation
  const emailValidation = validateEmail(email);
  const isEmailEmpty = !email.trim();
  const hasEmailError = (emailTouched || attemptedSubmit) && !emailValidation.isValid;
  const emailErrorText = isEmailEmpty ? 'Email address cannot be empty.' : emailValidation.error;
  const showEmailSuccess = email.trim().length > 0 && emailValidation.isValid;

  // Password validation
  const isPasswordEmpty = !password.trim();
  const isPasswordTooShort = isSignUp && password.length > 0 && password.length < 6;
  const hasPasswordError = (passwordTouched || attemptedSubmit) && (isPasswordEmpty || isPasswordTooShort);
  const passwordErrorText = isPasswordEmpty 
    ? 'Password is required.' 
    : isPasswordTooShort 
      ? 'Password must be at least 6 characters long.' 
      : null;

  const handleCopyDomain = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentHostname);
        setCopiedDomain(true);
        setTimeout(() => setCopiedDomain(false), 2500);
      }
    } catch (copyErr) {
      console.warn('[AuthModal] Could not copy domain to clipboard:', copyErr);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      setError('Firebase is not yet configured with valid credentials in your environment.');
      return;
    }
    setError(null);
    setUnauthorizedDomain(null);
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (onAuthSuccess) onAuthSuccess(result.user);
      onClose();
    } catch (err) {
      console.warn('[AuthModal] Google Sign-In error:', err);
      const parsed = getFirebaseAuthErrorMessage(err, currentHostname);
      if (parsed.isUnauthorizedDomain) {
        setUnauthorizedDomain({
          hostname: currentHostname,
          projectId: firebaseProjectId
        });
      }
      setError(parsed.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    setEmailTouched(true);
    setPasswordTouched(true);

    if (!isFirebaseConfigured || !auth) {
      setError('Firebase is not yet configured with valid credentials in your environment.');
      return;
    }

    // Exact email pre-validation
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setError(emailCheck.error);
      const emailInput = document.getElementById('auth-email');
      if (emailInput) emailInput.focus();
      return;
    }

    if (!password.trim()) {
      setError('Please provide your password.');
      const passInput = document.getElementById('auth-password');
      if (passInput) passInput.focus();
      return;
    }

    if (isSignUp && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      const passInput = document.getElementById('auth-password');
      if (passInput) passInput.focus();
      return;
    }

    setError(null);
    setUnauthorizedDomain(null);
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
      console.warn('[AuthModal] Email Auth error:', err);
      const parsed = getFirebaseAuthErrorMessage(err, currentHostname);
      if (parsed.isUnauthorizedDomain) {
        setUnauthorizedDomain({
          hostname: currentHostname,
          projectId: firebaseProjectId
        });
      }
      setError(parsed.message);
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
      console.error('[AuthModal] Sign out error:', err);
      setError('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setUnauthorizedDomain(null);
    setAttemptedSubmit(false);
    setEmailTouched(false);
    setPasswordTouched(false);
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
              {/* Specialized Unauthorized Domain Troubleshooting Banner */}
              {unauthorizedDomain && (
                <div className="auth-domain-banner" role="alert">
                  <div className="auth-domain-header">
                    <span className="auth-domain-icon" aria-hidden="true">🌐</span>
                    <div className="auth-domain-title-group">
                      <strong className="auth-domain-title">Domain Authorization Required</strong>
                      <p className="auth-domain-desc">
                        Firebase blocks authentication from domains that are not in your project&apos;s authorized whitelist.
                      </p>
                    </div>
                  </div>

                  <div className="auth-domain-card">
                    <div className="auth-domain-copy-strip">
                      <span className="auth-domain-label">Current Domain:</span>
                      <code className="auth-domain-pill">{unauthorizedDomain.hostname}</code>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary copy-domain-btn"
                        onClick={handleCopyDomain}
                        title="Copy domain to clipboard"
                      >
                        {copiedDomain ? '✓ Copied' : 'Copy Domain'}
                      </button>
                    </div>

                    <div className="auth-domain-steps">
                      <strong>How to fix in 3 quick steps:</strong>
                      <ol>
                        <li>
                          Open Firebase Console:{' '}
                          <a 
                            href={firebaseConsoleAuthUrl}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="auth-link-highlight"
                          >
                            Settings &gt; Authorized domains ↗
                          </a>
                        </li>
                        <li>
                          Under <strong>Authorized domains</strong>, click <strong>Add domain</strong>.
                        </li>
                        <li>
                          Paste <code className="inline-code">{unauthorizedDomain.hostname}</code> and click <strong>Save</strong>.
                        </li>
                      </ol>
                    </div>

                    {unauthorizedDomain.hostname === '127.0.0.1' && (
                      <div className="auth-domain-quick-tip">
                        💡 <strong>Quick Alternative:</strong> Access the app via{' '}
                        <a 
                          href="http://localhost:5173" 
                          className="auth-link-highlight"
                        >
                          http://localhost:5173
                        </a>{' '}
                        instead of 127.0.0.1 (Firebase authorizes localhost by default).
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* General Error Banner (when not unauthorized domain) */}
              {error && !unauthorizedDomain && (
                <div className="auth-error-banner" role="alert">
                  <span className="auth-error-icon">⚠️</span>
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
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
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

                  <form onSubmit={handleEmailAuth} className="auth-email-form" noValidate>
                    {/* Granular Email Validation Field */}
                    <div className="form-group email-form-group">
                      <div className="form-label-row">
                        <label htmlFor="auth-email" className="form-label">
                          Email Address <span className="label-required">*</span>
                        </label>
                        {showEmailSuccess && (
                          <span className="email-status-pill success" aria-live="polite">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Valid format
                          </span>
                        )}
                        {hasEmailError && (
                          <span className="email-status-pill error" aria-live="polite">
                            Invalid format
                          </span>
                        )}
                      </div>

                      <div className="input-with-feedback">
                        <input 
                          type="email" 
                          id="auth-email" 
                          className={`form-input ${
                            hasEmailError 
                              ? 'is-invalid' 
                              : showEmailSuccess 
                                ? 'is-valid' 
                                : ''
                          }`} 
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError(null);
                            if (unauthorizedDomain) setUnauthorizedDomain(null);
                          }}
                          onBlur={() => {
                            if (email.trim().length > 0) {
                              setEmailTouched(true);
                            }
                          }}
                          placeholder="chef@savoria.kitchen"
                          autoComplete="email"
                          aria-invalid={hasEmailError}
                          aria-describedby={hasEmailError ? 'auth-email-error-msg' : undefined}
                          required 
                        />
                        {showEmailSuccess && (
                          <span className="input-state-badge success" title="Valid email format">
                            ✓
                          </span>
                        )}
                      </div>

                      {/* Exact, detailed error explanation when invalid */}
                      {hasEmailError && (
                        <div 
                          id="auth-email-error-msg" 
                          className="form-error-msg email-error-feedback" 
                          role="alert"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                          <span>{emailErrorText}</span>
                        </div>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="form-group password-form-group">
                      <div className="form-label-row">
                        <label htmlFor="auth-password" className="form-label">
                          Password <span className="label-required">*</span>
                        </label>
                        {isSignUp && (
                          <span className="form-hint-pill">Min. 6 chars</span>
                        )}
                      </div>

                      <div className="input-with-feedback">
                        <input 
                          type="password" 
                          id="auth-password" 
                          className={`form-input ${hasPasswordError ? 'is-invalid' : ''}`} 
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (error) setError(null);
                          }}
                          onBlur={() => {
                            if (password.length > 0) {
                              setPasswordTouched(true);
                            }
                          }}
                          placeholder="••••••••"
                          autoComplete={isSignUp ? 'new-password' : 'current-password'}
                          aria-invalid={hasPasswordError}
                          aria-describedby={hasPasswordError ? 'auth-password-error-msg' : undefined}
                          required 
                        />
                      </div>

                      {hasPasswordError && (
                        <div 
                          id="auth-password-error-msg" 
                          className="form-error-msg password-error-feedback" 
                          role="alert"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                          <span>{passwordErrorText}</span>
                        </div>
                      )}
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
                      onClick={handleToggleMode}
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
