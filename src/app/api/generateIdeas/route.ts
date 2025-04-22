import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { DogProfileInput } from '@/types/dogProfile';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,
  timeout: 10000 // 10 second timeout
});

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { dogProfile, query } = body;

    if (!dogProfile || !query) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const prompt = `You're a dog product expert. Suggest 3 specific Amazon products in the "${query}" category based on this profile:

Dog: ${dogProfile.breed} (${dogProfile.weight}lbs, ${dogProfile.age}yrs)
Health: ${dogProfile.healthIssues || 'None'}
Diet: ${dogProfile.dietaryRestrictions || 'None'}

Return 3 specific product titles that match the "${query}" category exactly.
For example, if the category is "dog food", return specific dog food products.
If it's "toys", return specific dog toys.

Respond in JSON like:
[
  "Hill's Science Diet Adult Large Breed Chicken & Barley Recipe Dry Dog Food, 35 lb bag",
  "Royal Canin German Shepherd Adult Dry Dog Food, 30 lb bag",
  "Purina Pro Plan Large Breed Adult Dry Dog Food, 34 lb bag"
]

Important:
- Stay within the exact category searched
- Use real Amazon product titles
- Include specific sizes/quantities
- Return ONLY the array, no other text`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Return only valid JSON arrays.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    const ideas = JSON.parse(response.choices[0]?.message?.content || '[]');

    return NextResponse.json({ ideas });

  } catch (error) {
    console.error('Error in generateIdeas API:', error);
    return NextResponse.json(
      { error: 'Failed to generate ideas' },
      { status: 500 }
    );
  }
} 