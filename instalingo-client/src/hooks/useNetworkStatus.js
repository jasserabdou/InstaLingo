import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = useState('unknown');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkConnectionQuality();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setConnectionQuality('offline');
    };

    const checkConnectionQuality = async () => {
      try {
        if (!navigator.onLine) {
          setConnectionQuality('offline');
          return;
        }

        const start = Date.now();
        const response = await fetch('/api/ping', { 
          method: 'GET',
          cache: 'no-cache',
        });
        
        if (response.ok) {
          const duration = Date.now() - start;
          
          if (duration < 300) {
            setConnectionQuality('excellent');
          } else if (duration < 1000) {
            setConnectionQuality('good');
          } else if (duration < 3000) {
            setConnectionQuality('fair');
          } else {
            setConnectionQuality('poor');
          }
        } else {
          setConnectionQuality('unstable');
        }
      } catch (error) {
        setConnectionQuality(navigator.onLine ? 'unstable' : 'offline');
      }
    };

    // Initial check
    checkConnectionQuality();
    
    // Set up regular quality checks
    const intervalId = setInterval(checkConnectionQuality, 60000); // Check every minute
    
    // Event listeners for network status changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connectionQuality };
};
