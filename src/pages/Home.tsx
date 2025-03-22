import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Hero = styled.section`
  width: 100%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.secondary} 100%);
  color: white;
  padding: 5rem 0;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background-color: white;
  color: ${props => props.theme.colors.primary};
  padding: 1rem 2rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  text-decoration: none;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const FeaturesSection = styled.section`
  padding: 5rem 0;
`;

const FeatureTitle = styled.h2`
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
  color: ${props => props.theme.colors.dark};
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const Feature = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.primary};
`;

const FeatureHeading = styled.h3`
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const Home: React.FC = () => {
  return (
    <HomeContainer>
      <Hero>
        <HeroContent>
          <HeroTitle>Plan Your Perfect Food Adventure</HeroTitle>
          <HeroSubtitle>
            Create optimized routes for exploring the best restaurants, cafes, and food spots in any city
          </HeroSubtitle>
          <CTAButton to="/plan">Start Planning</CTAButton>
        </HeroContent>
      </Hero>
      
      <FeaturesSection>
        <FeatureTitle>How It Works</FeatureTitle>
        <Features>
          <Feature>
            <FeatureIcon>🔍</FeatureIcon>
            <FeatureHeading>Search</FeatureHeading>
            <FeatureDescription>
              Find the best places to eat based on food category, location, rating, and more.
            </FeatureDescription>
          </Feature>
          
          <Feature>
            <FeatureIcon>📍</FeatureIcon>
            <FeatureHeading>Select</FeatureHeading>
            <FeatureDescription>
              Choose your favorite spots from search results to include in your food crawl.
            </FeatureDescription>
          </Feature>
          
          <Feature>
            <FeatureIcon>🗺️</FeatureIcon>
            <FeatureHeading>Optimize</FeatureHeading>
            <FeatureDescription>
              Get an optimized route that minimizes travel time between all your selected venues.
            </FeatureDescription>
          </Feature>
          
          <Feature>
            <FeatureIcon>⏱️</FeatureIcon>
            <FeatureHeading>Time Planning</FeatureHeading>
            <FeatureDescription>
              See estimated visit durations and travel times between venues.
            </FeatureDescription>
          </Feature>
          
          <Feature>
            <FeatureIcon>📱</FeatureIcon>
            <FeatureHeading>Mobile Friendly</FeatureHeading>
            <FeatureDescription>
              Access your food crawl plan on any device while you're on the go.
            </FeatureDescription>
          </Feature>
          
          <Feature>
            <FeatureIcon>📤</FeatureIcon>
            <FeatureHeading>Share</FeatureHeading>
            <FeatureDescription>
              Share your food crawl with friends or export it to your calendar.
            </FeatureDescription>
          </Feature>
        </Features>
      </FeaturesSection>
    </HomeContainer>
  );
};

export default Home; 