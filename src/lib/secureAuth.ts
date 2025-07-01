// Secure Authentication Library
// Handles secure logout, session management, and security auditing

import { secureFetch } from './csrf';
import { supabase } from './supabase';

export interface LogoutOptions {
  global?: boolean; // If true, logs out from all devices
  auditReason?: string; // Reason for logout (user action, timeout, security, etc.)
  redirectTo?: string; // Where to redirect after logout
  clearLocalData?: boolean; // Whether to clear all local storage
}

export interface SecurityEvent {
  event_type: 'logout' | 'login' | 'session_timeout' | 'security_logout';
  user_id?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * Secure logout function that properly cleans up sessions and local data
 */
export async function secureLogout(options: LogoutOptions = {}): Promise<{
  success: boolean;
  error?: string;
}> {
  const {
    global = false,
    auditReason = 'user_action',
    redirectTo = '/',
    clearLocalData = true
  } = options;

  try {
    // Get current user for audit logging
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Log security event before logout
    if (userId) {
      await logSecurityEvent({
        event_type: 'logout',
        user_id: userId,
        ip_address: await getClientIP(),
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
        details: {
          reason: auditReason,
          global_logout: global,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
    }

    // Clear application-specific data first
    if (clearLocalData) {
      await clearApplicationData();
    }

    // Sign out from Supabase (handles token invalidation)
    const { error } = await supabase.auth.signOut({
      scope: global ? 'global' : 'local'
    });

    if (error) {
      console.error('Supabase logout error:', error);
      // Don't fail completely - still try to clean up locally
    }

    // Additional cleanup for sensitive data
    await performSecurityCleanup();

    // Clear any remaining authentication cookies
    await clearAuthenticationCookies();

    // Redirect securely
    if (typeof window !== 'undefined') {
      // Use replace to prevent back button from returning to authenticated page
      window.location.replace(redirectTo);
    }

    return { success: true };

  } catch (error) {
    console.error('Secure logout error:', error);
    
    // Even if there's an error, try to clean up locally
    if (clearLocalData) {
      await clearApplicationData();
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed'
    };
  }
}

/**
 * Clear all application-specific data from local storage
 */
async function clearApplicationData(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // Clear localStorage items
    const keysToRemove = [
      'supabase.auth.token',
      'sb-auth-token',
      'user-profile',
      'hr-admin-profile',
      'restorative-record-data',
      'assessment-data',
      'draft-data'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear any IndexedDB data if used
    if ('indexedDB' in window) {
      // Add IndexedDB cleanup if your app uses it
    }

  } catch (error) {
    console.error('Error clearing application data:', error);
  }
}

/**
 * Perform additional security cleanup
 */
async function performSecurityCleanup(): Promise<void> {
  try {
    // Clear any cached user data from memory
    if (typeof window !== 'undefined') {
      // Clear any global variables or cached data
      (window as any).userProfile = null;
      (window as any).authState = null;
    }

    // Clear browser cache for sensitive pages (if possible)
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }

  } catch (error) {
    console.error('Error in security cleanup:', error);
  }
}

/**
 * Clear authentication-related cookies
 */
async function clearAuthenticationCookies(): Promise<void> {
  if (typeof document === 'undefined') return;

  try {
    // Get all cookies and clear auth-related ones
    const cookies = document.cookie.split(';');
    
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // Clear authentication-related cookies
      if (name.includes('sb-') || name.includes('auth') || name.includes('session')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;secure;samesite=strict`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    });

  } catch (error) {
    console.error('Error clearing cookies:', error);
  }
}

/**
 * Log security events for audit trail
 */
async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    // In a production app, you might want to send this to a dedicated audit service
    // For now, we'll use a secure API endpoint
    await secureFetch('/api/audit/security-event', {
      method: 'POST',
      body: JSON.stringify(event)
    });

  } catch (error) {
    // Don't fail logout if audit logging fails, but log the error
    console.error('Failed to log security event:', error);
  }
}

/**
 * Get client IP address for audit logging
 */
async function getClientIP(): Promise<string> {
  try {
    // In production, you might get this from headers or a service
    return 'client-ip'; // Placeholder
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Force logout for security reasons (compromise, suspicious activity, etc.)
 */
export async function forceSecurityLogout(reason: string = 'security_event'): Promise<void> {
  await secureLogout({
    global: true, // Log out from all devices
    auditReason: reason,
    redirectTo: '/auth/security-logout',
    clearLocalData: true
  });
}

/**
 * Check if current session is valid and hasn't been compromised
 */
export async function validateSession(): Promise<{
  valid: boolean;
  reason?: string;
}> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return { valid: false, reason: 'no_session' };
    }

    // Check if token is expired
    const now = Date.now() / 1000;
    if (session.expires_at && session.expires_at < now) {
      return { valid: false, reason: 'token_expired' };
    }

    // Additional security checks could go here
    // - Check for concurrent sessions
    // - Validate IP address consistency
    // - Check for unusual activity patterns

    return { valid: true };

  } catch (error) {
    console.error('Session validation error:', error);
    return { valid: false, reason: 'validation_error' };
  }
}

/**
 * Initialize session monitoring
 */
export function initializeSessionMonitoring(): void {
  if (typeof window === 'undefined') return;

  // Monitor for session timeout
  const checkSession = async () => {
    const { valid, reason } = await validateSession();
    
    if (!valid) {
      console.warn('Invalid session detected:', reason);
      await forceSecurityLogout(`session_invalid_${reason}`);
    }
  };

  // Check session every 5 minutes
  setInterval(checkSession, 5 * 60 * 1000);

  // Check session when page becomes visible (user returns to tab)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      checkSession();
    }
  });

  // Check session on network reconnection
  window.addEventListener('online', checkSession);
}

/**
 * Secure logout with CSRF protection for logout endpoints
 */
export async function secureLogoutAPI(): Promise<Response> {
  return await secureFetch('/api/auth/logout', {
    method: 'POST',
    body: JSON.stringify({
      action: 'logout',
      timestamp: new Date().toISOString()
    })
  });
} 
