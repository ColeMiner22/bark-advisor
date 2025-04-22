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

interface OpenAIResponse {
  score: number;
  reason: string;
  similarProducts?: string[];
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
  return `You are an expert pet advisor. Evaluate this specific product for this dog's unique needs:

- Dog Name: ${dogProfile.name}
- Breed: ${dogProfile.breed} (consider breed-specific needs and characteristics)
- Weight: ${dogProfile.weight} lbs (factor in size-appropriate products)
- Age: ${dogProfile.age} years (consider age-specific needs)
- Health Issues: ${Array.isArray(dogProfile.healthIssues) ? dogProfile.healthIssues.join(', ') : dogProfile.healthIssues || 'None'} (prioritize addressing these issues)
- Dietary Restrictions: ${Array.isArray(dogProfile.dietaryRestrictions) ? dogProfile.dietaryRestrictions.join(', ') : dogProfile.dietaryRestrictions || 'None'} (ensure compliance)

For the product "${productName}", analyze:
1. Score (out of 100) based on how well it matches ${dogProfile.name}'s specific needs
2. A detailed explanation of why this product is or isn't suitable for ${dogProfile.name}, referencing specific characteristics of the dog
3. Three alternative products that might better suit ${dogProfile.name}'s needs

Format response as:
{
  "score": 85,
  "reason": "This product is particularly good for ${dogProfile.name} because... [specific reasons related to the dog's characteristics]",
  "similarProducts": [
    {
      "name": "Alternative Product",
      "score": 90,
      "reason": "This would work well for ${dogProfile.name} because... [specific reasons]"
    }
  ]
}`;
}

// Helper function to generate the category recommendation prompt
function generateCategoryPrompt(dogProfile: DogProfileInput, category: string, isMoreRecommendations: boolean = false): string {
  return `You are an expert product recommender for a dog product website. Your job is to suggest Amazon products tailored to a specific dog's profile.

Here is the dog's profile:
Name: ${dogProfile.name}
Breed: ${dogProfile.breed}
Weight: ${dogProfile.weight} lbs
Age: ${dogProfile.age} years
Health Issues: ${Array.isArray(dogProfile.healthIssues) ? dogProfile.healthIssues.join(', ') : dogProfile.healthIssues || 'None'}
Dietary Restrictions: ${Array.isArray(dogProfile.dietaryRestrictions) ? dogProfile.dietaryRestrictions.join(', ') : dogProfile.dietaryRestrictions || 'None'}

Your task is to:
1. Return exactly 5 products from Amazon that match the ${category} category and the dog's needs.
2. All products must be real and currently available on Amazon.
3. For each product, provide:
   - "name": the exact title used on Amazon
   - "asin": the real Amazon ASIN
   - "score": a match score (0–100) based on how well it fits the dog
   - "reason": 3–4 sentences explaining:
     - Why it's good (or not) for this dog's breed, age, size, activity, allergies, etc.
     - What makes it stand out (or not)
   - "price": the current price if known
   - "affiliateLink": direct Amazon product link in this format:
     "https://www.amazon.com/dp/ASIN_HERE?tag=barkadvisor-20"

If the product is not ideal, still include it but explain why in the reason.

Respond in valid JSON format like this:
[
  {
    "name": "Hill's Science Diet Adult Large Breed Chicken & Barley Recipe Dry Dog Food, 35 lb bag",
    "asin": "B0009YWKUA",
    "score": 92,
    "reason": "This food is perfect for large breed dogs like ${dogProfile.name} because it contains glucosamine and chondroitin for joint health, which is crucial for large breeds. The kibble size is specifically designed for larger jaws, and the balanced nutrition supports an active lifestyle. The chicken-based formula is gentle on sensitive stomachs, though it might be too rich for dogs with severe food allergies.",
    "price": "$64.98",
    "affiliateLink": "https://www.amazon.com/dp/B0009YWKUA?tag=barkadvisor-20"
  }
]

Important: Make sure all ASINs are real, valid, and available. If a product isn't available or has no ASIN, do not include it.`;
}

// Helper function to generate the product suggestion prompt
function generateProductSuggestionPrompt(dogProfile: DogProfileInput, category: string): string {
  return `Suggest 3 Amazon products in ${category} for a ${dogProfile.breed} (${dogProfile.weight}lbs, ${dogProfile.age}yrs). Health: ${dogProfile.healthIssues || 'None'}. Diet: ${dogProfile.dietaryRestrictions || 'None'}.

Return ONLY this format:
[
  "Product 1 exact title",
  "Product 2 exact title",
  "Product 3 exact title"
]`;
}

// Helper function to generate the product explanation prompt
function generateProductExplanationPrompt(dogProfile: DogProfileInput, product: string, asin: string): string {
  return `For a ${dogProfile.breed} (${dogProfile.weight}lbs, ${dogProfile.age}yrs), explain why "${product}" is suitable. Health: ${dogProfile.healthIssues || 'None'}. Diet: ${dogProfile.dietaryRestrictions || 'None'}.

Return ONLY:
{
  "score": number,
  "reason": "1 sentence explanation"
}`;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,
  timeout: 15000 // Reduced timeout
});

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { dogProfile, query, isMoreRecommendations = false } = body;

    // Validate required fields
    if (!dogProfile || !query) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get product suggestions
    const suggestionPrompt = generateProductSuggestionPrompt(dogProfile, query);
    const suggestionResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Return only valid JSON arrays.' },
        { role: 'user', content: suggestionPrompt }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const productTitles = JSON.parse(suggestionResponse.choices[0]?.message?.content || '[]');
    
    // Get explanations
    const recommendations = await Promise.all(
      productTitles.map(async (title: string) => {
        const asin = 'B0009YWKUA'; // TODO: Replace with Amazon API
        
        const explanationPrompt = generateProductExplanationPrompt(dogProfile, title, asin);
        const explanationResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Return only valid JSON objects.' },
            { role: 'user', content: explanationPrompt }
          ],
          temperature: 0.7,
          max_tokens: 100
        });

        const explanation = JSON.parse(explanationResponse.choices[0]?.message?.content || '{}');

        return {
          name: title,
          score: explanation.score,
          reason: explanation.reason,
          asin: asin,
          affiliateLink: `https://www.amazon.com/dp/${asin}?tag=barkadvisor-20`
        };
      })
    );

    return NextResponse.json({
      recommendations: recommendations,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        itemsPerPage: recommendations.length
      }
    });

  } catch (error) {
    console.error('Error in recommendation API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
} 