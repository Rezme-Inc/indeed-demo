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
  const csrfToken = getCSRFToken();
  
  if (!csrfToken && (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE')) {
    throw new Error('CSRF token not found');
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
  
  // Make a GET request to generate CSRF token
  try {
    await fetch(window.location.pathname, {
      method: 'GET',
      credentials: 'same-origin'
    });
  } catch (error) {
    console.warn('Failed to initialize CSRF protection:', error);
  }
} 
