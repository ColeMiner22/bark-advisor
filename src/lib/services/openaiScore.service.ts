import { DogProfile } from '@/types/dogProfile';
import { Product } from '@/types/product';
import { CategoryScore, ProductScore } from '@/types/score';

// Define interfaces for the response types
export interface ProductScore {
  score: number;
  explanation: string;
  similarProducts?: ProductRecommendation[];
}

export interface ProductRecommendation {
  name: string;
  score: number;
  reason: string;
  similarProducts?: ProductRecommendation[];
}

/**
 * Get a recommendation score for a product or category based on a dog's profile
 * @param dogProfile The dog's profile information
 * @param query The product name or category to evaluate
 * @returns A score and explanation for a product, or a list of recommended products for a category
 */
export const getRecommendation = async (
  dogProfile: DogProfileInput,
  query: string
): Promise<ProductScore | ProductRecommendation[]> => {
  try {
    console.log('[Frontend] Making request to /api/recommend with:', {
      dogProfile,
      query
    });
    
    // Call our API route
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dogProfile,
        query
      })
    });

    console.log('[Frontend] API response status:', response.status);
    
    // Log the raw response for debugging
    const responseText = await response.text();
    console.log('[Frontend] Raw API response:', responseText);
    
    // Check if the response is successful
    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        console.error('[Frontend] Failed to parse error response:', e);
      }
      throw new Error(errorMessage);
    }

    // Parse the response
    let result;
    try {
      result = JSON.parse(responseText);
      console.log('[Frontend] Parsed API response:', result);
    } catch (e) {
      console.error('[Frontend] Failed to parse success response:', e);
      throw new Error('Invalid JSON response from API');
    }
    
    // Validate the response format
    if (Array.isArray(result)) {
      // Category recommendation response
      if (!result.every((item: { name: string; score: number; reason: string }) => 
        typeof item.name === 'string' && 
        typeof item.score === 'number' && 
        typeof item.reason === 'string'
      )) {
        console.error('[Frontend] Invalid category recommendation format:', result);
        throw new Error('Invalid category recommendation format from API');
      }
      return result as ProductRecommendation[];
    } else {
      // Product score response
      if (typeof result.score !== 'number' || typeof result.explanation !== 'string') {
        console.error('[Frontend] Invalid product score format:', result);
        throw new Error('Invalid product score format from API');
      }
      return result as ProductScore;
    }
  } catch (error) {
    // Log the error
    console.error('[Frontend] Error in getRecommendation:', error);
    
    // Re-throw the error to be handled by the caller
    throw error;
  }
};

/**
 * Get a recommendation score for a product based on a dog's profile
 * @param dogProfile The dog's profile information
 * @param product The product name to evaluate
 * @returns A score and explanation for the product, along with similar product recommendations
 */
export async function getProductRecommendationScore(product: Product, dogProfile: DogProfile): Promise<ProductScore> {
  try {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product, dogProfile, type: 'product' })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.score || typeof result.score !== 'number') {
      throw new Error('Invalid score format in API response');
    }

    if (!result.explanation || typeof result.explanation !== 'string') {
      throw new Error('Missing or invalid explanation in API response');
    }

    return {
      score: result.score,
      explanation: result.explanation,
      similarProducts: Array.isArray(result.similarProducts) ? result.similarProducts : []
    };
  } catch (error) {
    console.error('Error getting product recommendation:', error);
    throw error;
  }
}

/**
 * Get category recommendations based on a dog's profile
 * @param dogProfile The dog's profile information
 * @param page The page number (1-based) to fetch, defaults to 1
 * @param itemsPerPage The number of items per page, defaults to 4
 * @returns An object containing the recommendations and pagination info
 */
export async function getCategoryRecommendations(
  dogProfile: DogProfile,
  page: number = 1,
  itemsPerPage: number = 4
): Promise<{ recommendations: CategoryScore[]; hasMore: boolean; totalItems: number }> {
  try {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dogProfile, type: 'category' })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
    if (!Array.isArray(result)) {
      throw new Error('Invalid response format: expected array of category recommendations');
    }

    const validatedRecommendations = result
      .filter(item => item && typeof item.score === 'number' && typeof item.category === 'string')
      .sort((a, b) => b.score - a.score);

    const totalItems = validatedRecommendations.length;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRecommendations = validatedRecommendations.slice(startIndex, endIndex);

    return {
      recommendations: paginatedRecommendations,
      hasMore: endIndex < totalItems,
      totalItems
    };
  } catch (error) {
    console.error('Error getting category recommendations:', error);
    throw error;
  }
} 