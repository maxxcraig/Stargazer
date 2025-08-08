# Stargazer - AR Stargazing Companion

## Project Overview
A web-based AR stargazing app similar to SkyView Lite that identifies and labels stars and constellations in real-time using your device camera. Built with React and Three.js for immersive 3D visualization with desktop mouse controls.

## Current Features (Implemented)
- ✅ Real-time camera feed background using WebRTC getUserMedia
- ✅ Three.js 3D star field rendering with transparent AR overlay
- ✅ 49 bright stars from NASA Hipparcos catalog with accurate coordinates
- ✅ Large, visible star labels with white text and black outlines
- ✅ Desktop mouse drag controls for unlimited 360° camera movement
- ✅ Star click detection with raycasting for detailed information modals
- ✅ Constellation lines connecting stars (Orion, Summer Triangle, etc.)
- ✅ Browser refresh on modal close to ensure clean state
- ✅ SkyView Lite-style user experience

## Technical Implementation

### Current Architecture
- **Framework**: React with TypeScript
- **3D Graphics**: Three.js WebGL renderer with transparent background for AR overlay
- **Camera**: WebRTC getUserMedia API for live camera feed background
- **Mouse Controls**: Custom drag handlers for unlimited 360° camera rotation
- **Star Catalog**: Embedded 49 bright stars (Sirius, Vega, Betelgeuse, etc.)
- **Constellation Lines**: Three.js Line objects connecting constellation stars
- **Raycasting**: Three.js raycaster for star click detection

### Key Components
- **ARStargazer.tsx**: Main AR component with camera, Three.js scene, and star rendering
- **StarCatalogService.ts**: Embedded star data and constellation definitions
- **WebSensorManager.ts**: Device sensor management (currently desktop mode only)
- **App.tsx**: Main app with star info modal and browser refresh on close

### Current Data
- **49 Real Stars**: Sirius, Vega, Betelgeuse, Arcturus, Spica, Antares, etc.
- **9 Constellations**: Orion (with belt), Summer Triangle, Taurus, Canis Major, and more
- **Star Properties**: RA/Dec coordinates, magnitude, spectral class, common names

## Current Project Structure
```
src/
├── components/
│   └── ARStargazer.tsx         # Main AR component with camera, Three.js, stars, constellations
├── services/
│   ├── StarCatalogService.ts   # 49 embedded stars + 9 constellations with line data
│   └── WebSensorManager.ts     # Device sensor management (desktop mode)
├── App.tsx                     # Main app with modal and browser refresh
├── App.css                     # Styles for modals and UI
└── index.tsx                   # React app entry point
```

## Working Features & How They Work

### Star Rendering
- **Star Positioning**: Uses golden ratio spiral distribution for realistic sky dome placement
- **Star Sizes**: Based on magnitude (brighter stars = larger spheres)
- **Star Labels**: Large canvas-based sprites with white text and black outlines
- **Visibility**: Only bright stars (magnitude < 2.0) get labels to avoid clutter

### Constellation System
- **Line Rendering**: Three.js Line objects with 40% opacity white material
- **Orion Constellation**: Complete belt (Mintaka→Alnilam→Alnitak) + shoulder connections
- **Summer Triangle**: Vega→Deneb→Altair triangle pattern
- **Data Structure**: `{from: "star_id", to: "star_id"}` format in StarCatalogService

### Camera Controls
- **Unlimited Rotation**: Removed mathematical limits for full 360° movement
- **Mouse Sensitivity**: 0.005 factor for smooth SkyView Lite-style controls
- **Camera Persistence**: State maintained through React useState and useEffect

### Modal System
- **Star Info Display**: Shows magnitude, spectral class, constellation, coordinates
- **Clean Exit**: Browser refresh on modal close prevents any rendering issues
- **High Z-Index**: Modal at z-index 9999 to properly overlay Three.js canvas

## Development Setup
- **Start Server**: `npm start` (runs on port 3000)
- **Framework**: Create React App with TypeScript
- **No Build Step**: Uses embedded star data, no external API calls
- **Desktop Testing**: Mouse controls work perfectly for development

## Next Development Priorities
1. **More Constellations**: Add Big Dipper, Cassiopeia, Southern Cross
2. **Mobile Support**: Enable device orientation sensors for mobile AR
3. **Star Magnitude Control**: Toggle visibility by brightness
4. **Constellation Names**: Add constellation name labels
5. **Search Feature**: Find specific stars or constellations
6. **Real Astronomical Coordinates**: Convert to proper celestial coordinate system