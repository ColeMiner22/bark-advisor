import { DogProfile, DogProfileInput } from '@/types/dog-profile';

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
      if (!result.every(item => 
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
export async function getProductRecommendationScore(
  dogProfile: DogProfileInput,
  product: string
): Promise<ProductScore> {
  console.log('[Service] Getting recommendation score for:', {
    dogProfile,
    product
  });

  try {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dogProfile,
        query: product
      }),
    });

    console.log('[Service] API response status:', response.status);

    // Get the response text first for better error handling
    const responseText = await response.text();
    console.log('[Service] Raw API response:', responseText);

    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('[Service] Parsed API response:', data);
    } catch (parseError) {
      console.error('[Service] Failed to parse API response:', parseError);
      throw new Error('Invalid JSON response from API');
    }

    // Check if the response contains an error
    if (!response.ok) {
      console.error('[Service] API error:', data);
      
      // Provide more detailed error information
      if (data.details) {
        throw new Error(`API error: ${data.error} - ${data.details}`);
      } else if (data.rawResponse) {
        throw new Error(`API error: ${data.error} - Raw response: ${data.rawResponse.substring(0, 100)}...`);
      } else {
        throw new Error(data.error || 'Failed to get recommendation');
      }
    }

    // Validate the response format
    if (typeof data.score !== 'number' || !data.explanation) {
      console.error('[Service] Invalid response format:', data);
      
      // Try to fix common issues
      if (data && typeof data === 'object') {
        // Check if the score is a string that can be converted to a number
        if (typeof data.score === 'string') {
          const parsedScore = parseInt(data.score, 10);
          if (!isNaN(parsedScore)) {
            data.score = parsedScore;
            console.log('[Service] Fixed score from string to number:', data.score);
          }
        }
        
        // Check if explanation is missing but reason exists
        if (!data.explanation && data.reason) {
          data.explanation = data.reason;
          console.log('[Service] Used reason as explanation');
        }
        
        // If we still don't have a valid score or explanation, throw an error
        if (typeof data.score !== 'number' || !data.explanation) {
          throw new Error('Invalid response format from API: Missing score or explanation');
        }
      } else {
        throw new Error('Invalid response format from API: Missing score or explanation');
      }
    }

    // Ensure similarProducts is an array
    if (!Array.isArray(data.similarProducts)) {
      console.log('[Service] similarProducts is not an array, setting to empty array');
      data.similarProducts = [];
    }

    return {
      score: data.score,
      explanation: data.explanation,
      similarProducts: data.similarProducts || []
    };
  } catch (error) {
    console.error('[Service] Error getting recommendation:', error);
    throw error;
  }
}

/**
 * Get category recommendations based on a dog's profile
 * @param dogProfile The dog's profile information
 * @param category The category to get recommendations for
 * @returns An array of product recommendations for the category
 */
export async function getCategoryRecommendations(
  dogProfile: DogProfileInput,
  category: string
): Promise<ProductRecommendation[]> {
  console.log('[Service] Getting category recommendations for:', {
    dogProfile,
    category
  });

  try {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dogProfile,
        query: category
      }),
    });

    console.log('[Service] API response status:', response.status);

    // Get the response text first for better error handling
    const responseText = await response.text();
    console.log('[Service] Raw API response:', responseText);

    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('[Service] Parsed API response:', data);
    } catch (parseError) {
      console.error('[Service] Failed to parse API response:', parseError);
      throw new Error('Invalid JSON response from API');
    }

    // Check if the response contains an error
    if (!response.ok) {
      console.error('[Service] API error:', data);
      
      // Provide more detailed error information
      if (data.details) {
        throw new Error(`API error: ${data.error} - ${data.details}`);
      } else if (data.rawResponse) {
        throw new Error(`API error: ${data.error} - Raw response: ${data.rawResponse.substring(0, 100)}...`);
      } else {
        throw new Error(data.error || 'Failed to get recommendations');
      }
    }

    // Validate the response format
    if (!Array.isArray(data) || data.length === 0) {
      console.error('[Service] Invalid response format:', data);
      
      // Try to fix common issues
      if (data && typeof data === 'object') {
        // Check if data is an object with a recommendations array
        if (Array.isArray(data.recommendations)) {
          data = data.recommendations;
          console.log('[Service] Used recommendations array from response object');
        } else if (Array.isArray(data.products)) {
          data = data.products;
          console.log('[Service] Used products array from response object');
        } else {
          throw new Error('Invalid response format from API: Expected an array of recommendations');
        }
      } else {
        throw new Error('Invalid response format from API: Expected an array of recommendations');
      }
    }

    // Validate each recommendation
    const validatedRecommendations = data.map((rec: any) => {
      // Ensure each recommendation has the required fields
      if (!rec.name || typeof rec.score === 'undefined' || !rec.reason) {
        console.warn('[Service] Invalid recommendation format:', rec);
      }
      
      return {
        name: rec.name || rec.product || 'Unknown Product',
        score: typeof rec.score === 'number' ? rec.score : 
               typeof rec.score === 'string' ? parseInt(rec.score, 10) || 0 : 0,
        reason: rec.reason || rec.explanation || 'No reason provided'
      };
    });

    return validatedRecommendations;
  } catch (error) {
    console.error('[Service] Error getting category recommendations:', error);
    throw error;
  }
} 