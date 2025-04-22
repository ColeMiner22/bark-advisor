import { Product } from './product';

export interface ProductRecommendation {
  product: Product;
  score: number;
  explanation: string;
}

export interface CategoryRecommendation {
  category: string;
  score: number;
  explanation: string;
}

export interface PaginatedCategoryRecommendations {
  recommendations: CategoryRecommendation[];
  hasMore: boolean;
  totalItems: number;
}

export interface ProductRecommendationResponse {
  score: number;
  explanation: string;
  similarProducts?: Product[];
} 