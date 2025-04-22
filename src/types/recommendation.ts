import { Product } from './product';

export interface ProductRecommendation {
  name: string;
  score: number;
  reason: string;
  asin?: string;
}

export interface CategoryRecommendation {
  name: string;
  score: number;
  explanation: string;
  asin?: string;
}

export interface PaginatedCategoryRecommendations {
  recommendations: CategoryRecommendation[];
  hasMore: boolean;
  totalItems: number;
}

export interface ProductRecommendationResponse {
  score: number;
  explanation: string;
  similarProducts: ProductRecommendation[];
} 