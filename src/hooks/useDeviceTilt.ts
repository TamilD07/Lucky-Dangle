import { useState, useEffect, useCallback } from 'react';

export function useDeviceTilt() {
  const [tiltX, setTiltX] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasOrientation = 'DeviceOrientationEvent' in window;
    setIsSupported(hasOrientation);

    // On non-iOS devices, DeviceOrientationEvent usually works without explicit requestPermission
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null) {
        // gamma is left-to-right tilt in degrees [-90, 90]
        // Normalize and clamp between -8 and +8 for gentle natural sway
        const normalized = Math.max(-8, Math.min(8, e.gamma * 0.25));
        setTiltX(normalized);
      }
    };

    // Check if permission is needed (iOS 13+)
    const orientationEvent = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (orientationEvent && typeof orientationEvent.requestPermission === 'function') {
      // iOS requires user gesture to grant permission
      setHasPermission(false);
    } else if (hasOrientation) {
      setHasPermission(true);
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  const requestOrientationPermission = useCallback(async () => {
    const orientationEvent = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (orientationEvent && typeof orientationEvent.requestPermission === 'function') {
      try {
        const response = await orientationEvent.requestPermission();
        if (response === 'granted') {
          setHasPermission(true);
          const handleOrientation = (e: DeviceOrientationEvent) => {
            if (e.gamma !== null) {
              const normalized = Math.max(-8, Math.min(8, e.gamma * 0.25));
              setTiltX(normalized);
            }
          };
          window.addEventListener('deviceorientation', handleOrientation, true);
          return true;
        }
      } catch (err) {
        console.warn('Device orientation permission error:', err);
      }
    }
    return false;
  }, []);

  return {
    tiltX,
    isSupported,
    hasPermission,
    requestOrientationPermission,
    setManualTilt: setTiltX,
  };
}
