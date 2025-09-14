/**
 * Cookie utility functions for authentication
 */

/**
 * Removes all Supabase auth token cookies
 * This function removes cookies that match the pattern sb-<id>-auth-token
 */
export const removeSupabaseAuthCookies = (): void => {
  if (typeof document === 'undefined') {
    // Server-side environment, cannot access document.cookie
    return;
  }

  // Get all cookies
  const cookies = document.cookie.split(';');
  
  // Find and remove all sb-*-auth-token cookies
  cookies.forEach((cookie) => {
    const cookieParts = cookie.trim().split('=');
    const cookieName = cookieParts[0];
    
    // Check if cookie matches the Supabase auth token pattern
    if (cookieName.match(/^sb-.+-auth-token$/)) {
      // Remove the cookie by setting it to expire in the past
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      
      // Also try removing from parent domains
      const domainParts = window.location.hostname.split('.');
      if (domainParts.length > 1) {
        const parentDomain = '.' + domainParts.slice(1).join('.');
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${parentDomain}`;
      }
      
      console.log(`Removed Supabase auth cookie: ${cookieName}`);
    }
  });
};

/**
 * Removes a specific cookie by name
 */
export const removeCookie = (name: string): void => {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  
  // Also try removing from parent domains
  const domainParts = window.location.hostname.split('.');
  if (domainParts.length > 1) {
    const parentDomain = '.' + domainParts.slice(1).join('.');
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${parentDomain}`;
  }
};