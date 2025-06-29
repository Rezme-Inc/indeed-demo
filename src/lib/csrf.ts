// CSRF token utility functions

/**
 * Get CSRF token from cookie
 */
export function getCSRFToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(cookie => 
    cookie.trim().startsWith('csrf-token-js=')
  );
  
  if (!csrfCookie) return null;
  
  const token = csrfCookie.split('=')[1];
  return token;
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
    
    // Wait for the token to be set
    await new Promise(resolve => setTimeout(resolve, 200));
    
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
    console.log('✅ CSRF token already exists');
    return; // Token already exists
  }
  
  // Make a GET request to any page to trigger CSRF token generation via middleware
  try {
    console.log('🔄 Initializing CSRF protection...');
    await fetch('/api/test-csrf', {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-cache'
    });
    
    // Wait for the cookie to be set
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify token was set
    if (validateCSRFToken()) {
      console.log('✅ CSRF token initialized successfully');
    } else {
      console.warn('⚠️ CSRF token was not set after initialization request');
    }
  } catch (error) {
    console.warn('Failed to initialize CSRF protection:', error);
  }
}

/**
 * Test CSRF functionality - call this in browser console
 */
export async function testCSRF() {
  console.log('🔧 Testing CSRF functionality...');
  
  // Step 1: Check current cookies
  console.log('1. Current cookies:', document.cookie);
  
  // Step 2: Check if we can get CSRF token
  const currentToken = getCSRFToken();
  console.log('2. Current CSRF token:', currentToken);
  
  // Step 3: Test if middleware is running by checking headers
  try {
    const testResponse = await fetch('/api/test-csrf', {
      method: 'GET',
      credentials: 'same-origin'
    });
    
    const middlewareHeader = testResponse.headers.get('X-Middleware-Test');
    console.log('3. Middleware test header:', middlewareHeader);
    
    if (!middlewareHeader) {
      console.error('❌ MIDDLEWARE NOT RUNNING! Check server console for errors.');
      return;
    } else {
      console.log('✅ Middleware is running');
    }
    
    // Check if cookies were set
    console.log('4. Cookies after middleware request:', document.cookie);
    
  } catch (error) {
    console.error('Error testing middleware:', error);
    return;
  }
  
  // Step 4: Initialize CSRF protection
  console.log('5. Initializing CSRF protection...');
  await initializeCSRFProtection();
  
  // Step 5: Check token after initialization
  const newToken = getCSRFToken();
  console.log('6. Token after initialization:', newToken);
  
  // Step 6: Test API call
  try {
    console.log('7. Testing API call...');
    const response = await fetch('/api/test-csrf', {
      method: 'GET',
      credentials: 'same-origin'
    });
    const data = await response.json();
    console.log('8. GET response:', data);
    
    // Step 7: Test POST with CSRF
    if (newToken) {
      console.log('9. Testing POST with CSRF token...');
      const postResponse = await secureFetch('/api/test-csrf', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' })
      });
      const postData = await postResponse.json();
      console.log('10. POST response:', postData);
      
      if (postData.tokensMatch) {
        console.log('✅ CSRF implementation working correctly!');
      } else {
        console.error('❌ CSRF token mismatch');
      }
    } else {
      console.error('❌ No token available for POST test');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).testCSRF = testCSRF;
} 
