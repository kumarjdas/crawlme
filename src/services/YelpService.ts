import axios from 'axios';
import { Restaurant } from '../types/Restaurant';
import { SearchParams } from '../components/SearchForm';

// Note: In a production environment, this would be handled by a backend service
// to keep the API key secure. For demonstration purposes, we're using a frontend service.

// This is a placeholder for the Yelp API key
// In a real application, this would be stored in environment variables
const YELP_API_KEY = 'YOUR_YELP_API_KEY_HERE';

// The base URL for the Yelp API
const YELP_BASE_URL = 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3';

// Create an axios instance for Yelp API calls
const yelpApi = axios.create({
  baseURL: YELP_BASE_URL,
  headers: {
    Authorization: `Bearer ${YELP_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export interface YelpBusinessResponse {
  id: string;
  name: string;
  rating: number;
  price?: string;
  image_url: string;
  location: {
    address1: string;
    city: string;
    state: string;
    zip_code: string;
  };
  categories: Array<{
    alias: string;
    title: string;
  }>;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  display_phone: string;
  url: string;
}

export interface YelpSearchResponse {
  businesses: YelpBusinessResponse[];
  total: number;
  region: {
    center: {
      latitude: number;
      longitude: number;
    };
  };
}

// Convert Yelp business data to our Restaurant type
const mapYelpBusinessToRestaurant = (business: YelpBusinessResponse): Restaurant => {
  return {
    id: business.id,
    name: business.name,
    rating: business.rating,
    price: business.price || '$',
    imageUrl: business.image_url,
    address: `${business.location.address1}, ${business.location.city}, ${business.location.state} ${business.location.zip_code}`,
    categories: business.categories.map(category => category.title),
    coordinates: business.coordinates,
    phone: business.display_phone,
    url: business.url
  };
};

// Service methods
export const YelpService = {
  // Search restaurants based on parameters
  searchRestaurants: async (params: SearchParams): Promise<Restaurant[]> => {
    try {
      // Note: In a production app, these params would be validated and sanitized
      const { foodCategory, location, radius, priceLevel, ratingThreshold } = params;
      
      // Convert radius from miles to meters (Yelp API uses meters)
      const radiusInMeters = Math.round(radius * 1609.34);
      
      // Convert price level array to comma-separated string
      const priceFilter = priceLevel.map(price => price.length).join(',');
      
      const response = await yelpApi.get<YelpSearchResponse>('/businesses/search', {
        params: {
          term: foodCategory,
          location,
          radius: radiusInMeters,
          price: priceFilter,
          limit: 20,
          sort_by: 'rating'
        }
      });
      
      // Filter by rating threshold if needed (can also be done on frontend)
      const filteredBusinesses = response.data.businesses.filter(
        business => business.rating >= ratingThreshold
      );
      
      // Map to our Restaurant type
      return filteredBusinesses.map(mapYelpBusinessToRestaurant);
    } catch (error) {
      console.error('Error searching restaurants:', error);
      // For demo purposes, return mock data
      return getMockRestaurants();
    }
  }
};

// Mock data for development/demo purposes
const getMockRestaurants = (): Restaurant[] => {
  return [
    {
      id: '1',
      name: 'Delicious Burger Joint',
      rating: 4.5,
      price: '$$',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
      address: '123 Main St, San Francisco, CA 94105',
      categories: ['Burgers', 'American'],
      coordinates: { latitude: 37.7749, longitude: -122.4194 }
    },
    {
      id: '2',
      name: 'Amazing Taco Place',
      rating: 4.7,
      price: '$',
      imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500',
      address: '456 Elm St, San Francisco, CA 94108',
      categories: ['Mexican', 'Tacos'],
      coordinates: { latitude: 37.7850, longitude: -122.4100 }
    },
    {
      id: '3',
      name: 'Perfect Pizza Spot',
      rating: 4.2,
      price: '$$',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
      address: '789 Oak St, San Francisco, CA 94110',
      categories: ['Pizza', 'Italian'],
      coordinates: { latitude: 37.7950, longitude: -122.4300 }
    },
    {
      id: '4',
      name: 'Sushi Paradise',
      rating: 4.8,
      price: '$$$',
      imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500',
      address: '101 Pine St, San Francisco, CA 94111',
      categories: ['Japanese', 'Sushi'],
      coordinates: { latitude: 37.7920, longitude: -122.4080 }
    },
    {
      id: '5',
      name: 'Noodle House',
      rating: 4.3,
      price: '$$',
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
      address: '202 Market St, San Francisco, CA 94103',
      categories: ['Chinese', 'Noodles'],
      coordinates: { latitude: 37.7890, longitude: -122.4150 }
    }
  ];
}; 