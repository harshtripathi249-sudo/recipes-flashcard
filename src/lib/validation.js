/**
 * Savoria Recipe Book - Authentication & Input Validation Utilities
 * 
 * Provides granular, human-friendly email validation that explains
 * precisely what is invalid about an entered email address, as well
 * as translated error messages for Firebase Authentication error codes.
 */

/**
 * Validates an email address and returns an exact, specific reason if invalid.
 * 
 * @param {string} email - The email string to validate
 * @returns {{ isValid: boolean, error: string | null, reasonCode?: string }}
 */
export function validateEmail(email) {
  if (typeof email !== 'string') {
    return { 
      isValid: false, 
      error: 'Email address must be text.',
      reasonCode: 'TYPE_ERROR'
    };
  }

  const raw = email;
  const trimmed = email.trim();

  // 1. Empty check
  if (!trimmed) {
    return { 
      isValid: false, 
      error: 'Email address cannot be empty.',
      reasonCode: 'EMPTY'
    };
  }

  // 2. Whitespace check
  if (/\s/.test(raw)) {
    return { 
      isValid: false, 
      error: 'Email address cannot contain spaces.',
      reasonCode: 'HAS_SPACES'
    };
  }

  // 3. '@' symbol existence
  if (!trimmed.includes('@')) {
    return { 
      isValid: false, 
      error: "Missing '@' symbol in email address (e.g., chef@savoria.kitchen).",
      reasonCode: 'MISSING_AT'
    };
  }

  // 4. Multiple '@' symbols
  const parts = trimmed.split('@');
  if (parts.length > 2) {
    return { 
      isValid: false, 
      error: "Email address can only contain one '@' symbol.",
      reasonCode: 'MULTIPLE_AT'
    };
  }

  const [localPart, domainPart] = parts;

  // 5. Username (local part) checks
  if (!localPart) {
    return { 
      isValid: false, 
      error: "Missing username/recipient before '@' (e.g., 'chef' in chef@savoria.kitchen).",
      reasonCode: 'MISSING_USERNAME'
    };
  }

  if (localPart.startsWith('.')) {
    return { 
      isValid: false, 
      error: "Username before '@' cannot start with a period ('.').",
      reasonCode: 'USERNAME_STARTS_WITH_DOT'
    };
  }

  if (localPart.endsWith('.')) {
    return { 
      isValid: false, 
      error: "Username before '@' cannot end with a period ('.').",
      reasonCode: 'USERNAME_ENDS_WITH_DOT'
    };
  }

  if (localPart.includes('..')) {
    return { 
      isValid: false, 
      error: "Username cannot contain consecutive periods ('..').",
      reasonCode: 'USERNAME_CONSECUTIVE_DOTS'
    };
  }

  // Check for invalid characters in username
  if (/[^\w.!#$%&'*+/=?^`{|}~-]/.test(localPart)) {
    return { 
      isValid: false, 
      error: "Username before '@' contains invalid special characters.",
      reasonCode: 'USERNAME_INVALID_CHARS'
    };
  }

  // 6. Domain part checks
  if (!domainPart) {
    return { 
      isValid: false, 
      error: "Missing domain after '@' (e.g., 'gmail.com' or 'savoria.kitchen').",
      reasonCode: 'MISSING_DOMAIN'
    };
  }

  if (domainPart.startsWith('.')) {
    return { 
      isValid: false, 
      error: "Domain after '@' cannot start with a period ('.').",
      reasonCode: 'DOMAIN_STARTS_WITH_DOT'
    };
  }

  if (domainPart.endsWith('.')) {
    return { 
      isValid: false, 
      error: "Domain after '@' cannot end with a period ('.'). Please finish typing the domain extension.",
      reasonCode: 'DOMAIN_ENDS_WITH_DOT'
    };
  }

  if (domainPart.includes('..')) {
    return { 
      isValid: false, 
      error: "Domain cannot contain consecutive periods ('..').",
      reasonCode: 'DOMAIN_CONSECUTIVE_DOTS'
    };
  }

  if (domainPart.startsWith('-') || domainPart.endsWith('-')) {
    return { 
      isValid: false, 
      error: "Domain cannot start or end with a hyphen ('-').",
      reasonCode: 'DOMAIN_HYPHEN_EDGE'
    };
  }

  if (!domainPart.includes('.')) {
    return { 
      isValid: false, 
      error: "Domain is missing an extension like '.com', '.org', or '.kitchen'.",
      reasonCode: 'DOMAIN_MISSING_EXTENSION'
    };
  }

  const domainSegments = domainPart.split('.');
  const tld = domainSegments[domainSegments.length - 1];

  if (!tld || tld.length < 2) {
    return { 
      isValid: false, 
      error: "Domain extension must be at least 2 characters long (e.g., '.com', '.io').",
      reasonCode: 'EXTENSION_TOO_SHORT'
    };
  }

  if (!/^[a-zA-Z]+$/.test(tld)) {
    return { 
      isValid: false, 
      error: "Domain extension should only contain letters (e.g., '.com' or '.kitchen').",
      reasonCode: 'EXTENSION_NOT_LETTERS'
    };
  }

  for (const seg of domainSegments) {
    if (!seg) {
      return { 
        isValid: false, 
        error: "Domain contains an empty segment between dots.",
        reasonCode: 'DOMAIN_EMPTY_SEGMENT'
      };
    }
    if (seg.startsWith('-') || seg.endsWith('-')) {
      return { 
        isValid: false, 
        error: "Domain segments cannot start or end with a hyphen ('-').",
        reasonCode: 'DOMAIN_SEGMENT_HYPHEN'
      };
    }
    if (!/^[a-zA-Z0-9-]+$/.test(seg)) {
      return { 
        isValid: false, 
        error: "Domain contains unsupported special characters.",
        reasonCode: 'DOMAIN_INVALID_CHARS'
      };
    }
  }

  // 7. General RFC standard email pattern check
  const rfcRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!rfcRegex.test(trimmed)) {
    return { 
      isValid: false, 
      error: 'Email format is invalid. Please verify the address format.',
      reasonCode: 'RFC_FAIL'
    };
  }

  return { 
    isValid: true, 
    error: null,
    reasonCode: 'VALID'
  };
}

/**
 * Translates Firebase Auth errors into clear, actionable human messages.
 * 
 * @param {any} err - The error object thrown by Firebase
 * @param {string} [currentHostname] - Optional hostname where the app is running
 * @returns {{ code: string, message: string, title?: string, isUnauthorizedDomain?: boolean }}
 */
export function getFirebaseAuthErrorMessage(err, currentHostname = '') {
  if (!err) {
    return { code: 'unknown', message: 'An unexpected error occurred.' };
  }

  const code = err.code || '';
  const hostname = currentHostname || (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

  switch (code) {
    case 'auth/unauthorized-domain':
      return {
        code,
        isUnauthorizedDomain: true,
        title: 'Unauthorized Domain Error',
        message: `This domain ('${hostname}') is not authorized in your Firebase Authentication settings.`,
        hostname
      };

    case 'auth/invalid-email':
      return {
        code,
        title: 'Invalid Email Address',
        message: 'The email address entered is not recognized as a valid email by Firebase.'
      };

    case 'auth/user-not-found':
      return {
        code,
        title: 'Account Not Found',
        message: 'No account found with this email. Click "Create One" below to sign up.'
      };

    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return {
        code,
        title: 'Authentication Failed',
        message: 'Invalid email or password. Please verify and try again.'
      };

    case 'auth/email-already-in-use':
      return {
        code,
        title: 'Email Already Registered',
        message: 'An account with this email already exists. Please sign in instead.'
      };

    case 'auth/weak-password':
      return {
        code,
        title: 'Password Too Weak',
        message: 'Password must be at least 6 characters long.'
      };

    case 'auth/popup-closed-by-user':
      return {
        code,
        title: 'Sign-in Cancelled',
        message: 'The Google sign-in window was closed before completing.'
      };

    case 'auth/popup-blocked':
      return {
        code,
        title: 'Popup Blocked',
        message: 'The Google sign-in popup was blocked by your browser. Please allow popups for this site.'
      };

    case 'auth/operation-not-allowed':
      return {
        code,
        title: 'Sign-in Method Disabled',
        message: 'This sign-in method is not enabled in your Firebase Console. Please enable it under Authentication > Sign-in method.'
      };

    case 'auth/too-many-requests':
      return {
        code,
        title: 'Temporarily Blocked',
        message: 'Too many unsuccessful attempts. Access to this account has been temporarily disabled. Please try again later.'
      };

    case 'auth/network-request-failed':
      return {
        code,
        title: 'Network Error',
        message: 'Network request failed. Please check your internet connection and try again.'
      };

    default:
      return {
        code,
        title: 'Authentication Error',
        message: err.message || 'Authentication failed. Please try again.'
      };
  }
}
