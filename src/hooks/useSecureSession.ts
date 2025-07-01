// Secure Session Management Hook
// Provides session monitoring, automatic logout, and security features

import { forceSecurityLogout, secureLogout, validateSession } from '@/lib/secureAuth';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSecureSessionOptions {
  checkInterval?: number; // How often to check session (in milliseconds)
  warningTime?: number; // How long before expiry to show warning (in milliseconds)
  onSessionExpired?: () => void;
  onSecurityEvent?: (reason: string) => void;
  onSessionWarning?: (timeRemaining: number) => void;
}

interface SecureSessionState {
  isValid: boolean;
  timeUntilExpiry: number | null;
  lastCheck: Date | null;
  isMonitoring: boolean;
}

export function useSecureSession(options: UseSecureSessionOptions = {}) {
  const {
    checkInterval = 5 * 60 * 1000, // 5 minutes
    warningTime = 10 * 60 * 1000, // 10 minutes
    onSessionExpired,
    onSecurityEvent,
    onSessionWarning
  } = options;

  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout>();
  const warningShownRef = useRef(false);

  const checkSession = useCallback(async () => {
    try {
      const { valid, reason } = await validateSession();
      
      if (!valid) {
        console.warn('Session validation failed:', reason);
        
        // Clear any existing intervals
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        // Trigger callbacks
        if (reason?.includes('expired') || reason?.includes('timeout')) {
          onSessionExpired?.();
        } else {
          onSecurityEvent?.(reason || 'unknown');
        }

        // Force security logout
        await forceSecurityLogout(reason || 'session_invalid');
        
        return false;
      }

      // Reset warning flag if session is valid
      warningShownRef.current = false;
      return true;

    } catch (error) {
      console.error('Error checking session:', error);
      onSecurityEvent?.('session_check_error');
      return false;
    }
  }, [onSessionExpired, onSecurityEvent]);

  const startMonitoring = useCallback(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start new monitoring interval
    intervalRef.current = setInterval(checkSession, checkInterval);

    // Immediate check
    checkSession();
  }, [checkSession, checkInterval]);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  const performSecureLogout = useCallback(async (reason: string = 'user_action') => {
    try {
      stopMonitoring();
      
      const result = await secureLogout({
        auditReason: reason,
        redirectTo: '/',
        clearLocalData: true
      });

      if (!result.success) {
        console.error('Secure logout failed:', result.error);
        // Force redirect as fallback
        router.push('/');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      router.push('/');
    }
  }, [router, stopMonitoring]);

  // Initialize session monitoring
  useEffect(() => {
    startMonitoring();

    // Monitor visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkSession();
      }
    };

    // Monitor network status
    const handleOnline = () => {
      checkSession();
    };

    // Monitor storage events (potential concurrent sessions)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('auth') || e.key?.includes('session')) {
        setTimeout(checkSession, 1000); // Small delay to allow storage to settle
      }
    };

    // Monitor beforeunload to cleanup
    const handleBeforeUnload = () => {
      stopMonitoring();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      stopMonitoring();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [startMonitoring, stopMonitoring, checkSession]);

  return {
    performSecureLogout,
    checkSession,
    startMonitoring,
    stopMonitoring
  };
}

// Note: Higher-order component removed due to TypeScript complexity
// Use the useSecureSession hook directly in your components instead

// Hook for getting session state information
export function useSessionState(): SecureSessionState {
  const [state, setState] = useState<SecureSessionState>({
    isValid: false,
    timeUntilExpiry: null,
    lastCheck: null,
    isMonitoring: false
  });

  useEffect(() => {
    let mounted = true;

    const updateState = async () => {
      try {
        const { valid } = await validateSession();
        
        if (mounted) {
          setState({
            isValid: valid,
            timeUntilExpiry: null, // Could be calculated from session
            lastCheck: new Date(),
            isMonitoring: true
          });
        }
      } catch (error) {
        if (mounted) {
          setState((prev: SecureSessionState) => ({
            ...prev,
            isValid: false,
            lastCheck: new Date()
          }));
        }
      }
    };

    updateState();
    const interval = setInterval(updateState, 30000); // Check every 30 seconds

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return state;
} 
