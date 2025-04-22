import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { DogProfileInput } from '@/types/dogProfile';
import { ProductRecommendationResponse, CategoryRecommendation } from '@/types/recommendation';

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
  return PRODUCT_CATEGORIES.some(category => 
    category.toLowerCase().trim() === normalizedQuery
  );
}

// Helper function to generate the product evaluation prompt
function generateProductPrompt(dogProfile: DogProfileInput, productName: string): string {
  return `You are an expert pet advisor. Please provide product recommendations based on the following dog profile:

- Dog Name: ${dogProfile.name}
- Breed: ${dogProfile.breed}
- Weight: ${dogProfile.weight} lbs
- Age: ${dogProfile.age} years
- Health Issues: ${Array.isArray(dogProfile.healthIssues) ? dogProfile.healthIssues.join(', ') : dogProfile.healthIssues || 'None'}
- Dietary Restrictions: ${Array.isArray(dogProfile.dietaryRestrictions) ? dogProfile.dietaryRestrictions.join(', ') : dogProfile.dietaryRestrictions || 'None'}

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
}`;
}

// Helper function to generate the category recommendation prompt
function generateCategoryPrompt(dogProfile: DogProfileInput, category: string): string {
  return `You are an expert pet advisor. Please provide product recommendations based on the following dog profile:

- Dog Name: ${dogProfile.name}
- Breed: ${dogProfile.breed}
- Weight: ${dogProfile.weight} lbs
- Age: ${dogProfile.age} years
- Health Issues: ${Array.isArray(dogProfile.healthIssues) ? dogProfile.healthIssues.join(', ') : dogProfile.healthIssues || 'None'}
- Dietary Restrictions: ${Array.isArray(dogProfile.dietaryRestrictions) ? dogProfile.dietaryRestrictions.join(', ') : dogProfile.dietaryRestrictions || 'None'}

Recommend 9 top-rated ${category} for this dog, ordered from highest to lowest score.

For each product, provide the following information:
1. Name of the product (use real, specific product names)
2. Score (out of 100) based on suitability for this dog
3. A brief explanation of why this product is suitable for the dog
4. The Amazon ASIN (product ID) for the exact product. This should be a real ASIN for an existing product on Amazon.

IMPORTANT: Your response must be valid JSON only, with no additional text before or after the JSON.
Ensure products are ordered by score from highest to lowest.

Here is the exact JSON format for your response:

[
  {
    "name": "Product Name 1",
    "score": 95,
    "reason": "Explanation for product 1.",
    "asin": "B0XXXXXXXX"
  },
  {
    "name": "Product Name 2",
    "score": 92,
    "reason": "Explanation for product 2.",
    "asin": "B0XXXXXXXX"
  }
]`;
}

// Initialize OpenAI client with runtime configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,
  timeout: 60000, // Increased to 60 seconds
});

// Add timeout middleware
const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  const timeoutPromise = timeout(60000);
  const apiPromise = (async () => {
    try {
      const body = await request.json();
      const { dogProfile, query } = body;

      // Validate required fields
      if (!dogProfile || !query) {
        return NextResponse.json(
          { error: 'Missing required fields: dogProfile and query' },
          { status: 400 }
        );
      }

      // Validate dog profile fields
      if (!dogProfile.name || !dogProfile.breed || !dogProfile.weight || !dogProfile.age) {
        return NextResponse.json(
          { error: 'Invalid dog profile: name, breed, weight, and age are required' },
          { status: 400 }
        );
      }

      // Check if this is a category search
      const isCategorySearch = isCategory(query);

      // Generate the appropriate prompt
      const prompt = isCategorySearch 
        ? generateCategoryPrompt(dogProfile, query)
        : generateProductPrompt(dogProfile, query);

      // Call OpenAI API with optimized settings
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a knowledgeable dog product expert. Analyze products and provide scores and recommendations based on a dog's profile. 
IMPORTANT: Your response must be valid JSON only, with no additional text before or after the JSON.
DO NOT include any markdown formatting, code blocks, or explanatory text.
DO NOT use single quotes for strings - use double quotes only.
DO NOT include trailing commas in arrays or objects.
Keep responses concise but informative.`
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      // Parse the response
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      let parsedResult;
      try {
        parsedResult = JSON.parse(content);
      } catch (error) {
        console.error('Failed to parse OpenAI response:', content);
        throw new Error('Invalid JSON response from OpenAI');
      }

      // Validate and return the response
      if (isCategorySearch) {
        if (!Array.isArray(parsedResult)) {
          throw new Error('Expected array of category recommendations');
        }
        // Validate each recommendation
        const validatedRecommendations = parsedResult.map((rec: any) => {
          if (!rec.name || typeof rec.score !== 'number' || !rec.reason) {
            throw new Error('Invalid recommendation format');
          }
          return {
            name: rec.name,
            score: rec.score,
            explanation: rec.reason
          };
        });
        return NextResponse.json(validatedRecommendations);
      } else {
        if (typeof parsedResult.score !== 'number' || typeof parsedResult.explanation !== 'string') {
          throw new Error('Invalid product recommendation format');
        }
        return NextResponse.json(parsedResult);
      }
    } catch (error) {
      console.error('Error in recommendation API:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  })();

  try {
    const result = await Promise.race([apiPromise, timeoutPromise]);
    if (result === undefined) {
      return NextResponse.json(
        { error: 'Request timed out. Please try again with a simpler query.' },
        { status: 504 }
      );
    }
    return result;
  } catch (error) {
    console.error('Error in recommendation API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 