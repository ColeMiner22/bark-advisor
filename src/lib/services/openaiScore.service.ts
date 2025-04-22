import { DogProfileInput } from '@/types/dogProfile';
import { Product } from '@/types/product';
import { ProductRecommendationResponse, CategoryRecommendation, PaginatedCategoryRecommendations } from '@/types/recommendation';

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
 * @param product The product to evaluate
 * @param dogProfile The dog's profile information
 * @returns A score and explanation for the product, along with similar product recommendations
 */
export async function getProductRecommendationScore(
  product: Product,
  dogProfile: DogProfileInput
): Promise<ProductRecommendationResponse> {
  try {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        dogProfile,
        query: product.name,
        type: 'product'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
    if (typeof result.score !== 'number' || typeof result.explanation !== 'string') {
      throw new Error('Invalid product recommendation format');
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
 * @param category The category to search for
 * @param page The page number (1-based) to fetch, defaults to 1
 * @param itemsPerPage The number of items per page, defaults to 4
 * @returns An object containing the recommendations and pagination info
 */
export async function getCategoryRecommendations(
  dogProfile: DogProfileInput,
  category: string,
  page: number = 1,
  itemsPerPage: number = 4
): Promise<PaginatedCategoryRecommendations> {
  try {
    console.log('Fetching category recommendations for:', {
      category,
      page,
      itemsPerPage,
      dogProfile: {
        name: dogProfile.name,
        breed: dogProfile.breed,
        weight: dogProfile.weight,
        age: dogProfile.age
      }
    });

    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dogProfile,
        query: category
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(errorData.error || 'Failed to fetch recommendations');
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from API');
    }

    // Sort recommendations by score
    const sortedRecommendations = data.sort((a, b) => b.score - a.score);

    // Calculate pagination
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRecommendations = sortedRecommendations.slice(startIndex, endIndex);

    return {
      recommendations: paginatedRecommendations,
      hasMore: endIndex < sortedRecommendations.length,
      totalItems: sortedRecommendations.length
    };
  } catch (error) {
    console.error('Error in getCategoryRecommendations:', error);
    throw error;
  }
} 