import OpenAI from 'openai';
import { DogProfile } from '@/types/dog-profile';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, these calls should be made server-side
});

export interface ProductAnalysis {
  score: number;
  explanation: string;
  alternatives: {
    name: string;
    reason: string;
  }[];
}

interface ProductScore {
  score: number;
  reason: string;
}

export const analyzeProduct = async (productName: string, dogProfile: DogProfile): Promise<ProductAnalysis> => {
  const prompt = `Analyze the following product "${productName}" for a dog with these characteristics:
- Breed: ${dogProfile.breed}
- Weight: ${dogProfile.weight} lbs
- Health Issues: ${dogProfile.vet_issues || 'None'}
- Dietary Restrictions: ${dogProfile.dietary_restrictions || 'None'}

Please provide:
1. A score from 0-100 indicating how suitable this product is for this specific dog
2. A detailed reason for the score, considering the dog's specific characteristics
3. 2-3 better alternative products with brief reasons why they're better

Format the response in JSON:
{
  "score": number,
  "explanation": "string",
  "alternatives": [
    {
      "name": "string",
      "reason": "string"
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a dog product recommendation expert. For each product, provide:
1. A score from 0-100 based on how well it matches the dog's needs
2. A detailed reason for the score, considering the dog's specific characteristics`
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No response content from OpenAI');
  }

  const result = JSON.parse(content);
  return result as ProductAnalysis;
}; 