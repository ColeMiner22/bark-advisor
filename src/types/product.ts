export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  brand?: string;
  ingredients?: string[];
  features?: string[];
  rating?: number;
  reviews?: number;
} 