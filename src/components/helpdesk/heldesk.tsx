'use client';

import { useEffect } from 'react';

import { useAuthContext } from 'src/auth/hooks';

export default function Helpdesk() {
  const { user, authenticated } = useAuthContext();

  useEffect(() => {
    // Initialize Tawk_API
    if (typeof window !== 'undefined') {
      (window as any).Tawk_API = (window as any).Tawk_API || {};
      (window as any).Tawk_LoadStart = new Date();

      // Load Tawk.to script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://embed.tawk.to/68e443c2c72178194fdadc5a/1j6tqhcnd';
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode?.insertBefore(script, firstScript);

      // Set user attributes when Tawk is loaded and user is authenticated
      script.onload = () => {
        if (authenticated && user) {
          const tawkAPI = (window as any).Tawk_API;
          
          // Set visitor attributes
          tawkAPI.setAttributes(
            {
              name: user.displayName || user.name || user.email || 'Guest',
              email: user.email || '',
              id: user.id || user.uid || '',
            },
            (error: any) => {
              if (error) {
                console.error('Error setting Tawk.to attributes:', error);
              }
            }
          );
        }
      };

      // Cleanup function to remove script on unmount
      return () => {
        script.remove();
      };
    }

    return undefined;
  }, [user, authenticated]);

  return null; // This component doesn't render any visible UI
}