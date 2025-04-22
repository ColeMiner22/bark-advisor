import { NextRequest, NextResponse } from 'next/server';
import { DogProfileInput } from '@/types/dogProfile';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,
  timeout: 10000
});

// Helper function to create Amazon search URL
function createAmazonUrl(productTitle: string): string {
  const searchQuery = encodeURIComponent(productTitle);
  return `https://www.amazon.com/s?k=${searchQuery}&tag=barkadvisor-20`;
}

// Helper function to get product match score and reason
async function getProductMatch(dogProfile: DogProfileInput, product: string) {
  const prompt = `Given this dog profile:

Dog: ${dogProfile.breed} (${dogProfile.weight}lbs, ${dogProfile.age}yrs)
Health: ${dogProfile.healthIssues || 'None'}
Diet: ${dogProfile.dietaryRestrictions || 'None'}

And this product: "${product}"

Give a match score (0-100) and a 1-2 sentence reason why it's good (or not) for the dog.

Respond like:
{
  "score": 87,
  "reason": "This food is ideal for older dogs with sensitive stomachs."
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'Return only valid JSON objects.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 100
  });

  return JSON.parse(response.choices[0]?.message?.content || '{}');
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { dogProfile, ideas } = body;

    if (!dogProfile || !ideas || !Array.isArray(ideas)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get match scores and reasons for each product
    const products = await Promise.all(
      ideas.map(async (productTitle) => {
        const match = await getProductMatch(dogProfile, productTitle);
        return {
          name: productTitle,
          score: match.score,
          reason: match.reason,
          affiliateLink: createAmazonUrl(productTitle)
        };
      })
    );

    return NextResponse.json({
      recommendations: products,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        itemsPerPage: products.length
      }
    });

  } catch (error) {
    console.error('Error in fetchProducts API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 