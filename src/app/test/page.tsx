'use client';

import React, { useState, useEffect } from 'react';
import { DogProfileInput } from '@/types/dogProfile';
import { Product } from '@/types/product';
import { getProductRecommendationScore, getCategoryRecommendations, ProductScore, ProductRecommendation } from '@/lib/services/openaiScore.service';

// Common product categories for testing
const TEST_CATEGORIES = [
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

// Sample products for testing
const SAMPLE_PRODUCTS = [
  'Purina Pro Plan Salmon Dog Food',
  'Blue Buffalo Life Protection Formula',
  'Royal Canin Small Breed Adult',
  'Hill\'s Science Diet Sensitive Stomach',
  'Merrick Grain-Free Dry Dog Food',
  'Orijen Original Dry Dog Food',
  'Taste of the Wild High Prairie',
  'Wellness Complete Health Natural',
  'Nutro Ultra Adult Dry Dog Food',
  'Iams ProActive Health Adult'
];

// Helper function to check if a query is a category
function isCategoryQuery(query: string): boolean {
  return TEST_CATEGORIES.some(
    category => category.toLowerCase().trim() === query.toLowerCase().trim()
  );
}

export default function TestPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    type: 'category' | 'product';
    data: any;
  } | null>(null);
  const [isCategory, setIsCategory] = useState(false);
  const [dogProfile, setDogProfile] = useState<DogProfileInput>({
    name: 'Test Dog',
    breed: 'Labrador',
    weight: 70,
    age: 3,
    healthIssues: ['None'],
    dietaryRestrictions: ['None']
  });

  // Load dog profile from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('dogProfile');
    if (savedProfile) {
      try {
        setDogProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Error parsing saved dog profile:', e);
      }
    }
  }, []);

  const handleTest = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      if (isCategoryQuery(query)) {
        const recommendations = await getCategoryRecommendations(dogProfile, 1, 10, query);
        setResult({ type: 'category', data: recommendations });
      } else {
        const testProduct: Product = {
          id: 'test-product-1',
          name: query,
          description: 'Test product description',
          price: 29.99,
          category: 'Test Category',
          imageUrl: 'https://example.com/test.jpg',
          brand: 'Test Brand',
          ingredients: ['Test Ingredient 1', 'Test Ingredient 2'],
          features: ['Test Feature 1', 'Test Feature 2'],
          rating: 4.5,
          reviews: 100
        };

        const score = await getProductRecommendationScore(testProduct, dogProfile);
        setResult({ type: 'product', data: score });
      }
    } catch (err) {
      console.error('Test error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFillTestProfile = () => {
    setDogProfile({
      name: 'Max',
      breed: 'Golden Retriever',
      weight: 70,
      age: 3,
      healthIssues: ['None'],
      dietaryRestrictions: ['None']
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background-light to-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 font-poppins animate-fade-in">API Test Page</h1>
          <div className="divider"></div>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in delay-100">
            Test the recommendation API with different queries and view the results.
          </p>
        </div>

        {/* Dog Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Dog Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={dogProfile.name}
                onChange={(e) => setDogProfile(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Breed</label>
              <input
                type="text"
                value={dogProfile.breed}
                onChange={(e) => setDogProfile(prev => ({ ...prev, breed: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Weight (lbs)</label>
              <input
                type="number"
                value={dogProfile.weight}
                onChange={(e) => setDogProfile(prev => ({ ...prev, weight: Number(e.target.value) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age (years)</label>
              <input
                type="number"
                value={dogProfile.age}
                onChange={(e) => setDogProfile(prev => ({ ...prev, age: Number(e.target.value) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Health Issues</label>
              <input
                type="text"
                value={Array.isArray(dogProfile.healthIssues) ? dogProfile.healthIssues.join(', ') : dogProfile.healthIssues || ''}
                onChange={(e) => setDogProfile(prev => ({ ...prev, healthIssues: e.target.value.split(',').map(item => item.trim()) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dietary Restrictions</label>
              <input
                type="text"
                value={Array.isArray(dogProfile.dietaryRestrictions) ? dogProfile.dietaryRestrictions.join(', ') : dogProfile.dietaryRestrictions || ''}
                onChange={(e) => setDogProfile(prev => ({ ...prev, dietaryRestrictions: e.target.value.split(',').map(item => item.trim()) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
          </div>
          <button
            onClick={handleFillTestProfile}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            Fill Test Profile
          </button>
        </div>

        {/* Test Query Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Query</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Query</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                placeholder="Enter a product name or category"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Sample Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {TEST_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => setQuery(category)}
                      className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm hover:bg-accent/20"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Sample Products</h3>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_PRODUCTS.map((product) => (
                    <button
                      key={product}
                      onClick={() => setQuery(product)}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20"
                    >
                      {product}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleTest}
              disabled={loading}
              className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Query'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <div className="space-y-4">
              {result.type === 'category' ? (
                // Category recommendations
                result.data.map((rec: ProductRecommendation, index: number) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium">{rec.name}</h3>
                      <span className={`text-lg font-bold ${
                        rec.score >= 80 ? 'text-green-600' :
                        rec.score >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {rec.score}/100
                      </span>
                    </div>
                    <p className="text-gray-600">{rec.reason}</p>
                  </div>
                ))
              ) : (
                // Product score
                <>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium">{query}</h3>
                      <span className={`text-lg font-bold ${
                        result.data.score >= 80 ? 'text-green-600' :
                        result.data.score >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {result.data.score}/100
                      </span>
                    </div>
                    <p className="text-gray-600">{result.data.explanation}</p>
                  </div>

                  {/* Similar Products */}
                  {result.data.similarProducts && result.data.similarProducts.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-4">Similar Products</h3>
                      <div className="space-y-4">
                        {result.data.similarProducts.map((rec: ProductRecommendation, index: number) => (
                          <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-lg font-medium">{rec.name}</h4>
                              <span className={`text-lg font-bold ${
                                rec.score >= 80 ? 'text-green-600' :
                                rec.score >= 60 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {rec.score}/100
                              </span>
                            </div>
                            <p className="text-gray-600">{rec.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 