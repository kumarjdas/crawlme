import axios, { AxiosError } from 'axios';
import { Restaurant } from '../types/Restaurant';
import { SearchParams } from '../components/SearchForm';

// Note: In a production environment, this would be handled by a backend service
// to keep the API key secure. For demonstration purposes, we're using a frontend service.

// Replace this with your actual Yelp API key
// In a real application, this would be stored in environment variables
const YELP_API_KEY = 'HbvkHaKWzeqi8_74yOW4uaTZ3McM0XOe-Tt4fcLr3HUXbto57jcUPQih54g3zKVte77MuYoHameTLmHhErdb4kIT9EOGOsO_hrvQoW2R6GEyl_eYccW5Qf7rP0LfZ3Yx';

// The base URL for the Yelp API with CORS Anywhere proxy
// You need to request temporary access at https://cors-anywhere.herokuapp.com/corsdemo
const YELP_BASE_URL = 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3';

// Create an axios instance for Yelp API calls
const yelpApi = axios.create({
  baseURL: YELP_BASE_URL,
  headers: {
    Authorization: `Bearer ${YELP_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
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
  distance?: number;
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
    imageUrl: business.image_url || 'https://via.placeholder.com/150?text=No+Image',
    address: `${business.location.address1 || ''}, ${business.location.city}, ${business.location.state} ${business.location.zip_code}`,
    categories: business.categories.map(category => category.title),
    coordinates: business.coordinates,
    phone: business.display_phone,
    url: business.url,
    // Convert meters to miles if distance is provided by Yelp API
    distance: business.distance ? +(business.distance / 1609.34).toFixed(1) : undefined
  };
};

// Format error messages for better debugging
const formatErrorMessage = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return `API Error ${axiosError.response.status}: ${JSON.stringify(axiosError.response.data)}`;
    } else if (axiosError.request) {
      // The request was made but no response was received
      if (axiosError.code === 'ECONNABORTED') {
        return 'The request timed out. Please try again.';
      }
      return 'No response received from the server. Please check your internet connection.';
    } else {
      // Something happened in setting up the request that triggered an Error
      return `Request Error: ${axiosError.message}`;
    }
  }
  
  // For non-Axios errors
  return error.message || 'An unknown error occurred';
};

// Service methods
export const YelpService = {
  // Search restaurants based on parameters
  searchRestaurants: async (params: SearchParams): Promise<Restaurant[]> => {
    try {
      console.log('Searching for restaurants with params:', params);
      
      // Note: In a production app, these params would be validated and sanitized
      const { foodCategory, location, radius, priceFilter } = params;
      
      // Convert radius from miles to meters (Yelp API uses meters)
      const radiusInMeters = Math.round(radius * 1609.34);
      
      // Convert price filter array to comma-separated string for Yelp API
      const priceString = priceFilter.map((price: string) => price.length).join(',');
      
      console.log(`Making API request to Yelp for ${foodCategory} in ${location}`);
      
      const response = await yelpApi.get<YelpSearchResponse>('/businesses/search', {
        params: {
          term: foodCategory,
          location,
          radius: radiusInMeters,
          price: priceString,
          limit: 20,
          sort_by: 'best_match'
        }
      });
      
      console.log(`Received ${response.data.businesses.length} results from Yelp`);
      
      // No longer filtering by rating threshold since it's not in the SearchParams
      const businesses = response.data.businesses;
      
      console.log(`Returning ${businesses.length} results`);
      
      // Map to our Restaurant type
      return businesses.map(mapYelpBusinessToRestaurant);
    } catch (error) {
      // Handle errors with formatted messages
      const errorMessage = formatErrorMessage(error);
      console.error(`Yelp API Error: ${errorMessage}`);
      
      // For CORS or network issues, provide helpful guidance
      if (axios.isAxiosError(error)) {
        // For 403 errors related to CORS Anywhere
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          console.error('You may need to request temporary access to the CORS Anywhere demo server:');
          console.error('Visit https://cors-anywhere.herokuapp.com/corsdemo and click the button');
        }
      }
      
      // For demo purposes, return mock data
      console.log('Falling back to mock data');
      return getMockRestaurants(params);
    }
  }
};

// Mock data for development/demo purposes with location awareness
const getMockRestaurants = (params?: SearchParams): Restaurant[] => {
  // Use search parameters to customize mock data if available
  const locationName = params?.location || 'San Francisco, CA';
  const category = params?.foodCategory || 'Food';
  
  // Generate random distances for the mock restaurants
  const generateDistance = (min: number, max: number): number => {
    return +(min + Math.random() * (max - min)).toFixed(1);
  };
  
  // Return more tailored mock data based on search parameters
  return [
    {
      id: '1',
      name: `Best ${category} Place`,
      rating: 4.5,
      price: '$$',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
      address: `123 Main St, ${locationName}`,
      categories: [category, 'American'],
      coordinates: { latitude: 37.7749, longitude: -122.4194 },
      distance: generateDistance(0.2, 1.5)
    },
    {
      id: '2',
      name: `Amazing ${category} Spot`,
      rating: 4.7,
      price: '$',
      imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500',
      address: `456 Elm St, ${locationName}`,
      categories: [category, 'Fusion'],
      coordinates: { latitude: 37.7850, longitude: -122.4100 },
      distance: generateDistance(0.5, 2)
    },
    {
      id: '3',
      name: `Perfect ${category} Joint`,
      rating: 4.2,
      price: '$$',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
      address: `789 Oak St, ${locationName}`,
      categories: [category, 'Gourmet'],
      coordinates: { latitude: 37.7950, longitude: -122.4300 },
      distance: generateDistance(0.8, 3)
    },
    {
      id: '4',
      name: `${category} Paradise`,
      rating: 4.8,
      price: '$$$',
      imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500',
      address: `101 Pine St, ${locationName}`,
      categories: [category, 'Fine Dining'],
      coordinates: { latitude: 37.7920, longitude: -122.4080 },
      distance: generateDistance(1, 4)
    },
    {
      id: '5',
      name: `${category} Express`,
      rating: 4.3,
      price: '$$',
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
      address: `202 Market St, ${locationName}`,
      categories: [category, 'Fast Casual'],
      coordinates: { latitude: 37.7890, longitude: -122.4150 },
      distance: generateDistance(1.2, 5)
    }
  ];
}; 