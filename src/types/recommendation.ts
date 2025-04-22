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
  reason: string;
  asin: string;
  price?: string;
  affiliateLink: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaginatedCategoryRecommendations {
  recommendations: CategoryRecommendation[];
  pagination: PaginationInfo;
}

export interface ProductRecommendationResponse {
  score: number;
  reason: string;
  asin?: string;
  similarProducts?: string[];
} 