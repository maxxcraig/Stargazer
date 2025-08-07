import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { WebSensorManager, DeviceOrientation, GeolocationCoords } from '../services/WebSensorManager';
import { StarCatalogService, Star, Planet } from '../services/StarCatalogService';

interface ARStargazerProps {
  onError?: (error: string) => void;
  onStarClick?: (star: Star) => void;
  onPlanetClick?: (planet: Planet) => void;
}

export const ARStargazer: React.FC<ARStargazerProps> = ({ onError, onStarClick, onPlanetClick }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starCount, setStarCount] = useState(0);
  const [constellationCount, setConstellationCount] = useState(0);
  const [planetCount, setPlanetCount] = useState(0);
  const [deviceOrientation, setDeviceOrientation] = useState<DeviceOrientation | null>(null);
  const [location, setLocation] = useState<GeolocationCoords | null>(null);
  const [isDesktopMode] = useState(true); // Desktop mode for web deployment
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [cameraRotation, setCameraRotation] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<'requesting' | 'active' | 'failed' | 'none'>('none');
  
  // Store stream temporarily if video element isn't ready
  const pendingStreamRef = useRef<MediaStream | null>(null);

  // Services
  const sensorManagerRef = useRef<WebSensorManager | null>(null);
  const starCatalogRef = useRef<StarCatalogService | null>(null);
  
  // Star objects for Three.js
  const starObjectsRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const labelObjectsRef = useRef<Map<string, THREE.Sprite>>(new Map());
  const constellationLinesRef = useRef<THREE.Group>(new THREE.Group());
  const constellationLabelsRef = useRef<Map<string, THREE.Sprite>>(new Map());
  
  // Planet objects for Three.js
  const planetObjectsRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const planetLabelObjectsRef = useRef<Map<string, THREE.Sprite>>(new Map());

  /**
   * Initialize camera access
   */
  const initializeCamera = useCallback(async () => {
    try {
      setCameraStatus('requesting');
      console.log('🎥 === CAMERA INITIALIZATION STARTED ===');
      
      // Check if getUserMedia is available
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported by this browser');
      }
      
      
      
      // First try with back camera
      let constraints = {
        video: { 
          facingMode: { ideal: 'environment' }, // Prefer back camera but allow front
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
      } catch (backCameraError) {
        // Fallback to front camera or any available camera
        constraints = {
          video: {
            facingMode: { ideal: 'user' }, // Front camera fallback
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (frontCameraError) {
          // Try basic constraints as last resort
          const basicConstraints = { video: true };
          stream = await navigator.mediaDevices.getUserMedia(basicConstraints);
        }
      }
      
      if (!videoRef.current) {
        // Wait for video element to be available with retry logic
        let retries = 0;
        const maxRetries = 10;
        const waitForVideoElement = () => {
          return new Promise<void>((resolve, reject) => {
            const checkElement = () => {
              if (videoRef.current) {
                resolve();
              } else if (retries < maxRetries) {
                retries++;
                setTimeout(checkElement, 100);
              } else {
                reject(new Error('Video element never became available'));
              }
            };
            checkElement();
          });
        };
        
        try {
          await waitForVideoElement();
        } catch (waitError) {
          // Store the stream and try to connect it later when video element is ready
          pendingStreamRef.current = stream;
          streamRef.current = stream;
          return; // Exit early, will try to connect later
        }
      }
      
      if (!stream) {
        setCameraStatus('failed');
        return;
      }
      
      // Check for existing srcObject before assignment (cleanup)
      if (videoRef.current && videoRef.current.srcObject) {
        const existingStream = videoRef.current.srcObject as MediaStream;
        existingStream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      
      // Add comprehensive event listeners
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = () => {
          setCameraStatus('active');
        };
        
        videoRef.current.onplay = () => {
          setCameraStatus('active');
        };

        videoRef.current.onerror = (e) => {
          setCameraStatus('failed');
        };
        
        // Ensure video is visible
        if (videoRef.current.style) {
          videoRef.current.style.visibility = 'visible';
          videoRef.current.style.opacity = '1';
        }
      }
      
      if (videoRef.current) {
        try {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
        } catch (playError) {
          // Try alternative play approaches
          if (videoRef.current) {
            videoRef.current.autoplay = true;
            videoRef.current.muted = true;
            videoRef.current.playsInline = true;
            
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.play().catch(e => {});
              }
            }, 100);
          }
        }
      }
      
      // Only set streamRef if we successfully connected to video element
      if (videoRef.current && videoRef.current.srcObject) {
        streamRef.current = stream;
      }
      
    } catch (err) {
      // Check for CSP-related errors
      if (err instanceof Error) {
        if (err.message.includes('Content Security Policy') || 
            err.message.includes('CSP') ||
            err.message.includes('mediastream') ||
            err.name === 'SecurityError') {
          setError('Camera blocked by security policy. This may be a deployment configuration issue.');
        } else {
          setError(`Camera failed: ${err.message}. Check browser permissions and console for details.`);
        }
      } else {
        setError('Camera initialization failed with unknown error. Check console for details.');
      }
      
      setCameraStatus('failed');
    }
  }, []);

  /**
   * Initialize the AR stargazer
   */
  const initializeARStargazer = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Initialize camera
      await initializeCamera();

      // Initialize services
      sensorManagerRef.current = WebSensorManager.getInstance();
      starCatalogRef.current = StarCatalogService.getInstance();

      // Force desktop mode for testing - try to get user's location
      console.log('🚀 STARTING in desktop mode for testing');
      
      // Try to get user's actual location first
      if (navigator.geolocation) {
        console.log('📍 Attempting to get your actual location...');
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            };
            console.log('📍 Got your actual location:', userLocation);
            setLocation(userLocation);
            updateStarField(userLocation);
          },
          (error) => {
            console.log('📍 Location access denied or failed, using San Diego default:', error.message);
            const defaultLocation = { latitude: 32.7157, longitude: -117.1611, accuracy: 1000 }; // San Diego, CA
            setLocation(defaultLocation);
            console.log('📍 Using default location for desktop mode:', defaultLocation);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      } else {
        console.log('📍 Geolocation not supported, using San Diego default');
        const defaultLocation = { latitude: 32.7157, longitude: -117.1611, accuracy: 1000 }; // San Diego, CA
        setLocation(defaultLocation);
        console.log('📍 Using default location for desktop mode:', defaultLocation);
      }
      
      // Set initial orientation for desktop mode
      const initialOrientation = { alpha: 0, beta: 0, gamma: 0 };
      setDeviceOrientation(initialOrientation);

      await starCatalogRef.current.initialize();
      setupThreeJS();

      // Skip sensor setup in desktop mode
      
      // Location will be set by geolocation callback or fallback, 
      // updateStarField will be called from setLocation

      setIsInitialized(true);
      setIsLoading(false);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown initialization error';
      setError(errorMessage);
      setIsLoading(false);
      onError?.(errorMessage);
    }
  }, [onError, initializeCamera]);

  // Move this useEffect after updateStarField is defined

  /**
   * Set up Three.js scene, camera, and renderer
   */
  const setupThreeJS = useCallback(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    // Don't set background color - let camera video show through
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, -1); // Look towards negative Z (where some stars are)
    cameraRef.current = camera;
    console.log('📷 Camera created and positioned at (0,0,0) looking at (0,0,-1)');
    console.log('🎯 Camera ref set:', !!cameraRef.current);

    // Renderer with transparency for AR overlay
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Add constellation lines group to scene
    scene.add(constellationLinesRef.current);
    
    // Test star removed - stars are working now!

    // Add renderer to DOM and make sure it's visible
    renderer.domElement.style.pointerEvents = 'auto';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    mountRef.current.appendChild(renderer.domElement);
    
    console.log('🎨 Three.js renderer added to DOM:', {
      width,
      height,
      canvasId: renderer.domElement.id,
      transparent: renderer.domElement.style.background
    });

    // Start render loop
    animate();

  }, []);

  /**
   * Handle device orientation changes
   */
  const handleOrientationChange = useCallback((orientation: DeviceOrientation) => {
    setDeviceOrientation(orientation);
    updateCameraOrientation(orientation);
  }, []);

  /**
   * Handle location changes
   */
  const handleLocationChange = useCallback((newLocation: GeolocationCoords) => {
    setLocation(newLocation);
    updateStarField(newLocation);
  }, []);

  /**
   * Update camera orientation based on device sensors
   */
  const updateCameraOrientation = useCallback((orientation: DeviceOrientation) => {
    if (!cameraRef.current) return;

    // Convert device orientation to camera rotation
    // Note: This is a simplified conversion - in practice, you'd want more
    // sophisticated coordinate transformations
    const { alpha, beta, gamma } = orientation;

    // Convert degrees to radians
    const alphaRad = (alpha * Math.PI) / 180;
    const betaRad = (beta * Math.PI) / 180;
    const gammaRad = (gamma * Math.PI) / 180;

    // Apply rotations to camera
    cameraRef.current.rotation.set(betaRad, alphaRad, gammaRad);
  }, []);

  /**
   * Update star field based on location and time - SIMPLIFIED VERSION
   */
  const updateStarField = useCallback((currentLocation: GeolocationCoords) => {
    if (!starCatalogRef.current || !sceneRef.current) return;

    try {
      // Clear existing stars, planets and constellation lines
      starObjectsRef.current.forEach(star => {
        sceneRef.current?.remove(star);
      });
      labelObjectsRef.current.forEach(label => {
        sceneRef.current?.remove(label);
      });
      planetObjectsRef.current.forEach(planet => {
        sceneRef.current?.remove(planet);
      });
      planetLabelObjectsRef.current.forEach(label => {
        sceneRef.current?.remove(label);
      });
      starObjectsRef.current.clear();
      labelObjectsRef.current.clear();
      planetObjectsRef.current.clear();
      planetLabelObjectsRef.current.clear();
      
      // Clear constellation lines and labels
      constellationLinesRef.current.clear();
      constellationLabelsRef.current.forEach(label => {
        sceneRef.current?.remove(label);
      });
      constellationLabelsRef.current.clear();

      // Get all stars from catalog - simplified approach
      const allStars = Array.from(starCatalogRef.current['stars'].values());
      
      // Create simplified star placement - just put them around us in a sphere
      allStars.forEach((star, index) => {
        createSimplifiedStarObject(star, index);
      });

      // Create planets and sun
      const planets = starCatalogRef.current.getPlanets();
      planets.forEach((planet, index) => {
        // Skip Earth since we're observing from Earth
        if (planet.id !== 'earth') {
          createPlanetObject(planet, currentLocation, index);
        }
      });

      // Create constellation lines and labels
      const constellations = starCatalogRef.current.getConstellations();
      createConstellationLines();
      createConstellationLabels();

      setStarCount(allStars.length);
      setConstellationCount(constellations.length);
      setPlanetCount(planets.length);
      
      console.log(`Created ${allStars.length} stars, ${planets.length} planets, and ${constellations.length} constellations in simplified layout`);

    } catch (err) {
      console.error('Error updating star field:', err);
    }
  }, []);

  /**
   * Update star field when location changes
   */
  useEffect(() => {
    if (location && isInitialized) {
      console.log('📍 Location changed, updating star field...');
      setTimeout(() => {
        updateStarField(location);
      }, 100);
    }
  }, [location, isInitialized, updateStarField]);

  /**
   * Create a simplified star object - IMPROVED VISIBILITY
   */
  const createSimplifiedStarObject = useCallback((star: Star, index: number) => {
    if (!sceneRef.current) return;

    // Use actual star coordinates for proper constellation positioning
    const distance = 100; // Realistic distance for sky dome
    
    // Convert RA/Dec to Cartesian coordinates
    const raRad = (star.ra * Math.PI) / 180;
    const decRad = (star.dec * Math.PI) / 180;
    
    const x = distance * Math.cos(decRad) * Math.cos(raRad);
    const y = distance * Math.sin(decRad);
    const z = -distance * Math.cos(decRad) * Math.sin(raRad);

    // Realistic star sizes like SkyView Lite
    const starSize = getStarSize(star.magnitude);
    
    // Right-sized white stars 
    const geometry = new THREE.SphereGeometry(Math.max(starSize * 2.5, 2.0), 8, 6); // Much smaller but still visible
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xffffff, // White stars 
      transparent: false,
      opacity: 1.0,
    });

    const starMesh = new THREE.Mesh(geometry, material);
    starMesh.position.set(x, y, z);
    starMesh.userData = { star, type: 'star' };

    // Only add bright glow for very bright stars
    if (star.magnitude < 1.5) {
      const glowGeometry = new THREE.SphereGeometry(starSize * 2.5, 8, 6);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff, // Bright white glow too
        transparent: true,
        opacity: 0.4 // Brighter glow
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      glowMesh.position.copy(starMesh.position);
      sceneRef.current.add(glowMesh);
    }

    sceneRef.current.add(starMesh);
    starObjectsRef.current.set(star.id, starMesh);
    
    // Check if star is in front of camera (negative Z)
    const inView = z < 0 ? '✅ IN VIEW' : '❌ BEHIND CAMERA';
    const distanceFromOrigin = Math.sqrt(x*x + y*y + z*z);
    console.log(`⭐ ADDED STAR ${star.name} at (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}) - size: ${starSize.toFixed(2)} - distance: ${distanceFromOrigin.toFixed(1)} - ${inView}`);
    
    // Add debug info about camera looking direction vs star position
    const starDirection = { x, y, z };
    const cameraDirection = { x: 0, y: 0, z: -1 }; // Camera looks toward -Z
    console.log(`🎯 ${star.name}: Camera looks at ${JSON.stringify(cameraDirection)}, star at ${JSON.stringify(starDirection)}`);

    // Create label for bright stars only (like SkyView Lite)
    if (star.magnitude < 2.0) {
      createStarLabel(star, starMesh.position);
    }
  }, []);

  /**
   * Create constellation lines connecting stars
   */
  const createConstellationLines = useCallback(() => {
    if (!starCatalogRef.current || !sceneRef.current) return;

    try {
      // Get all constellations from the catalog
      const constellations = starCatalogRef.current.getConstellations();
      console.log(`Creating constellation lines for ${constellations.length} constellations`);

      constellations.forEach(constellation => {
        constellation.lines.forEach(line => {
          const fromStar = starObjectsRef.current.get(line.from);
          const toStar = starObjectsRef.current.get(line.to);

          if (fromStar && toStar) {
            // Create line geometry
            const geometry = new THREE.BufferGeometry().setFromPoints([
              fromStar.position,
              toStar.position
            ]);

            // Create line material - subtle white lines
            const material = new THREE.LineBasicMaterial({
              color: 0xffffff,
              opacity: 0.4,
              transparent: true,
              linewidth: 1
            });

            // Create line mesh
            const lineMesh = new THREE.Line(geometry, material);
            constellationLinesRef.current.add(lineMesh);

            console.log(`✨ Added constellation line: ${line.from} → ${line.to} in ${constellation.name}`);
          } else {
            console.log(`⚠️ Could not find stars for line: ${line.from} → ${line.to} in ${constellation.name}`);
          }
        });
      });

      console.log(`✅ Created constellation lines for ${constellations.length} constellations`);

    } catch (error) {
      console.error('Error creating constellation lines:', error);
    }
  }, []);

  /**
   * Create constellation name labels positioned at the center of each constellation
   */
  const createConstellationLabels = useCallback(() => {
    if (!starCatalogRef.current || !sceneRef.current) return;

    try {
      const constellations = starCatalogRef.current.getConstellations();
      console.log(`Creating constellation labels for ${constellations.length} constellations`);

      constellations.forEach(constellation => {
        console.log(`Processing constellation: ${constellation.name} with ${constellation.stars.length} stars`);
        
        // Skip constellations without stars or with only one star
        if (constellation.stars.length < 2) {
          console.log(`Skipping ${constellation.name} - not enough stars`);
          return;
        }

        // Calculate center position of constellation based on its stars
        let centerX = 0, centerY = 0, centerZ = 0;
        let validStars = 0;

        constellation.stars.forEach(starId => {
          const starObject = starObjectsRef.current.get(starId);
          if (starObject) {
            centerX += starObject.position.x;
            centerY += starObject.position.y;
            centerZ += starObject.position.z;
            validStars++;
          } else {
            console.log(`Missing star object for ${starId} in ${constellation.name}`);
          }
        });

        console.log(`${constellation.name}: Found ${validStars}/${constellation.stars.length} stars`);
        if (validStars < 2) {
          console.log(`Skipping ${constellation.name} - need at least 2 valid stars, found ${validStars}`);
          return;
        }

        // Calculate average position
        centerX /= validStars;
        centerY /= validStars;
        centerZ /= validStars;

        // Create label text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;

        // Set canvas size for constellation names (larger than star labels)
        canvas.width = 768;
        canvas.height = 192;

        // Configure text style for constellation names
        context.font = 'bold 72px Arial, sans-serif';
        context.fillStyle = '#FFD700'; // Gold color for constellation names
        context.strokeStyle = '#000000';
        context.lineWidth = 3;
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        // Draw constellation name
        const text = constellation.name;
        context.strokeText(text, canvas.width / 2, canvas.height / 2);
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        // Create sprite
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        const spriteMaterial = new THREE.SpriteMaterial({ 
          map: texture,
          transparent: true,
          opacity: 0.9
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        
        // Position sprite at constellation center
        sprite.position.set(centerX, centerY, centerZ);
        
        // Scale constellation labels larger than star labels
        const distance = Math.sqrt(centerX * centerX + centerY * centerY + centerZ * centerZ);
        const scale = Math.max(1.2, distance * 0.25); // Much larger scale for constellation names
        sprite.scale.set(scale, scale * 0.25, 1); // Keep aspect ratio

        // Add to scene
        if (sceneRef.current) {
          sceneRef.current.add(sprite);
          constellationLabelsRef.current.set(constellation.id, sprite);
        }

        console.log(`✨ Added constellation label: ${constellation.name} at center position`);
      });

      console.log(`✅ Created ${constellationLabelsRef.current.size} constellation labels`);

    } catch (error) {
      console.error('Error creating constellation labels:', error);
    }
  }, []);

  /**
   * Create a text label for a star - SkyView Lite style
   */
  const createStarLabel = useCallback((star: Star, position: THREE.Vector3) => {
    if (!sceneRef.current) return;

    // Create canvas for text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = 1024;
    canvas.height = 256;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw text with outline for visibility - MASSIVE SIZE
    context.font = 'bold 64px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    const labelText = star.commonName || star.name;
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    
    // Black outline - very thick
    context.strokeStyle = 'rgba(0, 0, 0, 1.0)';
    context.lineWidth = 12;
    context.strokeText(labelText, x, y);
    
    // Bright white text
    context.fillStyle = 'rgba(255, 255, 255, 1.0)';
    context.fillText(labelText, x, y);

    // Create texture and sprite
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true,
      alphaTest: 0.1
    });
    const sprite = new THREE.Sprite(spriteMaterial);

    // Position label close to star - MASSIVE LABELS
    sprite.position.copy(position);
    sprite.position.x += 8; // Even larger offset to the right
    sprite.position.y += 8; // Even larger offset up
    sprite.scale.set(40, 12, 1); // MASSIVE labels - 2x bigger

    sceneRef.current.add(sprite);
    labelObjectsRef.current.set(star.id, sprite);
    console.log(`Added SkyView-style label for ${star.name}`);
  }, []);

  /**
   * Create a planet or sun object with accurate positioning
   */
  const createPlanetObject = useCallback((planet: Planet, location: GeolocationCoords, index: number) => {
    if (!sceneRef.current || !starCatalogRef.current) {
      console.log(`❌ ${planet.name}: Missing scene or catalog reference`);
      return;
    }

    console.log(`🚀 CREATING PLANET: ${planet.name} (${planet.id}) - Type: ${planet.type}, Color: ${planet.color.toString(16)}, Radius: ${planet.radius}`);

    try {
      // Calculate current position of the planet
      const currentTime = new Date();
      console.log(`📐 Calculating position for ${planet.name} at ${currentTime.toLocaleString()}...`);
      const planetPosition = starCatalogRef.current.calculatePlanetPosition(planet, currentTime);
      console.log(`📍 ${planet.name} celestial coordinates: RA ${planetPosition.ra.toFixed(2)}°, Dec ${planetPosition.dec.toFixed(2)}°`);
      
      const horizontal = starCatalogRef.current.celestialToHorizontal(planetPosition, location, currentTime);
      console.log(`🧭 ${planet.name} horizontal coordinates: Az ${horizontal.azimuth.toFixed(1)}°, Alt ${horizontal.altitude.toFixed(1)}°`);

      // Real astronomical positioning - show ALL planets in full 360° celestial sphere
      // No horizon filtering! Users can drag to see Sun below horizon at night
      console.log(`🌍 ${planet.name} positioned in full sky sphere (alt: ${horizontal.altitude.toFixed(1)}°) - ${horizontal.altitude < 0 ? 'below horizon (drag down to see)' : 'above horizon'}`);
      
      // Always render all planets for full 360° experience

      // Convert horizontal coordinates to 3D position
      const distance = 150; // Distance for sky dome
      const azimuthRad = (horizontal.azimuth * Math.PI) / 180;
      const altitudeRad = (horizontal.altitude * Math.PI) / 180;

      const x = distance * Math.cos(altitudeRad) * Math.sin(azimuthRad);
      const y = distance * Math.sin(altitudeRad);
      const z = -distance * Math.cos(altitudeRad) * Math.cos(azimuthRad);

      // Create planet geometry with appropriate size - keep slightly smaller
      const geometry = new THREE.SphereGeometry(planet.radius * 0.9, 12, 8);
      const material = new THREE.MeshBasicMaterial({ 
        color: planet.color,
        transparent: false,
        opacity: 1.0
      });

      const planetMesh = new THREE.Mesh(geometry, material);
      planetMesh.position.set(x, y, z);
      planetMesh.userData = { planet, type: 'planet' };

      // Add bright glow for the sun and Jupiter
      if (planet.type === 'sun') {
        const glowGeometry = new THREE.SphereGeometry(planet.radius * 2.0, 12, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: 0xFFD700,
          transparent: true,
          opacity: 0.4 // Brighter glow for Sun
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        glowMesh.position.copy(planetMesh.position);
        sceneRef.current.add(glowMesh);
      }

      // Add glow for Jupiter to make it more visible
      if (planet.id === 'jupiter') {
        const glowGeometry = new THREE.SphereGeometry(planet.radius * 1.3, 12, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: 0x800080,
          transparent: true,
          opacity: 0.3
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        glowMesh.position.copy(planetMesh.position);
        sceneRef.current.add(glowMesh);
      }

      // Add rings for Saturn
      if (planet.id === 'saturn') {
        const ringGeometry = new THREE.RingGeometry(planet.radius * 1.3, planet.radius * 2.2, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0xDDDDDD,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide
        });
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringMesh.position.copy(planetMesh.position);
        // Rotate rings to be more visible
        ringMesh.rotation.x = Math.PI / 2 + 0.4; // Slight tilt
        sceneRef.current.add(ringMesh);
      }

      console.log(`🎨 Creating 3D mesh for ${planet.name} with geometry radius ${planet.radius} and color 0x${planet.color.toString(16)}`);
      
      sceneRef.current.add(planetMesh);
      planetObjectsRef.current.set(planet.id, planetMesh);
      
      console.log(`✅ ${planet.name} mesh added to scene at position (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})`);
      console.log(`📋 Planet objects map now contains ${planetObjectsRef.current.size} planets`);

      // Special logging for Sun, Jupiter, Mercury
      const isImportantPlanet = planet.id === 'sun' || planet.id === 'jupiter' || planet.id === 'mercury';
      if (isImportantPlanet) {
        console.log(`🌟 IMPORTANT: ${planet.name.toUpperCase()} RENDERED at (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}) - Az: ${horizontal.azimuth.toFixed(1)}° Alt: ${horizontal.altitude.toFixed(1)}° - Look for ${planet.commonName}!`);
      } else {
        console.log(`🪐 ADDED ${planet.name} at (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}) - Az: ${horizontal.azimuth.toFixed(1)}° Alt: ${horizontal.altitude.toFixed(1)}°`);
      }

      // Create label for planet
      createPlanetLabel(planet, planetMesh.position);

    } catch (error) {
      console.error(`Error creating planet ${planet.name}:`, error);
    }
  }, []);

  /**
   * Create a label for a planet
   */
  const createPlanetLabel = useCallback((planet: Planet, position: THREE.Vector3) => {
    if (!sceneRef.current) return;

    // Create canvas for text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = 1024;
    canvas.height = 256;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw text with outline for visibility
    context.font = 'bold 56px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    const labelText = planet.commonName;
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    
    // Black outline
    context.strokeStyle = 'rgba(0, 0, 0, 1.0)';
    context.lineWidth = 10;
    context.strokeText(labelText, x, y);
    
    // Planet-specific color or white text
    const labelColor = planet.type === 'sun' ? '#FFD700' : '#FFFFFF';
    context.fillStyle = labelColor;
    context.fillText(labelText, x, y);

    // Create texture and sprite
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true,
      alphaTest: 0.1
    });
    const sprite = new THREE.Sprite(spriteMaterial);

    // Position label offset from planet towards camera and to the side
    const labelOffset = position.clone().normalize().multiplyScalar(-20); // Move towards camera
    sprite.position.copy(position);
    sprite.position.add(labelOffset);
    
    // Planet-specific offsets to avoid overlap with the planet itself
    let rightOffset = 12;
    let upOffset = 8;
    
    if (planet.id === 'jupiter') {
      rightOffset = 20; // Larger offset for Jupiter due to its size and glow
      upOffset = 15;
    } else if (planet.id === 'sun') {
      rightOffset = 25; // Even larger offset for the Sun due to its large size and glow
      upOffset = 20;
    } else if (planet.id === 'saturn') {
      rightOffset = 30; // Account for Saturn's rings
      upOffset = 12;
    } else if (planet.id === 'uranus') {
      rightOffset = 25;
      upOffset = 15;
    }
    
    sprite.position.x += rightOffset; // Additional offset to the right
    sprite.position.y += upOffset;    // Additional offset up
    sprite.scale.set(35, 10, 1); // Appropriate size for planets

    sceneRef.current.add(sprite);
    planetLabelObjectsRef.current.set(planet.id, sprite);
    console.log(`🪐 Added label for ${planet.name}`);
  }, []);

  /**
   * Get star size based on magnitude - TEMPORARY LARGE SIZES FOR DEBUGGING
   */
  const getStarSize = (magnitude: number): number => {
    // Make stars VERY visible for debugging
    if (magnitude < 0) return 2.0; // Very bright stars
    if (magnitude < 1) return 1.5; // Bright stars  
    if (magnitude < 2) return 1.2; // Medium-bright stars
    if (magnitude < 3) return 1.0; // Medium stars
    return 0.8; // Dim stars
  };



  /**
   * Animation loop - Simple and stable
   */
  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    // Debug: Log scene info periodically with star count
    if (frameRef.current && frameRef.current % 300 === 0) {
      const stars = starObjectsRef.current.size;
      const planets = planetObjectsRef.current.size;
      console.log(`🎬 Rendering scene with ${sceneRef.current.children.length} objects (${stars} stars, ${planets} planets)`);
      
      // Check if any stars are visible in camera frustum
      const cameraPos = cameraRef.current.position;
      const cameraRot = cameraRef.current.rotation;
      console.log(`📷 Camera: pos(${cameraPos.x.toFixed(1)}, ${cameraPos.y.toFixed(1)}, ${cameraPos.z.toFixed(1)}) rot(${cameraRot.x.toFixed(2)}, ${cameraRot.y.toFixed(2)}, ${cameraRot.z.toFixed(2)})`);
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    frameRef.current = requestAnimationFrame(animate);
  }, []);

  /**
   * Handle window resize
   */
  const handleResize = useCallback(() => {
    if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  }, []);

  /**
   * Handle mouse down - start dragging like SkyView Lite
   */
  const handleMouseDown = useCallback((event: MouseEvent) => {
    event.preventDefault();
    setIsDragging(true);
    setHasDragged(false);
    const pos = { x: event.clientX, y: event.clientY };
    setLastMousePos(pos);
  }, []);

  /**
   * Handle mouse move - drag to pan like SkyView Lite - UNLIMITED ROTATION
   */
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging) {
      return;
    }
    
    if (!cameraRef.current) {
      return;
    }

    const deltaX = event.clientX - lastMousePos.x;
    const deltaY = event.clientY - lastMousePos.y;

    // If we've moved more than 5 pixels, consider it a drag
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      setHasDragged(true);
    }

    // Sensitivity factor (like SkyView Lite)
    const sensitivity = 0.005;
    
    // Update camera rotation based on drag - REMOVE LIMITS for full 360° movement
    const newRotationY = cameraRotation.y - deltaX * sensitivity;
    const newRotationX = cameraRotation.x + deltaY * sensitivity; // No limits - full range

    setCameraRotation({ x: newRotationX, y: newRotationY });
    
    // Apply to camera immediately
    cameraRef.current.rotation.set(newRotationX, newRotationY, 0);
    
    // Update device orientation to reflect camera rotation for Az/Alt display
    const azimuth = (newRotationY * 180 / Math.PI) % 360;
    const altitude = -(newRotationX * 180 / Math.PI);
    setDeviceOrientation({
      alpha: azimuth < 0 ? azimuth + 360 : azimuth,
      beta: -altitude,
      gamma: 0
    });
    
    setLastMousePos({ x: event.clientX, y: event.clientY });
  }, [isDragging, lastMousePos, cameraRotation]);

  /**
   * Handle mouse up - stop dragging and check for click
   */
  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (isDragging) {
      setIsDragging(false);
      
      // If we haven't dragged much, treat it as a click
      if (!hasDragged) {
        // Inline click detection
        if (cameraRef.current && sceneRef.current) {
          const mouse = new THREE.Vector2();
          const rect = (event.target as HTMLElement).getBoundingClientRect();
          
          mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse, cameraRef.current);
          raycaster.params.Points.threshold = 2.0;

          const starObjects = Array.from(starObjectsRef.current.values());
          const planetObjects = Array.from(planetObjectsRef.current.values());
          const allObjects = [...starObjects, ...planetObjects];
          const intersects = raycaster.intersectObjects(allObjects);
          
          if (intersects.length > 0) {
            const userData = intersects[0].object.userData;
            if (userData.star) {
              onStarClick?.(userData.star);
            } else if (userData.planet) {
              onPlanetClick?.(userData.planet);
            }
          }
        }
      }
    }
  }, [isDragging, hasDragged, onStarClick]);

  /**
   * Handle click events for star selection - IMPROVED
   */
  const handleClick = useCallback((event: MouseEvent) => {
    if (!cameraRef.current || !sceneRef.current) return;

    const mouse = new THREE.Vector2();
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const starObjects = Array.from(starObjectsRef.current.values());
    const planetObjects = Array.from(planetObjectsRef.current.values());
    const allObjects = [...starObjects, ...planetObjects];
    
    // Make raycaster more generous for easier clicking
    raycaster.params.Points.threshold = 2.0;
    
    const intersects = raycaster.intersectObjects(allObjects);
    
    if (intersects.length > 0) {
      const userData = intersects[0].object.userData;
      if (userData.star) {
        onStarClick?.(userData.star);
      } else if (userData.planet) {
        onPlanetClick?.(userData.planet);
      }
    }
  }, [onStarClick, onPlanetClick]);

  // Initialize on mount
  useEffect(() => {
    // Add CSP violation listener for debugging
    const handleCSPViolation = (event: SecurityPolicyViolationEvent) => {
      if (event.violatedDirective.includes('media-src') || event.blockedURI.includes('mediastream:')) {
        setError('Camera blocked by Content Security Policy - deployment configuration issue');
        setCameraStatus('failed');
      }
    };
    
    document.addEventListener('securitypolicyviolation', handleCSPViolation);
    
    initializeARStargazer();

    return () => {
      // Cleanup
      document.removeEventListener('securitypolicyviolation', handleCSPViolation);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (sensorManagerRef.current) {
        sensorManagerRef.current?.removeOrientationListener(handleOrientationChange);
        sensorManagerRef.current?.removeLocationListener(handleLocationChange);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [initializeARStargazer, handleOrientationChange, handleLocationChange]);

  // Set up event listeners - SkyView Lite style drag controls
  useEffect(() => {
    // Add a delay to ensure mount element is ready
    const setupEventListeners = () => {
      window.addEventListener('resize', handleResize);
      window.addEventListener('mouseup', handleMouseUp);
      
      if (mountRef.current) {
        mountRef.current.addEventListener('click', handleClick);
        mountRef.current.addEventListener('mousedown', handleMouseDown);
        mountRef.current.addEventListener('mousemove', handleMouseMove);
      } else {
        setTimeout(setupEventListeners, 100);
      }
    };

    setupEventListeners();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mouseup', handleMouseUp);
      if (mountRef.current) {
        mountRef.current.removeEventListener('click', handleClick);
        mountRef.current.removeEventListener('mousedown', handleMouseDown);
        mountRef.current.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [handleResize, handleClick, handleMouseDown, handleMouseMove, handleMouseUp]);

  // Update star field when location changes
  useEffect(() => {
    if (location && isInitialized) {
        updateStarField(location);
    }
  }, [location, isInitialized, updateStarField]);

  // Force star field update after a delay if not visible
  useEffect(() => {
    if (isInitialized && location) {
      const checkStars = () => {
        if (starObjectsRef.current.size === 0) {
          updateStarField(location);
        }
      };
      
      const timeout = setTimeout(checkStars, 2000); // Check after 2 seconds
      return () => clearTimeout(timeout);
    }
  }, [isInitialized, location, updateStarField]);

  // Connect pending stream when video element becomes available
  useEffect(() => {
    const connectPendingStream = () => {
      if (videoRef.current && pendingStreamRef.current && !videoRef.current.srcObject) {
        
        try {
          videoRef.current.srcObject = pendingStreamRef.current;
          
          // Set up event listeners for the delayed connection
          videoRef.current.onloadedmetadata = () => {
            setCameraStatus('active');
          };
          
          videoRef.current.onplay = () => {
            setCameraStatus('active');
          };
          
          videoRef.current.onerror = (e) => {
            setCameraStatus('failed');
          };
          
          // Try to play
          videoRef.current.play().catch(e => {
            console.error('❌ Delayed stream play failed:', e);
          });
          
          pendingStreamRef.current = null; // Clear pending stream
          
        } catch (err) {
          setCameraStatus('failed');
        }
      }
    };
    
    // Try to connect immediately
    connectPendingStream();
    
    // Set up interval to keep trying if needed
    const interval = setInterval(connectPendingStream, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  // Simple camera rotation persistence and orientation sync
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.rotation.set(cameraRotation.x, cameraRotation.y, 0);
      
      // Update device orientation to match camera rotation
      const azimuth = (cameraRotation.y * 180 / Math.PI) % 360;
      const altitude = -(cameraRotation.x * 180 / Math.PI);
      setDeviceOrientation({
        alpha: azimuth < 0 ? azimuth + 360 : azimuth,
        beta: -altitude,
        gamma: 0
      });
    }
  }, [cameraRotation]);

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Initializing Stargazer...</p>
        <p style={styles.loadingSubtext}>Requesting permissions and loading star catalog</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h3 style={styles.errorTitle}>Initialization Failed</h3>
        <p style={styles.errorText}>{error}</p>
        <button style={styles.retryButton} onClick={initializeARStargazer}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Camera video background */}
      <video 
        ref={videoRef}
        style={styles.video}
        autoPlay
        playsInline
        muted
        controls={false}
        webkit-playsinline="true"
      />
      
      {/* Three.js overlay */}
      <div ref={mountRef} style={styles.threeContainer} />
      
      {/* Info Panel */}
      <div style={styles.infoPanel}>
        <div style={styles.infoRow}>
          <span>Stars: {starCount} | Planets: {planetCount} | Constellations: {constellationCount}</span>
          {deviceOrientation && (
            <span>
              Az: {Math.round(deviceOrientation.alpha)}° | 
              Alt: {Math.round(-deviceOrientation.beta)}°
            </span>
          )}
        </div>
        {cameraStatus !== 'active' && (
          <div style={styles.infoRow}>
            <span>Camera: {cameraStatus}</span>
          </div>
        )}
        {location && (
          <div style={styles.infoSubtext}>
            Your coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </div>
        )}
      </div>

      {/* Camera Status */}
      {cameraStatus !== 'none' && cameraStatus !== 'active' && (
        <div style={{
          ...styles.instructionsPanel,
          top: '60px',
          background: cameraStatus === 'failed' 
            ? 'linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 107, 107, 0.3) 100%)'
            : 'linear-gradient(135deg, rgba(118, 75, 162, 0.2) 0%, rgba(102, 126, 234, 0.2) 100%)'
        }}>
          <p style={styles.instructionsText}>
            {cameraStatus === 'requesting' && '📹 Requesting camera access...'}
            {cameraStatus === 'failed' && '❌ Camera failed - check permissions'}
          </p>
        </div>
      )}

      {/* Instructions */}
      <div style={styles.instructionsPanel}>
        <p style={styles.instructionsText}>
          {isDesktopMode 
            ? "Drag to explore the full celestial sphere • 360° in all directions"
            : "Point your device anywhere and move to explore stars, planets and constellations"
          }
        </p>
        <p style={styles.instructionsSubtext}>
          {isDesktopMode 
            ? "Drag DOWN to see the Sun at night through Earth • Click objects for info"
            : "Look through the Earth to see objects on the other side • Tap for info"
          }
        </p>
        {cameraStatus === 'failed' && (
          <p style={{...styles.instructionsSubtext, color: '#ff9999'}}>
            Camera not working? Try refreshing the page and granting camera permission when prompted.
          </p>
        )}
      </div>

    </div>
  );
};

const styles = {
  container: {
    position: 'relative' as const,
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #0c0c1e 0%, #1a1a2e 50%, #16213e 100%)',
  },
  video: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    zIndex: 1, // Video in back as AR background
    display: 'block',
    backgroundColor: '#000', // Fallback background
  },
  threeContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 2, // Three.js stars on top of video
    pointerEvents: 'auto' as const,
    // Make Three.js transparent so video shows through
    background: 'transparent',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #0c0c1e 0%, #1a1a2e 50%, #16213e 100%)',
    color: '#ffffff',
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(102, 126, 234, 0.2)',
    borderTop: '4px solid #667eea',
    borderRight: '4px solid #764ba2',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    boxShadow: '0 0 20px rgba(102, 126, 234, 0.3)',
  },
  loadingText: {
    marginTop: '20px',
    fontSize: '18px',
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: '10px',
    fontSize: '14px',
    color: '#cccccc',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #0c0c1e 0%, #1a1a2e 50%, #16213e 100%)',
    color: '#ffffff',
    padding: '20px',
  },
  errorTitle: {
    color: '#ff6b6b',
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  errorText: {
    fontSize: '16px',
    textAlign: 'center' as const,
    marginBottom: '20px',
  },
  retryButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
    },
  },
  infoPanel: {
    position: 'absolute' as const,
    bottom: '20px',
    left: '20px',
    right: '20px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '15px',
    padding: '18px',
    color: '#ffffff',
    zIndex: 3,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    fontWeight: '500',
  },
  infoSubtext: {
    fontSize: '12px',
    color: '#b8c5ff',
    marginTop: '5px',
    textAlign: 'center' as const,
    fontWeight: '500',
  },
  instructionsPanel: {
    position: 'absolute' as const,
    top: '100px',
    left: '20px',
    right: '20px',
    background: 'linear-gradient(135deg, rgba(118, 75, 162, 0.2) 0%, rgba(102, 126, 234, 0.2) 100%)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(118, 75, 162, 0.4)',
    borderRadius: '15px',
    padding: '18px',
    color: '#ffffff',
    zIndex: 3,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  },
  instructionsText: {
    fontSize: '14px',
    fontWeight: '500',
    margin: '0 0 5px 0',
    textAlign: 'center' as const,
  },
  instructionsSubtext: {
    fontSize: '12px',
    color: '#d4a4ff',
    margin: '0',
    textAlign: 'center' as const,
    fontWeight: '500',
  },
};