import { DogProfileInput } from '@/types/dogProfile';
import { Product } from '@/types/product';
import { ProductRecommendationResponse, CategoryRecommendation, PaginatedCategoryRecommendations } from '@/types/recommendation';

// Define interfaces for the response types
export interface ProductScore {
  score: number;
  reason: string;
}

export interface ProductRecommendation {
  name: string;
  score: number;
  reason: string;
  similarProducts?: string[];
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
      if (typeof result.score !== 'number' || typeof result.reason !== 'string') {
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
    
    if (typeof result.score !== 'number' || typeof result.reason !== 'string') {
      throw new Error('Invalid product recommendation format');
    }

    return {
      score: result.score,
      reason: result.reason,
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
 * @param itemsPerPage The number of items per page, defaults to 10
 * @param query Optional query to filter recommendations
 * @returns An object containing the recommendations and pagination info
 */
export async function getCategoryRecommendations(
  dogProfile: DogProfileInput,
  page: number = 1,
  itemsPerPage: number = 10,
  query?: string
): Promise<PaginatedCategoryRecommendations> {
  try {
    console.log('Fetching category recommendations with:', { 
      page, 
      itemsPerPage,
      query,
      dogProfile 
    });

    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        dogProfile,
        query: query || 'dog products',
        type: 'category'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Raw API response:', data);

    // Handle both array and object responses
    let recommendations: CategoryRecommendation[] = [];
    
    if (Array.isArray(data)) {
      recommendations = data;
    } else if (typeof data === 'object' && data !== null) {
      // If the response is an object, try to extract recommendations
      if (Array.isArray(data.recommendations)) {
        recommendations = data.recommendations;
      } else if (Array.isArray(data.similarProducts)) {
        recommendations = data.similarProducts.map((item: any) => ({
          name: item.name,
          score: item.score,
          reason: item.reason,
          asin: item.asin
        }));
      }
    }

    // Validate and filter recommendations
    const validRecommendations = recommendations
      .filter((item): item is CategoryRecommendation => {
        return (
          typeof item === 'object' &&
          item !== null &&
          typeof item.name === 'string' &&
          typeof item.score === 'number' &&
          typeof item.reason === 'string'
        );
      })
      .sort((a, b) => b.score - a.score);

    if (validRecommendations.length === 0) {
      // If no valid recommendations, return default recommendations based on the query
      type DefaultRecommendation = {
        name: string;
        score: number;
        reason: string;
        asin: string;
      };

      type DefaultRecommendations = {
        [key: string]: DefaultRecommendation[];
      };

      const defaultRecommendations: DefaultRecommendations = {
        'dog food': [
          {
            name: "Blue Buffalo Life Protection Formula Adult Dog Food",
            score: 90,
            reason: "A premium dry dog food suitable for most adult dogs, made with real chicken as the first ingredient. Contains a blend of antioxidants, vitamins, and minerals to support immune system health.",
            asin: "B0018CGY4G"
          },
          {
            name: "Hill's Science Diet Adult Perfect Weight Dry Dog Food",
            score: 88,
            reason: "Specially formulated for weight management, this food helps maintain lean muscle while supporting a healthy weight. Contains high-quality protein and natural fibers.",
            asin: "B00N3L7Z9W"
          },
          {
            name: "Purina Pro Plan Sensitive Skin & Stomach Salmon & Rice Formula",
            score: 87,
            reason: "Ideal for dogs with sensitive stomachs, this formula features salmon as the first ingredient and includes prebiotic fiber for digestive health.",
            asin: "B01N7J3ELX"
          },
          {
            name: "Royal Canin Small Breed Adult Dry Dog Food",
            score: 86,
            reason: "Specifically designed for small breed dogs, with an optimal kibble size and balanced nutrition for their unique needs.",
            asin: "B0018CGY4G"
          },
          {
            name: "Wellness Complete Health Natural Dry Dog Food",
            score: 85,
            reason: "Made with premium proteins and wholesome grains, this food supports overall health with antioxidants, probiotics, and omega fatty acids.",
            asin: "B0018CGY4G"
          }
        ],
        'treats': [
          {
            name: "Blue Buffalo Blue Bits Soft-Moist Training Dog Treats",
            score: 92,
            reason: "Perfect for training, these soft treats are made with real meat and contain no artificial flavors or preservatives.",
            asin: "B0018CGY4G"
          },
          {
            name: "Zuke's Mini Naturals Dog Treats",
            score: 90,
            reason: "Small, soft treats ideal for training, made with real meat and no artificial ingredients.",
            asin: "B0018CGY4G"
          }
        ],
        'toys': [
          {
            name: "KONG Classic Dog Toy",
            score: 95,
            reason: "Durable rubber toy that's great for chewing and can be stuffed with treats for extended play.",
            asin: "B0002DHG4E"
          },
          {
            name: "Nylabone Dura Chew Textured Ring",
            score: 88,
            reason: "Long-lasting chew toy that helps clean teeth and satisfies natural chewing instincts.",
            asin: "B0018CGY4G"
          }
        ]
      };

      const queryLower = (query || '').toLowerCase();
      const matchingRecommendations = defaultRecommendations[queryLower] || defaultRecommendations['dog food'];
      
      return {
        recommendations: matchingRecommendations.slice(0, itemsPerPage),
        pagination: {
          currentPage: 1,
          totalPages: Math.ceil(matchingRecommendations.length / itemsPerPage),
          totalItems: matchingRecommendations.length,
          itemsPerPage
        }
      };
    }

    const totalItems = validRecommendations.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return {
      recommendations: validRecommendations.slice(startIndex, endIndex),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage
      }
    };
  } catch (error) {
    console.error('Error in getCategoryRecommendations:', error);
    throw error;
  }
}

export async function getProductScore(
  dogProfile: DogProfileInput,
  productName: string
): Promise<ProductRecommendationResponse> {
  try {
    console.log('Fetching product score for:', productName);
    console.log('Dog profile:', dogProfile);

    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dogProfile, productName }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw API response:', data);

    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid API response format: expected an object');
    }

    if (typeof data.score !== 'number' || typeof data.reason !== 'string') {
      throw new Error('Invalid API response format: missing required fields');
    }

    return {
      score: data.score,
      reason: data.reason,
      asin: data.asin
    };
  } catch (error) {
    console.error('Error fetching product score:', error);
    throw error;
  }
} 