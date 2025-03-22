import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Restaurant } from '../types/Restaurant';

interface SelectedVenuesProps {
  venues: Restaurant[];
  onRemoveVenue: (id: string) => void;
}

const Container = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const Title = styled.h2`
  font-size: ${props => props.theme.fontSizes.large};
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.dark};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const VenueCount = styled.span`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.fontSizes.small};
  font-weight: 500;
`;

const VenueList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
`;

const VenueItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const VenueInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const VenueNumber = styled.div`
  background-color: ${props => props.theme.colors.light};
  color: ${props => props.theme.colors.primary};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: ${props => props.theme.fontSizes.small};
`;

const VenueName = styled.span`
  font-weight: 500;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 1.25rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: ${props => props.theme.colors.danger};
  }
`;

const OptimizeButton = styled(Link)`
  display: block;
  width: 100%;
  padding: 0.75rem;
  background-color: ${props => props.theme.colors.secondary};
  color: white;
  border: none;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  
  &:hover {
    background-color: #40b4ac;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #666;
  padding: 1rem 0;
`;

const SelectedVenues: React.FC<SelectedVenuesProps> = ({ venues, onRemoveVenue }) => {
  if (venues.length === 0) {
    return (
      <Container>
        <Title>Selected Venues</Title>
        <EmptyState>
          <p>No venues selected yet</p>
        </EmptyState>
      </Container>
    );
  }
  
  // In a real application, we would generate a unique ID for the crawl
  const crawlId = '123';
  
  return (
    <Container>
      <Title>
        Selected Venues
        <VenueCount>{venues.length}</VenueCount>
      </Title>
      
      <VenueList>
        {venues.map((venue, index) => (
          <VenueItem key={venue.id}>
            <VenueInfo>
              <VenueNumber>{index + 1}</VenueNumber>
              <VenueName>{venue.name}</VenueName>
            </VenueInfo>
            <RemoveButton onClick={() => onRemoveVenue(venue.id)}>×</RemoveButton>
          </VenueItem>
        ))}
      </VenueList>
      
      <OptimizeButton to={`/crawl/${crawlId}`}>
        Optimize Route
      </OptimizeButton>
    </Container>
  );
};

export default SelectedVenues; 