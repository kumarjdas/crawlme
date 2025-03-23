import React, { useCallback, useEffect, useRef } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Restaurant } from '../types/Restaurant';

interface GoogleMapFixedSizeProps {
  results: Restaurant[];
  selectedVenues: Restaurant[];
  onSelectMarker?: (restaurant: Restaurant) => void;
  directions?: google.maps.DirectionsResult | null;
}

// Fixed size container style to avoid IntersectionObserver issues
const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
  overflow: 'hidden'
};

const GoogleMapFixedSize: React.FC<GoogleMapFixedSizeProps> = ({ 
  results,
  selectedVenues,
  onSelectMarker,
  directions
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    
    // If we have results, fit the map to show all markers
    if (results.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      
      results.forEach(result => {
        bounds.extend({
          lat: result.coordinates.latitude,
          lng: result.coordinates.longitude
        });
      });
      
      map.fitBounds(bounds);
    }
  }, [results]);
  
  // Update map bounds when results change
  useEffect(() => {
    if (mapRef.current && results.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      
      results.forEach(result => {
        bounds.extend({
          lat: result.coordinates.latitude,
          lng: result.coordinates.longitude
        });
      });
      
      mapRef.current.fitBounds(bounds);
    }
  }, [results]);
  
  // Default center (San Francisco) if no results
  const center = results.length > 0
    ? { 
        lat: results[0].coordinates.latitude, 
        lng: results[0].coordinates.longitude 
      }
    : { lat: 37.7749, lng: -122.4194 };
  
  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={13}
      onLoad={onMapLoad}
      options={{
        streetViewControl: false,
        fullscreenControl: false
      }}
    >
      {results.map(restaurant => {
        const isSelected = selectedVenues.some(venue => venue.id === restaurant.id);
        
        return (
          <Marker
            key={restaurant.id}
            position={{
              lat: restaurant.coordinates.latitude,
              lng: restaurant.coordinates.longitude
            }}
            icon={{
              url: isSelected 
                ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new google.maps.Size(40, 40)
            }}
            onClick={() => onSelectMarker && onSelectMarker(restaurant)}
          />
        );
      })}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#FF6B6B',
              strokeWeight: 5
            }
          }}
        />
      )}
    </GoogleMap>
  );
};

export default GoogleMapFixedSize; 