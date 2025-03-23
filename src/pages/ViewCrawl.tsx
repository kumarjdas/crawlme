import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Restaurant } from '../types/Restaurant';

const ViewCrawlContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 20px;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.fontSizes.xxlarge};
  margin-bottom: 2rem;
  color: ${props => props.theme.colors.dark};
`;

const CrawlGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const InfoPanel = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const MapContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  min-height: 400px;
  position: relative;
`;

const ApiWarning = styled.div`
  background-color: #fff3cd;
  color: #856404;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  
  a {
    color: #856404;
    text-decoration: underline;
  }
`;

const CrawlInfo = styled.div`
  margin-bottom: 2rem;
`;

const CrawlSummary = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const VenueList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const VenueItem = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const VenueNumber = styled.div`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
`;

const VenueInfo = styled.div`
  flex: 1;
`;

const VenueName = styled.h3`
  font-size: ${props => props.theme.fontSizes.medium};
  margin-bottom: 0.25rem;
`;

const VenueDetails = styled.p`
  font-size: ${props => props.theme.fontSizes.small};
  color: #666;
`;

const TravelInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: ${props => props.theme.fontSizes.small};
  color: #666;
  padding: 0.5rem 0;
  
  svg {
    color: ${props => props.theme.colors.secondary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const PrimaryButton = styled(Button)`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(255, 107, 107, 0.3);
  }
`;

const SecondaryButton = styled(Button)`
  background-color: ${props => props.theme.colors.secondary};
  color: white;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(78, 205, 196, 0.3);
  }
`;

const OutlineButton = styled(Button)`
  background-color: transparent;
  border: 1px solid ${props => props.theme.colors.dark};
  color: ${props => props.theme.colors.dark};
`;

const BackButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: white;
  color: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: ${props => props.theme.colors.light};
  }
`;

const TravelMode = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ModeButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  background-color: ${props => props.$active ? props.theme.colors.primary : 'white'};
  color: ${props => props.$active ? 'white' : props.theme.colors.dark};
  border: 1px solid ${props => props.$active ? props.theme.colors.primary : '#ddd'};
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.light};
  }
`;

const libraries = ['places', 'directions'];

const ViewCrawl: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [crawlData, setCrawlData] = useState<{
    venues: Restaurant[];
    totalDistance: string;
    totalDuration: string;
    transportMode: 'WALKING' | 'DRIVING' | 'TRANSIT' | 'BICYCLING';
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [travelMode, setTravelMode] = useState<string>('WALKING');
  const [searchLocation, setSearchLocation] = useState<string | null>(null);
  const [geocodedLocation, setGeocodedLocation] = useState<google.maps.LatLng | null>(null);
  const [legInfo, setLegInfo] = useState<{distance: string, duration: string}[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  
  // Initialize Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyDhFiV-WA9a3fIdKMQ-lJuoGLgkKmBnkTY',
    libraries: libraries as any,
    version: "weekly",
    language: "en"
  });
  
  // Load selected venues from sessionStorage
  useEffect(() => {
    const fetchCrawl = async () => {
      setIsLoading(true);
      
      try {
        // Get search location
        const location = sessionStorage.getItem('searchLocation');
        setSearchLocation(location);
        
        // For a new crawl, get venues from sessionStorage
        if (id === 'new') {
          const storedVenues = sessionStorage.getItem('selectedVenues');
          
          if (storedVenues) {
            const venues = JSON.parse(storedVenues) as Restaurant[];
            
            setCrawlData({
              venues,
              totalDistance: 'Calculating...',
              totalDuration: 'Calculating...',
              transportMode: 'WALKING'
            });
          } else {
            // No venues found, redirect back to plan page
            navigate('/plan');
            return;
          }
        } else {
          // Simulating API call for existing crawl with timeout
          setTimeout(() => {
            // Sample data for demonstration
            const mockCrawlData = {
              venues: [
                {
                  id: '1',
                  name: 'Delicious Burger Joint',
                  rating: 4.5,
                  price: '$$',
                  imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
                  address: '123 Main St',
                  categories: ['Burgers', 'American'],
                  coordinates: { latitude: 37.7749, longitude: -122.4194 }
                },
                {
                  id: '2',
                  name: 'Amazing Taco Place',
                  rating: 4.7,
                  price: '$',
                  imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500',
                  address: '456 Elm St',
                  categories: ['Mexican', 'Tacos'],
                  coordinates: { latitude: 37.7850, longitude: -122.4100 }
                },
                {
                  id: '3',
                  name: 'Perfect Pizza Spot',
                  rating: 4.2,
                  price: '$$',
                  imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
                  address: '789 Oak St',
                  categories: ['Pizza', 'Italian'],
                  coordinates: { latitude: 37.7950, longitude: -122.4300 }
                }
              ],
              totalDistance: '2.3 miles',
              totalDuration: '1 hour 45 minutes',
              transportMode: 'WALKING' as const
            };
            
            setCrawlData(mockCrawlData);
          }, 1000);
        }
      } catch (error) {
        console.error('Error fetching crawl data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCrawl();
  }, [id, navigate]);
  
  // Geocode the search location when it's loaded and Maps API is ready
  useEffect(() => {
    if (!isLoaded || !searchLocation) return;
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchLocation }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const location = results[0].geometry.location;
        setGeocodedLocation(location);
      } else {
        console.error('Geocoding failed:', status);
      }
    });
  }, [isLoaded, searchLocation]);
  
  // Calculate directions when venues or travel mode changes
  useEffect(() => {
    if (!isLoaded || !crawlData?.venues || crawlData.venues.length < 1) return;
    
    try {
      const directionsService = new google.maps.DirectionsService();
      
      // Use geocoded search location as start/end if available, otherwise use first venue
      const startPoint = geocodedLocation || 
        new google.maps.LatLng(
          crawlData.venues[0].coordinates.latitude,
          crawlData.venues[0].coordinates.longitude
        );
      
      // Create an array of waypoints from all venues
      const waypoints = crawlData.venues.map(venue => ({
        location: new google.maps.LatLng(
          venue.coordinates.latitude,
          venue.coordinates.longitude
        ),
        stopover: true
      }));
      
      // Convert string travel mode to Google Maps TravelMode
      const googleTravelMode = 
        travelMode === 'WALKING' ? google.maps.TravelMode.WALKING :
        travelMode === 'DRIVING' ? google.maps.TravelMode.DRIVING :
        travelMode === 'BICYCLING' ? google.maps.TravelMode.BICYCLING :
        google.maps.TravelMode.TRANSIT;
      
      directionsService.route(
        {
          origin: startPoint,
          destination: startPoint, // End at the same place we started
          waypoints: waypoints,
          travelMode: googleTravelMode,
          optimizeWaypoints: false
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result);
            
            // Calculate total distance and duration and store leg info
            if (result?.routes[0]?.legs) {
              let totalDistance = 0;
              let totalDuration = 0;
              
              const legs = result.routes[0].legs;
              const legInfoArray: {distance: string, duration: string}[] = [];
              
              legs.forEach((leg) => {
                totalDistance += leg.distance?.value || 0;
                totalDuration += leg.duration?.value || 0;
                
                if (leg.distance && leg.duration) {
                  legInfoArray.push({
                    distance: leg.distance.text,
                    duration: leg.duration.text
                  });
                }
              });
              
              setLegInfo(legInfoArray);
              
              // Convert meters to miles
              const distanceInMiles = (totalDistance / 1609).toFixed(1);
              
              // Convert seconds to hours and minutes
              const hours = Math.floor(totalDuration / 3600);
              const minutes = Math.floor((totalDuration % 3600) / 60);
              const durationString = hours > 0 
                ? `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`
                : `${minutes} minute${minutes > 1 ? 's' : ''}`;
              
              setCrawlData(prev => {
                if (!prev) return null;
                return {
                  ...prev,
                  totalDistance: `${distanceInMiles} miles`,
                  totalDuration: durationString
                };
              });
            }
          } else {
            console.error(`Directions request failed: ${status}`);
            // Show error message explaining the required API
            alert(`Error with Google Maps Directions: ${status}.\n\nMake sure you have enabled the "Directions API" in your Google Cloud Console. The "Routes API" is different and won't work for this feature.`);
          }
        }
      );
    } catch (error) {
      console.error('Error setting up directions:', error);
    }
  }, [isLoaded, crawlData?.venues, travelMode, geocodedLocation]);
  
  // Add an effect to handle map loading errors
  useEffect(() => {
    if (loadError) {
      console.error('Google Maps loading error:', loadError);
      setMapError(`Failed to load Google Maps: ${loadError.message || 'Unknown error'}`);
    }
  }, [loadError]);
  
  const handleBackClick = () => {
    navigate('/plan');
  };
  
  const handleTravelModeChange = (mode: string) => {
    setTravelMode(mode);
  };
  
  if (isLoading) {
    return (
      <ViewCrawlContainer>
        <Title>Loading your crawl...</Title>
      </ViewCrawlContainer>
    );
  }
  
  if (!crawlData) {
    return (
      <ViewCrawlContainer>
        <Title>Crawl not found</Title>
        <p>Sorry, we couldn't find the food crawl you're looking for.</p>
      </ViewCrawlContainer>
    );
  }
  
  return (
    <ViewCrawlContainer>
      <BackButton onClick={handleBackClick}>
        ← Back to Search
      </BackButton>
      
      <Title>Your Food Crawl</Title>
      
      <CrawlGrid>
        <InfoPanel>
          <CrawlInfo>
            <CrawlSummary>
              <SummaryItem>
                <strong>Total Venues:</strong>
                <span>{crawlData.venues.length}</span>
              </SummaryItem>
              <SummaryItem>
                <strong>Total Distance:</strong>
                <span>{crawlData.totalDistance}</span>
              </SummaryItem>
              <SummaryItem>
                <strong>Estimated Duration:</strong>
                <span>{crawlData.totalDuration}</span>
              </SummaryItem>
              <SummaryItem>
                <strong>Transport Mode:</strong>
                <span>{crawlData.transportMode.charAt(0).toUpperCase() + crawlData.transportMode.slice(1).toLowerCase()}</span>
              </SummaryItem>
            </CrawlSummary>
            
            <TravelMode>
              <ModeButton 
                $active={travelMode === 'WALKING'}
                onClick={() => handleTravelModeChange('WALKING')}
              >
                🚶‍♂️ Walking
              </ModeButton>
              <ModeButton 
                $active={travelMode === 'BICYCLING'}
                onClick={() => handleTravelModeChange('BICYCLING')}
              >
                🚲 Biking
              </ModeButton>
              <ModeButton 
                $active={travelMode === 'DRIVING'}
                onClick={() => handleTravelModeChange('DRIVING')}
              >
                🚗 Driving
              </ModeButton>
              <ModeButton 
                $active={travelMode === 'TRANSIT'}
                onClick={() => handleTravelModeChange('TRANSIT')}
              >
                🚆 Transit
              </ModeButton>
            </TravelMode>
            
            <VenueList>
              {crawlData.venues.map((venue, index) => (
                <React.Fragment key={venue.id}>
                  {index > 0 && legInfo[index - 1] && (
                    <TravelInfo>
                      <span>{travelMode === 'WALKING' ? '🚶‍♂️' : travelMode === 'DRIVING' ? '🚗' : travelMode === 'BICYCLING' ? '🚲' : '🚆'}</span>
                      <span>{legInfo[index - 1].duration} ({legInfo[index - 1].distance})</span>
                    </TravelInfo>
                  )}
                  <VenueItem>
                    <VenueNumber>{index + 1}</VenueNumber>
                    <VenueInfo>
                      <VenueName>{venue.name}</VenueName>
                      <VenueDetails>
                        {venue.categories.join(', ')} • {venue.price} • {venue.rating} ⭐
                      </VenueDetails>
                      <VenueDetails>{venue.address}</VenueDetails>
                    </VenueInfo>
                  </VenueItem>
                </React.Fragment>
              ))}
            </VenueList>
          </CrawlInfo>
          
          <ButtonGroup>
            <PrimaryButton>Share Crawl</PrimaryButton>
            <SecondaryButton>Export PDF</SecondaryButton>
            <OutlineButton>Add to Calendar</OutlineButton>
          </ButtonGroup>
        </InfoPanel>
        
        <MapContainer>
          <ApiWarning>
            <span>⚠️</span>
            <div>
              {mapError ? (
                <>
                  <strong>Error Loading Google Maps:</strong> {mapError}
                  <p>To fix this issue:</p>
                </>
              ) : (
                <strong>Google Maps API Notice:</strong>
              )}
              <ol>
                <li>Enable the "Directions API" in your <a href="https://console.cloud.google.com/apis/library/directions-backend.googleapis.com" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
                <li>Enable the "Maps JavaScript API" in your <a href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
                <li>Make sure your API key has <strong>NO domain restrictions</strong> during development</li>
                <li>Verify billing is enabled on your Google Cloud account (required for Maps API)</li>
                <li>Try opening <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Google Maps</a> in a new tab to confirm your internet connection</li>
              </ol>
              <p>After making these changes, refresh this page to try again.</p>
            </div>
          </ApiWarning>
          
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{
                width: '100%',
                height: '100%',
                minHeight: '500px'
              }}
              center={crawlData.venues.length > 0 ? {
                lat: crawlData.venues[0].coordinates.latitude,
                lng: crawlData.venues[0].coordinates.longitude
              } : { lat: 37.7749, lng: -122.4194 }}
              zoom={13}
            >
              {/* Display markers for each venue */}
              {crawlData.venues.map((venue, index) => (
                <Marker
                  key={venue.id}
                  position={{
                    lat: venue.coordinates.latitude,
                    lng: venue.coordinates.longitude
                  }}
                  label={(index + 1).toString()}
                />
              ))}
              
              {/* Display route directions */}
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
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p>Loading map...</p>
              {mapError && <p style={{ color: 'red' }}>Error: {mapError}</p>}
            </div>
          )}
        </MapContainer>
      </CrawlGrid>
    </ViewCrawlContainer>
  );
};

export default ViewCrawl; 