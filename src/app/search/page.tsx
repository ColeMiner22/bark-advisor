'use client';

import React, { useState, useEffect } from 'react';
import { DogProfileInput } from '@/types/dog-profile';
import { getProductRecommendationScore, getCategoryRecommendations, ProductScore, ProductRecommendation } from '@/lib/services/openaiScore.service';
import { SearchBar } from '@/components/SearchBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Types for search functionality
interface SearchSuggestion {
  type: 'category' | 'recent';
  text: string;
  icon?: string;
}

interface SearchHistory {
  query: string;
  timestamp: number;
  type: 'category' | 'product';
}

// Common product categories with icons
const COMMON_CATEGORIES: SearchSuggestion[] = [
  { type: 'category', text: 'Dog Food', icon: '🍖' },
  { type: 'category', text: 'Treats', icon: '🦴' },
  { type: 'category', text: 'Toys', icon: '🧸' },
  { type: 'category', text: 'Dental Chews', icon: '🦷' },
  { type: 'category', text: 'Grooming Supplies', icon: '✨' },
  { type: 'category', text: 'Beds', icon: '🛏️' },
  { type: 'category', text: 'Collars', icon: '📿' },
  { type: 'category', text: 'Leashes', icon: '➰' },
  { type: 'category', text: 'Training Equipment', icon: '📚' },
  { type: 'category', text: 'Supplements', icon: '💊' },
  { type: 'category', text: 'Medications', icon: '💉' },
  { type: 'category', text: 'Bowls', icon: '🥣' },
  { type: 'category', text: 'Crates', icon: '📦' },
  { type: 'category', text: 'Clothing', icon: '👕' },
  { type: 'category', text: 'Accessories', icon: '🎀' }
];

interface ProductAnalysis {
  score: number;
  recommendations: string[];
  reasoning: string;
  badges?: string[];
  starRating?: number;
}

// Mock dog food products data
const mockDogFoodProducts = [
  {
    name: "Blue Buffalo Life Protection Formula Adult Dog Food",
    ingredients: ["Deboned Chicken", "Chicken Meal", "Brown Rice", "Sweet Potatoes", "Carrots", "Peas", "Flaxseed", "Vitamins", "Minerals"],
    targetBreeds: ["All Breeds", "Medium to Large Breeds", "Active Dogs"],
    description: "A premium dry dog food made with real chicken as the first ingredient. Contains a blend of antioxidants, vitamins, and minerals to support immune system health. Includes LifeSource Bits, a blend of nutrients enhanced with vitamins and minerals."
  },
  {
    name: "Royal Canin Small Breed Adult Dry Dog Food",
    ingredients: ["Chicken By-Product Meal", "Brewers Rice", "Corn", "Corn Gluten Meal", "Chicken Fat", "Natural Flavors", "Dried Plain Beet Pulp", "Fish Oil", "Vitamins", "Minerals"],
    targetBreeds: ["Small Breeds", "Toy Breeds", "Miniature Breeds"],
    description: "Specifically formulated for small breed dogs under 22 pounds. Contains an exclusive blend of antioxidants to support a healthy immune system. Kibble size and shape designed for small jaws."
  },
  {
    name: "Hill's Science Diet Sensitive Stomach & Skin Adult Dog Food",
    ingredients: ["Water", "Chicken", "Egg Product", "Potato Starch", "Carrots", "Corn Gluten Meal", "Powdered Cellulose", "Chicken Liver Flavor", "Flaxseed", "Vitamins", "Minerals"],
    targetBreeds: ["All Breeds", "Dogs with Sensitive Stomachs", "Dogs with Skin Issues"],
    description: "A highly digestible dog food designed for dogs with sensitive stomachs and skin issues. Contains prebiotic fiber to support digestive health and omega-6 fatty acids and vitamin E for healthy skin and coat."
  }
];

// Utility function to generate Amazon affiliate links
function generateAffiliateLink(productName: string): string {
  const encoded = encodeURIComponent(productName);
  return `https://www.amazon.com/s?k=${encoded}&tag=barkadvisor-20`;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCategorySearch, setIsCategorySearch] = useState(false);
  const [categoryRecommendations, setCategoryRecommendations] = useState<ProductRecommendation[]>([]);
  
  // Product recommendation states
  const [recommendationLoading, setRecommendationLoading] = useState<{[key: string]: boolean}>({});
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [recommendationError, setRecommendationError] = useState<{[key: string]: string}>({});
  
  // Dog information state
  const [dogInfo, setDogInfo] = useState({
    name: '',
    breed: '',
    weight: '',
    age: '',
    vet_issues: '',
    dietary_restrictions: ''
  });
  
  // Handle input changes for dog information
  const handleDogInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDogInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    // Validate required dog information
    if (!dogInfo.name || !dogInfo.breed || !dogInfo.weight || !dogInfo.age) {
      setError('Please fill in your dog\'s name, breed, weight, and age before searching.');
      return;
    }

    console.log('Search initiated with query:', query);
    setSearchQuery(query);
    setLoading(true);
    setError(null);
    setRecommendations([]);
    setCategoryRecommendations([]);

    try {
      // Normalize the query for comparison
      const normalizedQuery = query.toLowerCase().trim();
      console.log('Normalized query:', normalizedQuery);

      // Check if the query matches any category (case-insensitive)
      const isCategory = COMMON_CATEGORIES.some(category => 
        category.text.toLowerCase().trim() === normalizedQuery
      );
      console.log('Is category search:', isCategory);
      setIsCategorySearch(isCategory);

      // Create dog profile from the form data
      const dogProfile: DogProfileInput = {
        name: dogInfo.name,
        breed: dogInfo.breed,
        weight: parseFloat(dogInfo.weight),
        age: parseFloat(dogInfo.age),
        healthIssues: [],
        dietaryRestrictions: [],
        vet_issues: dogInfo.vet_issues ?? undefined,
        dietary_restrictions: dogInfo.dietary_restrictions ?? undefined
      };

      if (isCategory) {
        console.log('Fetching category recommendations for:', query);
        const categoryResults = await getCategoryRecommendations(dogProfile, query);
        console.log('Category results:', categoryResults);
        
        if (categoryResults && categoryResults.length > 0) {
          setCategoryRecommendations(categoryResults);
          // Save to search history
          const newHistory: SearchHistory[] = [...searchHistory, {
            query,
            timestamp: Date.now(),
            type: 'category' as const
          }];
          setSearchHistory(newHistory);
          localStorage.setItem('searchHistory', JSON.stringify(newHistory));
        } else {
          throw new Error('No recommendations found for this category');
        }
      } else {
        console.log('Fetching product score for:', query);
        const result = await getProductRecommendationScore(dogProfile, query);
        console.log('Product score result:', result);
        
        if (result) {
          const recommendation: ProductRecommendation = {
            name: query,
            score: result.score,
            reason: result.explanation,
            similarProducts: result.similarProducts
          };
          setRecommendations([recommendation]);
          // Save to search history
          const newHistory: SearchHistory[] = [...searchHistory, {
            query,
            timestamp: Date.now(),
            type: 'product' as const
          }];
          setSearchHistory(newHistory);
          localStorage.setItem('searchHistory', JSON.stringify(newHistory));
        } else {
          throw new Error('No recommendation found for this product');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      
      // Provide more helpful error messages
      let errorMessage = 'An error occurred while searching';
      
      if (err instanceof Error) {
        if (err.message.includes('Invalid response format')) {
          errorMessage = 'The AI response was not in the expected format. Please try again or try a different search.';
        } else if (err.message.includes('API error')) {
          // Extract the most helpful part of the error message
          const apiErrorMatch = err.message.match(/API error: (.*?)( - |$)/);
          if (apiErrorMatch && apiErrorMatch[1]) {
            errorMessage = `API error: ${apiErrorMatch[1]}`;
          } else {
            errorMessage = err.message;
          }
        } else if (err.message.includes('No recommendations found')) {
          errorMessage = 'No recommendations found for this search. Please try a different product or category.';
        } else if (err.message.includes('No recommendation found')) {
          errorMessage = 'No recommendation found for this product. Please try a different product.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateBadges = (score: ProductScore): string[] => {
    const badges: string[] = [];
    
    if (score.score >= 90) badges.push('Perfect Match! 🌟');
    if (score.score >= 80) badges.push('Highly Recommended ✨');
    if (parseFloat(dogInfo.weight) <= 20 && score.score >= 75) badges.push('Great for Small Dogs 🐕');
    if (parseFloat(dogInfo.weight) >= 50 && score.score >= 75) badges.push('Great for Large Dogs 🦮');
    if (parseFloat(dogInfo.age) <= 1 && score.score >= 75) badges.push('Puppy Approved 🐶');
    if (parseFloat(dogInfo.age) >= 7 && score.score >= 75) badges.push('Senior Friendly 🦴');
    
    return badges;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background-light to-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 font-poppins animate-fade-in">Product Search</h1>
          <div className="divider"></div>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in delay-100">
            Enter any dog product to get an AI-powered analysis with a score and personalized recommendations.
          </p>
        </div>
        
        <div className="mb-8">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            suggestions={COMMON_CATEGORIES}
            recentSearches={searchHistory.map(h => ({
              type: 'recent',
              text: h.query,
              icon: h.type === 'category' ? '📁' : '🔍'
            }))}
            className="animate-fade-in delay-200"
          />
        </div>
        
        {/* Dog Information Form */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-center">About Your Dog</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Dog's Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={dogInfo.name}
                  onChange={handleDogInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Max"
                  required
                />
              </div>
              <div>
                <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">
                  Breed
                </label>
                <input
                  type="text"
                  id="breed"
                  name="breed"
                  value={dogInfo.breed}
                  onChange={handleDogInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Golden Retriever"
                  required
                />
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={dogInfo.weight}
                  onChange={handleDogInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 70"
                  required
                />
              </div>
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age (years)
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={dogInfo.age}
                  onChange={handleDogInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="vet_issues" className="block text-sm font-medium text-gray-700 mb-1">
                  Health Issues (optional)
                </label>
                <input
                  type="text"
                  id="vet_issues"
                  name="vet_issues"
                  value={dogInfo.vet_issues}
                  onChange={handleDogInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Allergies, Joint problems"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="dietary_restrictions" className="block text-sm font-medium text-gray-700 mb-1">
                  Dietary Restrictions (optional)
                </label>
                <input
                  type="text"
                  id="dietary_restrictions"
                  name="dietary_restrictions"
                  value={dogInfo.dietary_restrictions}
                  onChange={handleDogInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Grain-free, No chicken"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Recommendations Section */}
        {recommendations.length > 0 && !loading && !error && (
          <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Product Analysis</h2>
            
            <div className="space-y-6">
              {recommendations.map((rec, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium">
                        <a 
                          href={generateAffiliateLink(rec.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {rec.name}
                        </a>
                      </h3>
                      <div className="flex items-center">
                        <span className={`text-3xl font-bold ${
                          rec.score >= 80 ? 'text-green-600' :
                          rec.score >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {rec.score}
                        </span>
                        <span className="text-gray-500 ml-1">/100</span>
                      </div>
                    </div>
                    
                    {/* Star Rating */}
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(rec.score / 20)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    
                    <p className="text-gray-600 mb-4">{rec.reason}</p>
                    
                    <a
                      href={generateAffiliateLink(rec.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-fit"
                    >
                      View on Amazon
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Similar Products */}
            {recommendations[0]?.similarProducts && recommendations[0].similarProducts.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-medium mb-4">Similar Products</h4>
                <div className="space-y-4">
                  {recommendations[0].similarProducts.map((similar, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-300">
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">
                            <a 
                              href={generateAffiliateLink(similar.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {similar.name}
                            </a>
                          </h5>
                          <span className={`text-lg font-bold ${
                            similar.score >= 80 ? 'text-green-600' :
                            similar.score >= 60 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {similar.score}/100
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{similar.reason}</p>
                        <a
                          href={generateAffiliateLink(similar.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors w-fit"
                        >
                          View on Amazon
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Amazon Associate Disclaimer */}
            <p className="text-xs text-gray-500 mt-8 text-center">
              As an Amazon Associate, we earn from qualifying purchases.
            </p>
          </div>
        )}

        {/* Category Recommendations Section */}
        {isCategorySearch && categoryRecommendations.length > 0 && !loading && !error && (
          <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in max-w-2xl mx-auto mt-8">
            <h2 className="text-xl font-semibold mb-4">Recommended {searchQuery}</h2>
            <div className="space-y-4">
              {categoryRecommendations.map((rec, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">
                        <a 
                          href={generateAffiliateLink(rec.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {rec.name}
                        </a>
                      </h3>
                      <span className={`text-lg font-bold ${
                        rec.score >= 80 ? 'text-green-600' :
                        rec.score >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {rec.score}/100
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{rec.reason}</p>
                    <a
                      href={generateAffiliateLink(rec.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors w-fit"
                    >
                      View on Amazon
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Amazon Associate Disclaimer */}
            <p className="text-xs text-gray-500 mt-8 text-center">
              As an Amazon Associate, we earn from qualifying purchases.
            </p>
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Getting recommendations...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg max-w-2xl mx-auto">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <p className="text-xs text-red-500 mt-1">Try searching for a different product or category, or try again later.</p>
                <div className="mt-2 text-xs text-red-500">
                  <p>If the problem persists, please check:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Your internet connection</li>
                    <li>That you've filled in your dog's profile completely</li>
                    <li>That you're searching for a valid product or category</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}