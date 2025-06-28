// CSRF token utility functions

/**
 * Get CSRF token from cookie
 */
export function getCSRFToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(cookie => 
    cookie.trim().startsWith('csrf-token=')
  );
  
  if (!csrfCookie) return null;
  
  return csrfCookie.split('=')[1];
}

/**
 * Get CSRF token from meta tag (alternative method)
 */
export function getCSRFTokenFromMeta(): string | null {
  if (typeof document === 'undefined') return null;
  
  const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
  return metaTag?.content || null;
}

/**
 * Make a secure fetch request with CSRF token
 */
export async function secureFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let csrfToken = getCSRFToken();
  
  // If no token is found and this is a state-changing request, try to initialize CSRF protection
  if (!csrfToken && (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE')) {
    console.log('CSRF token not found, attempting to initialize...');
    await initializeCSRFProtection();
    
    // Wait a brief moment for the token to be set
    await new Promise(resolve => setTimeout(resolve, 100));
    
    csrfToken = getCSRFToken();
    
    if (!csrfToken) {
      throw new Error('CSRF token not found');
    }
  }
  
  const headers = new Headers(options.headers);
  
  if (csrfToken) {
    headers.set('X-CSRF-Token', csrfToken);
  }
  
  // Ensure Content-Type is set for JSON requests
  if (options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin', // Include cookies
  });
}

/**
 * Validate that the current page has a CSRF token
 */
export function validateCSRFToken(): boolean {
  const token = getCSRFToken();
  return token !== null && token.length > 0;
}

/**
 * Initialize CSRF protection by ensuring token exists
 * Call this on page load for pages that need CSRF protection
 */
export async function initializeCSRFProtection(): Promise<void> {
  if (validateCSRFToken()) {
    return; // Token already exists
  }
  
  // Make a GET request to generate CSRF token with cache busting
  try {
    await fetch(window.location.pathname + '?_csrf_init=' + Date.now(), {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-cache'
    });
    
    // Verify token was set
    if (!validateCSRFToken()) {
      console.warn('CSRF token was not set after initialization request');
    }
  } catch (error) {
    console.warn('Failed to initialize CSRF protection:', error);
  }
} 
