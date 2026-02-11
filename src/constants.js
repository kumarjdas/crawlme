export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const DEFAULT_SEARCH_PARAMS = {
    foodType: 'burgers',
    radius: 5, // miles
    stops: 10
};

export const GOOGLE_MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID || 'DEMO_MAP_ID';
export const MAP_LIBRARIES = ['places', 'geometry', 'marker'];
