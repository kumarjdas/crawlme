import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
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

const ViewCrawl: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [crawlData, setCrawlData] = useState<{
    venues: Restaurant[];
    totalDistance: string;
    totalDuration: string;
    transportMode: 'walking' | 'driving' | 'transit';
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // In a real application, this would fetch data from an API
    const fetchCrawl = async () => {
      setIsLoading(true);
      
      // Simulating API call with timeout
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
          transportMode: 'walking' as const
        };
        
        setCrawlData(mockCrawlData);
        setIsLoading(false);
      }, 1000);
    };
    
    fetchCrawl();
  }, [id]);
  
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
                <span>{crawlData.transportMode.charAt(0).toUpperCase() + crawlData.transportMode.slice(1)}</span>
              </SummaryItem>
            </CrawlSummary>
            
            <VenueList>
              {crawlData.venues.map((venue, index) => (
                <React.Fragment key={venue.id}>
                  {index > 0 && (
                    <TravelInfo>
                      <span>🚶‍♂️</span>
                      <span>15 min walk (0.7 miles)</span>
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
          <p>Map will be displayed here with the optimized route.</p>
          {/* In a real application, this would use Google Maps API to display the route */}
        </MapContainer>
      </CrawlGrid>
    </ViewCrawlContainer>
  );
};

export default ViewCrawl; 