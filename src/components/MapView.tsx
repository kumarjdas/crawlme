import React, { useState } from 'react';
import styled from 'styled-components';
import { useJsApiLoader, InfoWindow } from '@react-google-maps/api';
import { Restaurant } from '../types/Restaurant';
import { GOOGLE_MAPS_API_KEY } from '../constants/keys';
import GoogleMapFixedSize from './GoogleMapFixedSize';

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

const ErrorState = styled.div`
  padding: 3rem 1rem;
  text-align: center;
  color: #d32f2f;
  background-color: #ffebee;
  border-radius: 4px;
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

// Import necessary Google Maps components with valid libraries
const libraries = ['places'];

const MapView: React.FC<MapViewProps> = ({ results, selectedVenues, onToggleSelection }) => {
  const [selectedMarker, setSelectedMarker] = useState<Restaurant | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  
  // Use the API key from constants
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries as any,
    version: "weekly"
  });
  
  // Handle Google Maps API loading error
  if (loadError || mapError) {
    return (
      <ErrorState>
        <p>
          <strong>Error loading Google Maps:</strong> {mapError || 'Please check your API key and network connection.'}
        </p>
        <p>
          Make sure you have:
          <ol>
            <li>Enabled billing on your Google Cloud project</li>
            <li>Enabled the Maps JavaScript API</li>
            <li>Set up appropriate API key restrictions</li>
          </ol>
        </p>
        <p>
          <strong>If you see a "RefererNotAllowedMapError":</strong><br/>
          You need to add <code>http://localhost:3000/*</code> to your allowed referrers in the Google Cloud Console.
        </p>
        <p>
          <strong>Steps to fix API key restrictions:</strong>
          <ol>
            <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">Google Cloud Console &gt; APIs &amp; Services &gt; Credentials</a></li>
            <li>Click on your API key</li>
            <li>Under "Application restrictions", select "HTTP referrers (websites)"</li>
            <li>Add <code>http://localhost:3000/*</code> to the allowed referrers</li>
            <li>Click "Save" and wait a few minutes for changes to apply</li>
          </ol>
        </p>
      </ErrorState>
    );
  }
  
  if (!isLoaded) {
    return (
      <LoadingState>
        <p>Loading map...</p>
      </LoadingState>
    );
  }
  
  const handleSelectMarker = (restaurant: Restaurant) => {
    setSelectedMarker(restaurant);
  };
  
  return (
    <MapContainer>
      <GoogleMapFixedSize 
        results={results}
        selectedVenues={selectedVenues}
        onSelectMarker={handleSelectMarker}
      />
      
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
    </MapContainer>
  );
};

export default MapView; 