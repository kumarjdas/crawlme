import React, { useState } from 'react';
import styled from 'styled-components';
import { Restaurant } from '../types/Restaurant';

interface ResultsListProps {
  results: Restaurant[];
  selectedVenues: Restaurant[];
  onToggleSelection: (restaurant: Restaurant) => void;
  isLoading: boolean;
}

const ResultsListContainer = styled.div`
  max-height: 600px;
  overflow-y: auto;
  padding: 1rem;
`;

const EmptyState = styled.div`
  padding: 3rem 1rem;
  text-align: center;
  color: #666;
`;

const LoadingState = styled.div`
  padding: 3rem 1rem;
  text-align: center;
  color: #666;
`;

const SortBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const SortLabel = styled.span`
  font-weight: 500;
`;

const SortSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
`;

const ResultsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ResultCard = styled.div<{ $isSelected: boolean }>`
  display: flex;
  background-color: ${props => props.$isSelected ? props.theme.colors.light : 'white'};
  border: 1px solid ${props => props.$isSelected ? props.theme.colors.primary : '#eee'};
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ResultImage = styled.div<{ $imageUrl: string }>`
  width: 120px;
  min-width: 120px;
  background-image: url(${props => props.$imageUrl});
  background-size: cover;
  background-position: center;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 80px;
    min-width: 80px;
  }
`;

const ResultInfo = styled.div`
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const ResultName = styled.h3`
  font-size: ${props => props.theme.fontSizes.large};
  margin: 0;
`;

const ResultRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
`;

const ResultDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: ${props => props.theme.fontSizes.small};
  color: #666;
`;

const ResultDetail = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ResultAddress = styled.p`
  font-size: ${props => props.theme.fontSizes.small};
  color: #666;
  margin-top: auto;
`;

const SelectButton = styled.button<{ $isSelected: boolean }>`
  padding: 0.5rem 1rem;
  background-color: ${props => props.$isSelected ? props.theme.colors.primary : 'white'};
  color: ${props => props.$isSelected ? 'white' : props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  
  &:hover {
    background-color: ${props => props.$isSelected ? '#ff5252' : props.theme.colors.light};
  }
`;

const ResultsList: React.FC<ResultsListProps> = ({
  results,
  selectedVenues,
  onToggleSelection,
  isLoading
}) => {
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'price'>('rating');
  
  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    } else if (sortBy === 'price') {
      return a.price.length - b.price.length;
    } else if (sortBy === 'distance') {
      // Sort by distance if available, otherwise keep original order
      const distanceA = a.distance || 99999;
      const distanceB = b.distance || 99999;
      return distanceA - distanceB;
    }
    return 0;
  });
  
  if (isLoading) {
    return (
      <LoadingState>
        <p>Searching for restaurants...</p>
      </LoadingState>
    );
  }
  
  if (results.length === 0) {
    return (
      <EmptyState>
        <p>Search for restaurants to see results.</p>
      </EmptyState>
    );
  }
  
  return (
    <ResultsListContainer>
      <SortBar>
        <SortLabel>Sort by:</SortLabel>
        <SortSelect 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'rating' | 'distance' | 'price')}
        >
          <option value="rating">Rating</option>
          <option value="distance">Distance</option>
          <option value="price">Price</option>
        </SortSelect>
      </SortBar>
      
      <ResultsGrid>
        {sortedResults.map(restaurant => {
          const isSelected = selectedVenues.some(venue => venue.id === restaurant.id);
          
          return (
            <ResultCard key={restaurant.id} $isSelected={isSelected}>
              <ResultImage $imageUrl={restaurant.imageUrl} />
              <ResultInfo>
                <ResultHeader>
                  <ResultName>{restaurant.name}</ResultName>
                  <ResultRating>
                    {restaurant.rating} ⭐
                  </ResultRating>
                </ResultHeader>
                
                <ResultDetails>
                  <ResultDetail>
                    <span>{restaurant.price}</span>
                  </ResultDetail>
                  <ResultDetail>
                    <span>{restaurant.categories.join(', ')}</span>
                  </ResultDetail>
                  {restaurant.distance && (
                    <ResultDetail>
                      <span>📍 {restaurant.distance} mi</span>
                    </ResultDetail>
                  )}
                </ResultDetails>
                
                <ResultAddress>{restaurant.address}</ResultAddress>
                
                <SelectButton 
                  $isSelected={isSelected}
                  onClick={() => onToggleSelection(restaurant)}
                >
                  {isSelected ? 'Remove' : 'Add to Crawl'}
                </SelectButton>
              </ResultInfo>
            </ResultCard>
          );
        })}
      </ResultsGrid>
    </ResultsListContainer>
  );
};

export default ResultsList; 