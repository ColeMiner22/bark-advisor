import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { DogProfileInput } from '@/types/dog-profile';

// Define interfaces for the response types
interface ProductScore {
  name: string;
  score: number;
  reason: string;
}

interface ProductRecommendation {
  score: number;
  explanation: string;
  similarProducts: ProductScore[];
}

// Common product categories for matching
const PRODUCT_CATEGORIES = [
  'Dog Food',
  'Treats',
  'Toys',
  'Dental Chews',
  'Grooming Supplies',
  'Beds',
  'Collars',
  'Leashes',
  'Training Equipment',
  'Supplements',
  'Medications',
  'Bowls',
  'Crates',
  'Clothing',
  'Accessories'
];

// Helper function to check if a query is a category
function isCategory(query: string): boolean {
  const normalizedQuery = query.toLowerCase().trim();
  const isCategoryMatch = PRODUCT_CATEGORIES.some(category => 
    category.toLowerCase().trim() === normalizedQuery
  );
  console.log('[API] Category check:', {
    query: normalizedQuery,
    isCategory: isCategoryMatch,
    matchingCategory: PRODUCT_CATEGORIES.find(category => 
      category.toLowerCase().trim() === normalizedQuery
    )
  });
  return isCategoryMatch;
}

// Helper function to generate the product evaluation prompt
function generateProductPrompt(dogProfile: DogProfileInput, productName: string): string {
  return `You are an expert pet advisor. Please provide product recommendations based on the following dog profile:

- Dog Name: ${dogProfile.name}
- Breed: ${dogProfile.breed}
- Weight: ${dogProfile.weight} lbs
- Age: ${dogProfile.age} years
- Health Issues: ${dogProfile.vet_issues || 'None'}
- Dietary Restrictions: ${dogProfile.dietary_restrictions || 'None'}

For the product "${productName}", provide the following information:
1. Score (out of 100) based on suitability for this dog
2. A detailed explanation of why this product is suitable or not suitable for the dog

Please also recommend 3 similar products with scores and explanations.

IMPORTANT: Your response must be valid JSON only, with no additional text before or after the JSON.

Here is the exact JSON format for your response:

{
  "score": 85,
  "explanation": "Detailed explanation for why the product is suitable.",
  "similarProducts": [
    {
      "name": "Similar Product 1",
      "score": 90,
      "reason": "Explanation for similar product 1."
    },
    {
      "name": "Similar Product 2",
      "score": 88,
      "reason": "Explanation for similar product 2."
    },
    {
      "name": "Similar Product 3",
      "score": 87,
      "reason": "Explanation for similar product 3."
    }
  ]
}

If you cannot find relevant products, provide a message like: "No suitable product found for this dog."`;
}

// Helper function to generate the category recommendation prompt
function generateCategoryPrompt(dogProfile: DogProfileInput, category: string): string {
  console.log('[API] Generating category prompt for:', category);
  const prompt = `You are an expert pet advisor. Please provide product recommendations based on the following dog profile:

- Dog Name: ${dogProfile.name}
- Breed: ${dogProfile.breed}
- Weight: ${dogProfile.weight} lbs
- Age: ${dogProfile.age} years
- Health Issues: ${dogProfile.vet_issues || 'None'}
- Dietary Restrictions: ${dogProfile.dietary_restrictions || 'None'}

Recommend 4 top-rated ${category} for this dog.

For each product, provide the following information:
1. Name of the product
2. Score (out of 100) based on suitability for this dog
3. A brief explanation of why this product is suitable for the dog

IMPORTANT: Your response must be valid JSON only, with no additional text before or after the JSON.

Here is the exact JSON format for your response:

[
  {
    "name": "Product Name 1",
    "score": 90,
    "reason": "Explanation for product 1."
  },
  {
    "name": "Product Name 2",
    "score": 88,
    "reason": "Explanation for product 2."
  },
  {
    "name": "Product Name 3",
    "score": 87,
    "reason": "Explanation for product 3."
  },
  {
    "name": "Product Name 4",
    "score": 85,
    "reason": "Explanation for product 4."
  }
]`;
  console.log('[API] Generated prompt:', prompt);
  return prompt;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { dogProfile, query } = body;

    console.log('[API] Received request with:', {
      dogProfile,
      query,
      queryType: typeof query
    });

    // Validate required fields
    if (!dogProfile || !query) {
      console.error('[API] Missing required fields:', { dogProfile, query });
      return NextResponse.json(
        { error: 'Missing required fields: dogProfile and query' },
        { status: 400 }
      );
    }

    // Validate dog profile fields
    if (!dogProfile.name || !dogProfile.breed || !dogProfile.weight || !dogProfile.age) {
      console.error('[API] Invalid dog profile:', dogProfile);
      return NextResponse.json(
        { error: 'Invalid dog profile: name, breed, weight, and age are required' },
        { status: 400 }
      );
    }

    // Log the received dog profile name for debugging
    console.log('[API] Received request for dog:', dogProfile.name);

    // Check if this is a category search
    const isCategorySearch = isCategory(query);
    console.log('[API] Is category search:', isCategorySearch);

    // Generate the appropriate prompt
    const prompt = isCategorySearch 
      ? generateCategoryPrompt(dogProfile, query)
      : generateProductPrompt(dogProfile, query);

    console.log('[API] Using prompt:', prompt);

    // Call OpenAI API
    console.log('[API] Calling OpenAI API...');
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a knowledgeable dog product expert. Analyze products and provide scores and recommendations based on a dog's profile. 
CRITICAL: Your response MUST be valid JSON only. No text before or after. No markdown. No code blocks.
For category searches, respond with this EXACT format:
[
  {
    "name": "Product Name",
    "score": 90,
    "reason": "Brief reason"
  }
]

For product searches, respond with this EXACT format:
{
  "score": 85,
  "explanation": "Detailed explanation",
  "similarProducts": [
    {
      "name": "Product Name",
      "score": 90,
      "reason": "Brief reason"
    }
  ]
}`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    // Extract JSON from response
    const rawResponse = response.choices[0].message.content?.trim() || '';
    console.log('[API] Raw OpenAI response:', rawResponse);

    // Try to parse the JSON response
    let parsedResult;
    try {
      // First attempt: direct parse
      parsedResult = JSON.parse(rawResponse);
      console.log('[API] Successfully parsed JSON response:', parsedResult);
    } catch (error) {
      console.log('[API] Initial JSON parse failed, attempting fixes...', error);
      
      // Second attempt: fix common JSON formatting issues
      let fixedJson = rawResponse
        .replace(/```json\n?|\n?```/g, '') // Remove code blocks
        .replace(/^[^{[]*/, '') // Remove text before first { or [
        .replace(/[^}\]]*$/, '') // Remove text after last } or ]
        .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3') // Fix unquoted keys
        .replace(/'/g, '"') // Replace single quotes
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/\n/g, ' ') // Remove newlines
        .trim();

      console.log('[API] Attempting to parse fixed JSON:', fixedJson);
      
      try {
        parsedResult = JSON.parse(fixedJson);
        console.log('[API] Successfully parsed fixed JSON:', parsedResult);
      } catch (secondError) {
        console.error('[API] Failed to parse fixed JSON:', secondError);
        return NextResponse.json(
          { 
            error: 'Invalid response format from AI',
            details: 'The AI response could not be parsed as valid JSON. Please try again.',
            rawResponse: rawResponse.substring(0, 200)
          },
          { status: 500 }
        );
      }
    }

    // Log the type of response we got
    console.log('[API] Response type:', {
      isArray: Array.isArray(parsedResult),
      hasScore: parsedResult?.score,
      hasExplanation: parsedResult?.explanation,
      hasSimilarProducts: parsedResult?.similarProducts,
      isCategorySearch
    });

    // Validate the parsed result
    if (isCategorySearch) {
      if (!Array.isArray(parsedResult)) {
        console.error('[API] Category search response is not an array:', parsedResult);
        // Try to extract array if it's wrapped
        if (parsedResult && Array.isArray(parsedResult.recommendations)) {
          parsedResult = parsedResult.recommendations;
        } else {
          return NextResponse.json(
            { 
              error: 'Invalid response format from AI',
              details: 'Category search response must be an array',
              rawResponse: rawResponse.substring(0, 200)
            },
            { status: 500 }
          );
        }
      }

      // Validate each recommendation
      const validatedRecommendations = parsedResult.map((rec: { name?: string; score?: number; reason?: string }, index: number) => {
        if (!rec.name || typeof rec.score !== 'number' || !rec.reason) {
          console.error(`[API] Invalid recommendation at index ${index}:`, rec);
          return {
            name: rec.name || 'Unknown Product',
            score: typeof rec.score === 'number' ? rec.score : 50,
            reason: rec.reason || 'No reason provided'
          };
        }
        return rec;
      });

      return NextResponse.json(validatedRecommendations);
    } else {
      // Product search validation
      if (!parsedResult.score || !parsedResult.explanation) {
        console.error('[API] Product search response missing required fields');
        return NextResponse.json(
          { 
            error: 'Invalid response format from AI',
            details: 'Product search response missing required fields',
            rawResponse: rawResponse.substring(0, 500)
          },
          { status: 500 }
        );
      }

      // Ensure score is a number
      if (typeof parsedResult.score !== 'number') {
        parsedResult.score = parseFloat(parsedResult.score);
        if (isNaN(parsedResult.score)) {
          parsedResult.score = 50; // Default score if parsing fails
        }
      }

      // Ensure similarProducts is an array
      if (!Array.isArray(parsedResult.similarProducts)) {
        parsedResult.similarProducts = [];
      }

      // Validate each similar product
      parsedResult.similarProducts = parsedResult.similarProducts.map((product: ProductScore, index: number) => {
        if (!product.name || typeof product.score !== 'number' || !product.reason) {
          console.error(`[API] Invalid similar product at index ${index}:`, product);
          return {
            name: product.name || 'Unknown Product',
            score: typeof product.score === 'number' ? product.score : 50,
            reason: product.reason || 'No reason provided'
          };
        }
        return product;
      });

      return NextResponse.json(parsedResult);
    }

  } catch (error) {
    console.error('[API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get recommendation';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 