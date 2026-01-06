import React, { memo, useCallback, useState, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '12px'
};
// Center of India (Default)
const defaultCenter = { lat: 20.5937, lng: 78.9629 };

/**
 * InteractiveMap - Displays markers for multiple rides with click interactions
 * @param {Array} rides - Array of ride objects with source coordinates
 * @param {Function} onMarkerClick - Callback when a marker is clicked
 * @param {Function} onRideSelect - Callback when a marker is clicked (legacy)
 * @param {number} selectedRideId - Currently selected ride ID
 * @param {number} highlightedRideId - Currently highlighted ride ID (from hover)
 */
function InteractiveMap({ 
  rides = [], 
  onMarkerClick, 
  onRideSelect, 
  selectedRideId,
  highlightedRideId 
}) {
  const [activeMarker, setActiveMarker] = useState(null);
  const [directions, setDirections] = useState({});

  // Fetch directions for all rides
  useEffect(() => {
    if (!rides.length || !window.google?.maps) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    rides.forEach((ride) => {
      if (!ride.source || !ride.destination) return;
      
      directionsService.route(
        {
          origin: ride.source,
          destination: ride.destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(prev => ({
              ...prev,
              [ride.id]: result
            }));
          }
        }
      );
    });
  }, [rides]);

  const handleMarkerClick = useCallback(
    (ride) => {
      setActiveMarker(ride.id);
      // Support both callback names
      if (onMarkerClick) {
        onMarkerClick(ride.id);
      }
      if (onRideSelect) {
        onRideSelect(ride.id);
      }
    },
    [onMarkerClick, onRideSelect]
  );

  const handleInfoWindowClose = useCallback(() => {
    setActiveMarker(null);
  }, []);

  // Calculate map center based on rides
  const center = calculateMapCenter(rides);

  if (!rides || rides.length === 0) {
    return (
      <div style={containerStyle} className="bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No rides to display on map</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
    >
      {/* Render directions/routes for all rides */}
      {rides.map((ride) => {
        const direction = directions[ride.id];
        if (!direction) return null;
        
        const isHighlighted = highlightedRideId === ride.id;
        const isSelected = selectedRideId === ride.id;
        
        return (
          <DirectionsRenderer
            key={`direction-${ride.id}`}
            directions={direction}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: isSelected ? '#ef4444' : isHighlighted ? '#f59e0b' : '#2563eb',
                strokeOpacity: isSelected || isHighlighted ? 0.9 : 0.6,
                strokeWeight: isSelected ? 5 : isHighlighted ? 4 : 3,
              }
            }}
          />
        );
      })}

      {rides.map((ride) => {
        const position = getRideSourcePosition(ride);
        
        if (!position) return null;

        // Determine marker style based on state
        const isHighlighted = highlightedRideId === ride.id;
        const isSelected = selectedRideId === ride.id;
        const isActive = activeMarker === ride.id;

        return (
          <Marker
            key={ride.id}
            position={position}
            onClick={() => handleMarkerClick(ride)}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: isSelected || isActive ? 12 : isHighlighted ? 10 : 8,
              fillColor: isSelected || isActive ? '#ef4444' : isHighlighted ? '#f59e0b' : '#2563eb',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
            animation={isHighlighted ? window.google.maps.Animation.BOUNCE : null}
          >
            {activeMarker === ride.id && (
              <InfoWindow onCloseClick={handleInfoWindowClose}>
                <div style={{ maxWidth: '220px', padding: '0.5rem' }}>
                  <h3 style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    {ride.source || 'Pickup'} → {ride.destination || 'Drop'}
                  </h3>
                  {ride.driverName && (
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Driver: {ride.driverName}
                    </p>
                  )}
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    {ride.time || 'Time not available'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    ₹{ride.price || '0'} per seat
                  </p>
                  {ride.seats !== undefined && (
                    <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.5rem', fontWeight: '500' }}>
                      {ride.seats} seats available
                    </p>
                  )}
                </div>
              </InfoWindow>
            )}
          </Marker>
        );
      })}
    </GoogleMap>
  );
}

// Extract source coordinates from ride object
function getRideSourcePosition(ride) {
  // Try different possible property names for coordinates
  if (ride.sourceLat && ride.sourceLng) {
    return { lat: Number(ride.sourceLat), lng: Number(ride.sourceLng) };
  }
  
  if (ride.sourceLatitude && ride.sourceLongitude) {
    return { lat: Number(ride.sourceLatitude), lng: Number(ride.sourceLongitude) };
  }

  if (ride.sourceCoordinates) {
    return {
      lat: Number(ride.sourceCoordinates.lat || ride.sourceCoordinates.latitude),
      lng: Number(ride.sourceCoordinates.lng || ride.sourceCoordinates.longitude),
    };
  }

  return null;
}

// Calculate center point based on all rides
function calculateMapCenter(rides) {
  if (!rides || rides.length === 0) return defaultCenter;

  const positions = rides
    .map(getRideSourcePosition)
    .filter(Boolean);

  if (positions.length === 0) return defaultCenter;

  const bounds = positions.reduce(
    (acc, pos) => ({
      minLat: Math.min(acc.minLat, pos.lat),
      maxLat: Math.max(acc.maxLat, pos.lat),
      minLng: Math.min(acc.minLng, pos.lng),
      maxLng: Math.max(acc.maxLng, pos.lng),
    }),
    {
      minLat: positions[0].lat,
      maxLat: positions[0].lat,
      minLng: positions[0].lng,
      maxLng: positions[0].lng,
    }
  );

  return {
    lat: (bounds.minLat + bounds.maxLat) / 2,
    lng: (bounds.minLng + bounds.maxLng) / 2,
  };
}

export default memo(InteractiveMap);