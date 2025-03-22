import React, { useState } from 'react';
import styled from 'styled-components';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

export interface SearchParams {
  foodCategory: string;
  location: string;
  radius: number;
  priceLevel: string[];
  ratingThreshold: number;
}

const FormContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const FormTitle = styled.h2`
  font-size: ${props => props.theme.fontSizes.large};
  margin-bottom: 1.5rem;
  color: ${props => props.theme.colors.dark};
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
  }
`;

const SliderContainer = styled.div`
  margin-top: 1rem;
`;

const SliderValue = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`;

const Slider = styled.input`
  width: 100%;
  margin-top: 0.5rem;
`;

const CheckboxGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`;

const Checkbox = styled.input`
  cursor: pointer;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #ff5252;
  }
  
  &:disabled {
    background-color: #ddd;
    cursor: not-allowed;
  }
`;

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [foodCategory, setFoodCategory] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(2);
  const [priceLevel, setPriceLevel] = useState<string[]>(['$', '$$', '$$$', '$$$$']);
  const [ratingThreshold, setRatingThreshold] = useState(3);
  
  const handlePriceToggle = (price: string) => {
    if (priceLevel.includes(price)) {
      setPriceLevel(priceLevel.filter(p => p !== price));
    } else {
      setPriceLevel([...priceLevel, price]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSearch({
      foodCategory,
      location,
      radius,
      priceLevel,
      ratingThreshold
    });
  };
  
  return (
    <FormContainer>
      <FormTitle>Find Restaurants</FormTitle>
      
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="foodCategory">Food Category</Label>
          <Input
            type="text"
            id="foodCategory"
            placeholder="e.g., burgers, tacos, desserts"
            value={foodCategory}
            onChange={(e) => setFoodCategory(e.target.value)}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="location">Location</Label>
          <Input
            type="text"
            id="location"
            placeholder="Address, neighborhood, or city"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="radius">Search Radius: {radius} miles</Label>
          <SliderContainer>
            <SliderValue>
              <span>0.5 miles</span>
              <span>10 miles</span>
            </SliderValue>
            <Slider
              type="range"
              id="radius"
              min={0.5}
              max={10}
              step={0.5}
              value={radius}
              onChange={(e) => setRadius(parseFloat(e.target.value))}
            />
          </SliderContainer>
        </FormGroup>
        
        <FormGroup>
          <Label>Price Range</Label>
          <CheckboxGroup>
            <CheckboxLabel>
              <Checkbox
                type="checkbox"
                checked={priceLevel.includes('$')}
                onChange={() => handlePriceToggle('$')}
              />
              $
            </CheckboxLabel>
            <CheckboxLabel>
              <Checkbox
                type="checkbox"
                checked={priceLevel.includes('$$')}
                onChange={() => handlePriceToggle('$$')}
              />
              $$
            </CheckboxLabel>
            <CheckboxLabel>
              <Checkbox
                type="checkbox"
                checked={priceLevel.includes('$$$')}
                onChange={() => handlePriceToggle('$$$')}
              />
              $$$
            </CheckboxLabel>
            <CheckboxLabel>
              <Checkbox
                type="checkbox"
                checked={priceLevel.includes('$$$$')}
                onChange={() => handlePriceToggle('$$$$')}
              />
              $$$$
            </CheckboxLabel>
          </CheckboxGroup>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="rating">Minimum Rating: {ratingThreshold}⭐</Label>
          <SliderContainer>
            <SliderValue>
              <span>1⭐</span>
              <span>5⭐</span>
            </SliderValue>
            <Slider
              type="range"
              id="rating"
              min={1}
              max={5}
              step={0.5}
              value={ratingThreshold}
              onChange={(e) => setRatingThreshold(parseFloat(e.target.value))}
            />
          </SliderContainer>
        </FormGroup>
        
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </SubmitButton>
      </form>
    </FormContainer>
  );
};

export default SearchForm; 