import React, { useState } from 'react';
import styled from 'styled-components';
import SearchForm from '../components/SearchForm';
import ResultsList from '../components/ResultsList';
import MapView from '../components/MapView';
import SelectedVenues from '../components/SelectedVenues';
import { Restaurant } from '../types/Restaurant';
import { YelpService } from '../services/YelpService';
import { SearchParams } from '../components/SearchForm';

const PlanContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 20px;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.fontSizes.xxlarge};
  margin-bottom: 2rem;
  color: ${props => props.theme.colors.dark};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ResultsContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ToggleView = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
`;

const ViewButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 1rem;
  background-color: ${props => props.$active ? props.theme.colors.light : 'white'};
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.dark};
  
  &:first-child {
    border-right: 1px solid #eee;
  }
`;

const PlanCrawl: React.FC = () => {
  const [view, setView] = useState<'list' | 'map'>('list');
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [selectedVenues, setSelectedVenues] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSearch = async (searchParams: SearchParams) => {
    setIsLoading(true);
    
    try {
      // Call YelpService to get restaurant data
      const results = await YelpService.searchRestaurants(searchParams);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching for restaurants:', error);
      // Handle error appropriately - show error message to user
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleVenueSelection = (restaurant: Restaurant) => {
    if (selectedVenues.some(venue => venue.id === restaurant.id)) {
      setSelectedVenues(selectedVenues.filter(venue => venue.id !== restaurant.id));
    } else {
      setSelectedVenues([...selectedVenues, restaurant]);
    }
  };
  
  return (
    <PlanContainer>
      <Title>Plan Your Food Crawl</Title>
      
      <ContentGrid>
        <LeftColumn>
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
          
          {selectedVenues.length > 0 && (
            <SelectedVenues 
              venues={selectedVenues} 
              onRemoveVenue={(id: string) => setSelectedVenues(selectedVenues.filter(venue => venue.id !== id))}
            />
          )}
        </LeftColumn>
        
        <RightColumn>
          <ResultsContainer>
            <ToggleView>
              <ViewButton 
                $active={view === 'list'} 
                onClick={() => setView('list')}
              >
                List View
              </ViewButton>
              <ViewButton 
                $active={view === 'map'} 
                onClick={() => setView('map')}
              >
                Map View
              </ViewButton>
            </ToggleView>
            
            {view === 'list' ? (
              <ResultsList 
                results={searchResults} 
                selectedVenues={selectedVenues}
                onToggleSelection={toggleVenueSelection}
                isLoading={isLoading}
              />
            ) : (
              <MapView 
                results={searchResults} 
                selectedVenues={selectedVenues}
                onToggleSelection={toggleVenueSelection}
              />
            )}
          </ResultsContainer>
        </RightColumn>
      </ContentGrid>
    </PlanContainer>
  );
};

export default PlanCrawl; 