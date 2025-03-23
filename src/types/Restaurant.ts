export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  price: string;
  imageUrl: string;
  address: string;
  categories: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  hours?: {
    open: string;
    close: string;
  }[];
  phone?: string;
  url?: string;
  distance?: number;
} 