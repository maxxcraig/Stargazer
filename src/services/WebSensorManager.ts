// Web-based sensor management using browser APIs
export interface DeviceOrientation {
  alpha: number; // Z-axis rotation (compass)
  beta: number;  // X-axis rotation (front-to-back tilt)
  gamma: number; // Y-axis rotation (left-to-right tilt)
}

export interface GeolocationCoords {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
}

export class WebSensorManager {
  private static instance: WebSensorManager;
  private orientationListeners: ((orientation: DeviceOrientation) => void)[] = [];
  private locationListeners: ((location: GeolocationCoords) => void)[] = [];
  
  private currentOrientation: DeviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
  private currentLocation: GeolocationCoords | null = null;
  
  private orientationSupported = false;
  private locationSupported = false;
  private permissionsGranted = false;

  private constructor() {}

  public static getInstance(): WebSensorManager {
    if (!WebSensorManager.instance) {
      WebSensorManager.instance = new WebSensorManager();
    }
    return WebSensorManager.instance;
  }

  /**
   * Initialize sensor access and request permissions
   */
  public async initialize(): Promise<void> {
    try {
      // Check for DeviceOrientationEvent support
      this.orientationSupported = 'DeviceOrientationEvent' in window;
      
      // Check for Geolocation support
      this.locationSupported = 'geolocation' in navigator;

      if (!this.orientationSupported) {
        throw new Error('Device orientation not supported on this device/browser');
      }

      if (!this.locationSupported) {
        throw new Error('Geolocation not supported on this device/browser');
      }

      // Request device orientation permission (iOS 13+)
      await this.requestOrientationPermission();
      
      // Start listening to orientation changes
      this.startOrientationTracking();
      
      // Get initial location
      await this.fetchCurrentLocation();
      
      this.permissionsGranted = true;
      console.log('WebSensorManager initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize WebSensorManager:', error);
      throw error;
    }
  }

  /**
   * Request permission for device orientation (required on iOS 13+)
   */
  private async requestOrientationPermission(): Promise<void> {
    // Check if permission request is needed (iOS Safari 13+)
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission !== 'granted') {
          throw new Error('Device orientation permission denied');
        }
      } catch (error) {
        throw new Error('Failed to request device orientation permission');
      }
    }
  }

  /**
   * Start tracking device orientation
   */
  private startOrientationTracking(): void {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      this.currentOrientation = {
        alpha: event.alpha || 0,  // Compass heading
        beta: event.beta || 0,    // Front-to-back tilt
        gamma: event.gamma || 0   // Left-to-right tilt
      };

      // Notify all listeners
      this.orientationListeners.forEach(listener => {
        listener(this.currentOrientation);
      });
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
  }

  /**
   * Get current device location
   */
  private async fetchCurrentLocation(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.locationSupported) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // Accept cached location if less than 1 minute old
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            accuracy: position.coords.accuracy
          };

          // Notify listeners
          this.locationListeners.forEach(listener => {
            if (this.currentLocation) {
              listener(this.currentLocation);
            }
          });

          resolve();
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        options
      );

      // Watch for location changes
      navigator.geolocation.watchPosition(
        (position) => {
          this.currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            accuracy: position.coords.accuracy
          };

          this.locationListeners.forEach(listener => {
            if (this.currentLocation) {
              listener(this.currentLocation);
            }
          });
        },
        (error) => {
          console.warn('Location watch error:', error);
        },
        {
          ...options,
          timeout: 30000 // Longer timeout for watch
        }
      );
    });
  }

  /**
   * Add orientation change listener
   */
  public addOrientationListener(listener: (orientation: DeviceOrientation) => void): void {
    this.orientationListeners.push(listener);
  }

  /**
   * Remove orientation change listener
   */
  public removeOrientationListener(listener: (orientation: DeviceOrientation) => void): void {
    const index = this.orientationListeners.indexOf(listener);
    if (index > -1) {
      this.orientationListeners.splice(index, 1);
    }
  }

  /**
   * Add location change listener
   */
  public addLocationListener(listener: (location: GeolocationCoords) => void): void {
    this.locationListeners.push(listener);
  }

  /**
   * Remove location change listener
   */
  public removeLocationListener(listener: (location: GeolocationCoords) => void): void {
    const index = this.locationListeners.indexOf(listener);
    if (index > -1) {
      this.locationListeners.splice(index, 1);
    }
  }

  /**
   * Get current orientation
   */
  public getCurrentOrientation(): DeviceOrientation {
    return { ...this.currentOrientation };
  }

  /**
   * Get current location
   */
  public getCurrentLocation(): GeolocationCoords | null {
    return this.currentLocation ? { ...this.currentLocation } : null;
  }

  /**
   * Check if all sensors are available and permissions granted
   */
  public isReady(): boolean {
    return this.permissionsGranted && this.orientationSupported && this.locationSupported;
  }

  /**
   * Get capability information
   */
  public getCapabilities(): {
    orientationSupported: boolean;
    locationSupported: boolean;
    permissionsGranted: boolean;
  } {
    return {
      orientationSupported: this.orientationSupported,
      locationSupported: this.locationSupported,
      permissionsGranted: this.permissionsGranted
    };
  }

  /**
   * Convert device orientation to compass heading
   */
  public getCompassHeading(): number {
    // Alpha gives compass heading (0-360 degrees)
    // 0/360 = North, 90 = East, 180 = South, 270 = West
    return this.currentOrientation.alpha;
  }

  /**
   * Get device tilt angles
   */
  public getTiltAngles(): { pitch: number; roll: number } {
    return {
      pitch: this.currentOrientation.beta,  // Forward/backward tilt
      roll: this.currentOrientation.gamma   // Left/right tilt
    };
  }

  /**
   * Calculate viewing direction vector
   */
  public getViewingDirection(): { azimuth: number; altitude: number } {
    const { alpha, beta, gamma } = this.currentOrientation;
    
    // Convert device orientation to celestial coordinates
    // This is a simplified calculation - in practice, you'd want more sophisticated
    // coordinate transformations accounting for device orientation and screen rotation
    
    const azimuth = alpha; // Compass heading
    const altitude = -beta; // Negative because positive beta is looking down
    
    return { azimuth, altitude };
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.orientationListeners = [];
    this.locationListeners = [];
    // Note: Cannot easily remove deviceorientation listener without reference
    // In practice, you'd store the listener reference to remove it properly
  }
}