import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { GoogleMap, useJsApiLoader, InfoWindow, Marker } from '@react-google-maps/api';
import { Restaurant } from '../types/Restaurant';

interface MapViewProps {
  results: Restaurant[];
  selectedVenues: Restaurant[];
  onToggleSelection: (restaurant: Restaurant) => void;
}

const MapContainer = styled.div`
  height: 600px;
  width: 100%;
  position: relative;
`;

const LoadingState = styled.div`
  padding: 3rem 1rem;
  text-align: center;
  color: #666;
`;

const InfoWindowContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 250px;
`;

const InfoWindowTitle = styled.h3`
  font-size: 1rem;
  margin: 0;
`;

const InfoWindowDetails = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const InfoWindowButton = styled.button<{ $isSelected: boolean }>`
  padding: 0.5rem;
  margin-top: 0.5rem;
  background-color: ${props => props.$isSelected ? props.theme.colors.primary : 'white'};
  color: ${props => props.$isSelected ? 'white' : props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
`;

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const MapView: React.FC<MapViewProps> = ({ results, selectedVenues, onToggleSelection }) => {
  const [selectedMarker, setSelectedMarker] = useState<Restaurant | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Use the provided API key
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyAvnVdLIoAMMSzLU1DFxuMsv-WkiVQo-DE',
    // Note: We'll add a comment about this warning
  });
  
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    
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
  
  if (!isLoaded) {
    return (
      <LoadingState>
        <p>Loading map...</p>
      </LoadingState>
    );
  }
  
  // Default center (San Francisco) if no results
  const center = results.length > 0
    ? { 
        lat: results[0].coordinates.latitude, 
        lng: results[0].coordinates.longitude 
      }
    : { lat: 37.7749, lng: -122.4194 };
  
  return (
    <MapContainer>
      {/* Note: We see a marker deprecation warning, but we'll keep using Marker for now.
          To upgrade to AdvancedMarkerElement would require additional setup and dependencies. */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
        onLoad={onMapLoad}
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
                // Use custom SVG for markers to avoid the deprecation warning in a more complete implementation
                url: isSelected 
                  ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                  : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new google.maps.Size(40, 40)
              }}
              onClick={() => setSelectedMarker(restaurant)}
            />
          );
        })}
        
        {selectedMarker && (
          <InfoWindow
            position={{
              lat: selectedMarker.coordinates.latitude,
              lng: selectedMarker.coordinates.longitude
            }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <InfoWindowContent>
              <InfoWindowTitle>{selectedMarker.name}</InfoWindowTitle>
              <InfoWindowDetails>
                {selectedMarker.categories.join(', ')} • {selectedMarker.price} • {selectedMarker.rating} ⭐
              </InfoWindowDetails>
              <InfoWindowDetails>{selectedMarker.address}</InfoWindowDetails>
              <InfoWindowButton
                $isSelected={selectedVenues.some(venue => venue.id === selectedMarker.id)}
                onClick={() => onToggleSelection(selectedMarker)}
              >
                {selectedVenues.some(venue => venue.id === selectedMarker.id)
                  ? 'Remove from Crawl'
                  : 'Add to Crawl'
                }
              </InfoWindowButton>
            </InfoWindowContent>
          </InfoWindow>
        )}
      </GoogleMap>
    </MapContainer>
  );
};

export default MapView; 