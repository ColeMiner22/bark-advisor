import { NextRequest, NextResponse } from 'next/server';
import { DogProfileInput } from '@/types/dog-profile';

interface ProductAnalysis {
  score: number;
  recommendations: string[];
  reasoning: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.dogProfile || !body.product) {
      return NextResponse.json(
        { error: 'Missing required fields: dogProfile and product' },
        { status: 400 }
      );
    }
    
    // Extract dog profile and product from the request body
    const dogProfile: DogProfileInput = body.dogProfile;
    const product = body.product;
    
    console.log('API route received request for dog:', dogProfile.name);
    
    // Get the API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key is not defined in environment variables');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }
    
    // Create a prompt with the dog profile and product information
    const prompt = `Analyze the following product for a dog with these characteristics:
- Name: ${dogProfile.name}
- Breed: ${dogProfile.breed}
- Weight: ${dogProfile.weight} lbs
- Age: ${dogProfile.age} years
- Health Issues: ${dogProfile.vet_issues || 'None'}
- Dietary Restrictions: ${dogProfile.dietary_restrictions || 'None'}

Product Information:
${JSON.stringify(product, null, 2)}

Please provide:
1. A score from 0-100 indicating how suitable this product is for this specific dog
2. 2-3 specific recommendations about using this product
3. A brief reasoning (2-3 sentences) explaining the score and recommendations

Format the response in JSON:
{
  "score": number,
  "recommendations": string[],
  "reasoning": string
}`;

    console.log('Making API call to OpenAI...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional dog care expert and product analyst. Provide detailed, safety-conscious advice about dog products. Your recommendations should be based on the dog\'s breed, size, age, health issues, and dietary restrictions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    console.log('OpenAI API response status:', response.status);
    
    // Check if the response is successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: `OpenAI API error: ${response.status} ${response.statusText}` },
        { status: 500 }
      );
    }

    // Parse the response
    const result = await response.json();
    console.log('OpenAI API response:', result);

    if (!result.choices || !result.choices[0] || !result.choices[0].message || !result.choices[0].message.content) {
      console.error('Unexpected OpenAI API response format:', result);
      return NextResponse.json(
        { error: 'Invalid response format from OpenAI API' },
        { status: 500 }
      );
    }

    try {
      const analysis = JSON.parse(result.choices[0].message.content) as ProductAnalysis;
      return NextResponse.json(analysis);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return NextResponse.json(
        { error: 'Failed to parse OpenAI response' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 