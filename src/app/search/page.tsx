'use client';

import React, { useState, useEffect } from 'react';
import { DogProfileInput } from '@/types/dog-profile';
import { CategoryRecommendation } from '@/types/recommendation';
import { getProductRecommendationScore, getCategoryRecommendations, ProductScore, ProductRecommendation } from '@/lib/services/openaiScore.service';
import { SearchBar } from '@/components/SearchBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

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
function generateAffiliateLink(item: CategoryRecommendation): string {
  if (item.asin) {
    return `https://www.amazon.com/dp/${item.asin}?tag=barkadvisor-20`;
  }
  // Fallback to search if no ASIN available
  const encoded = encodeURIComponent(item.name);
  return `https://www.amazon.com/s?k=${encoded}&tag=barkadvisor-20`;
}

interface SearchPageState {
  recommendations: CategoryRecommendation[];
  hasMore: boolean;
  totalItems: number;
  currentPage: number;
  category: string;
  loading: boolean;
  dogInfo: {
    name: string;
    breed: string;
    weight: string;
    age: string;
    healthIssues: string;
    dietaryRestrictions: string;
  };
  error: string | null;
}

export default function SearchPage() {
  const [state, setState] = useState<SearchPageState>({
    dogInfo: {
      name: '',
      breed: '',
      weight: '',
      age: '',
      healthIssues: '',
      dietaryRestrictions: ''
    },
    category: '',
    loading: false,
    error: null,
    recommendations: [],
    currentPage: 1,
    hasMore: false,
    totalItems: 0
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [isCategorySearch, setIsCategorySearch] = useState(false);
  const [categoryRecommendations, setCategoryRecommendations] = useState<ProductRecommendation[]>([]);
  
  // Product recommendation states
  const [recommendationLoading, setRecommendationLoading] = useState<{[key: string]: boolean}>({});
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [recommendationError, setRecommendationError] = useState<{[key: string]: string}>({});
  
  // Handle input changes for dog information
  const handleDogInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      dogInfo: {
        ...prev.dogInfo,
        [name]: value
      }
    }));
  };

  const handleSearch = async (query?: string) => {
    const searchText = query || searchQuery;
    
    // Validate required fields
    if (!state.dogInfo.name || !state.dogInfo.breed || !state.dogInfo.weight || !state.dogInfo.age) {
      setState(prev => ({ ...prev, error: 'Please fill in all required fields (name, breed, weight, and age).' }));
      return;
    }

    if (!searchText.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter a product or category to search for.' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    setSearchQuery(searchText); // Update the search query state

    try {
      const dogProfile: DogProfileInput = {
        name: state.dogInfo.name,
        breed: state.dogInfo.breed,
        weight: Number(state.dogInfo.weight),
        age: Number(state.dogInfo.age),
        healthIssues: state.dogInfo.healthIssues ? state.dogInfo.healthIssues.split(',').map(issue => issue.trim()).filter(Boolean) : [],
        dietaryRestrictions: state.dogInfo.dietaryRestrictions ? state.dogInfo.dietaryRestrictions.split(',').map(restriction => restriction.trim()).filter(Boolean) : []
      };

      const result = await getCategoryRecommendations(dogProfile, searchText, 1, 4);

      // Save to search history
      const newHistory: SearchHistory[] = [...searchHistory, {
        query: searchText,
        timestamp: Date.now(),
        type: 'category'
      }];
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));

      setState(prev => ({
        ...prev,
        recommendations: result.recommendations,
        hasMore: result.hasMore,
        totalItems: result.totalItems,
        currentPage: 1,
        category: searchText,
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error('Search error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred while searching',
        loading: false
      }));
    }
  };

  const handleLoadMore = async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const dogProfile: DogProfileInput = {
        name: state.dogInfo.name,
        breed: state.dogInfo.breed,
        weight: Number(state.dogInfo.weight),
        age: Number(state.dogInfo.age),
        healthIssues: state.dogInfo.healthIssues ? state.dogInfo.healthIssues.split(',').map(issue => issue.trim()).filter(Boolean) : [],
        dietaryRestrictions: state.dogInfo.dietaryRestrictions ? state.dogInfo.dietaryRestrictions.split(',').map(restriction => restriction.trim()).filter(Boolean) : []
      };

      const nextPage = state.currentPage + 1;
      const result = await getCategoryRecommendations(dogProfile, searchQuery, nextPage, 4);

      setState(prev => ({
        ...prev,
        recommendations: [...prev.recommendations, ...result.recommendations],
        hasMore: result.hasMore,
        currentPage: nextPage,
        loading: false
      }));
    } catch (error) {
      console.error('Load more error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred while loading more results',
        loading: false
      }));
    }
  };

  const generateBadges = (score: ProductScore): string[] => {
    const badges: string[] = [];
    
    if (score.score >= 90) badges.push('Perfect Match! 🌟');
    if (score.score >= 80) badges.push('Highly Recommended ✨');
    if (parseFloat(state.dogInfo.weight) <= 20 && score.score >= 75) badges.push('Great for Small Dogs 🐕');
    if (parseFloat(state.dogInfo.weight) >= 50 && score.score >= 75) badges.push('Great for Large Dogs 🦮');
    if (parseFloat(state.dogInfo.age) <= 1 && score.score >= 75) badges.push('Puppy Approved 🐶');
    if (parseFloat(state.dogInfo.age) >= 7 && score.score >= 75) badges.push('Senior Friendly 🦴');
    
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
                  value={state.dogInfo.name}
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
                  value={state.dogInfo.breed}
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
                  value={state.dogInfo.weight}
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
                  value={state.dogInfo.age}
                  onChange={handleDogInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="healthIssues" className="block text-sm font-medium text-gray-700 mb-1">
                  Health Issues (optional)
                </label>
                <input
                  type="text"
                  id="healthIssues"
                  name="healthIssues"
                  value={state.dogInfo.healthIssues}
                  onChange={handleDogInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Allergies, Joint problems"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-700 mb-1">
                  Dietary Restrictions (optional)
                </label>
                <input
                  type="text"
                  id="dietaryRestrictions"
                  name="dietaryRestrictions"
                  value={state.dogInfo.dietaryRestrictions}
                  onChange={handleDogInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Grain-free, No chicken"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results section */}
        {state.loading ? (
          <div className="mt-8 flex flex-col items-center justify-center py-12">
            <div className="flex items-center space-x-4">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="text-lg font-medium text-gray-700">Getting recommendations...</span>
            </div>
            <p className="mt-4 text-sm text-gray-500">This may take a few moments</p>
          </div>
        ) : state.recommendations.length > 0 && (
          <div className="mt-8">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">Recommended Products</h2>
            <div className="grid grid-cols-1 gap-6">
              {state.recommendations.map((item, index) => (
                <div 
                  key={index} 
                  className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="absolute top-4 right-4">
                    <div className="flex flex-col items-center">
                      <div className="relative w-32 h-20">
                        {/* Background arc - full semicircle */}
                        <div className="absolute inset-0">
                          <svg className="w-full h-full" viewBox="0 0 120 60">
                            <path
                              d="M10 60 A50 50 0 0 1 110 60"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="12"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        {/* Foreground arc - fills based on score */}
                        <div className="absolute inset-0">
                          <svg className="w-full h-full" viewBox="0 0 120 60">
                            <path
                              d="M10 60 A50 50 0 0 1 110 60"
                              fill="none"
                              stroke="#0ea5e9"
                              strokeWidth="12"
                              strokeLinecap="round"
                              strokeDasharray="157"
                              strokeDashoffset={157 - (157 * Math.min(item.score, 100)) / 100}
                            />
                          </svg>
                        </div>
                        {/* Score text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                          <span className="text-3xl font-bold text-gray-800">{item.score}</span>
                          <span className="text-xs text-gray-500">Out of 100</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 mt-1">Product Score</span>
                    </div>
                  </div>
                  
                  <div className="pr-20">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-3">{item.name}</h3>
                    <div className="mb-4">
                      {item.score >= 90 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Excellent Match
                        </span>
                      )}
                      {item.score >= 80 && item.score < 90 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          Great Match
                        </span>
                      )}
                      {item.score >= 70 && item.score < 80 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-200">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                          Good Match
                        </span>
                      )}
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 mb-4">
                      <p className="text-gray-600 leading-relaxed text-base">
                        {item.explanation}
                        {item.score >= 90 && " This product is an excellent choice for your dog's specific needs, offering optimal benefits for their breed, age, and health requirements."}
                        {item.score >= 80 && item.score < 90 && " This product is well-suited for your dog, providing good benefits while considering their unique characteristics and needs."}
                        {item.score >= 70 && item.score < 80 && " This product is a suitable option for your dog, offering benefits that align with their profile while meeting basic requirements."}
                      </p>
                    </div>
                    <a 
                      href={generateAffiliateLink(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      {state.loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Getting Recommendations...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">View on Amazon</span>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                          </svg>
                        </>
                      )}
                    </a>
                  </div>
                </div>
              ))}
            </div>
            
            {state.hasMore && (
              <div className="mt-10 text-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={state.loading}
                  className="w-full max-w-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {state.loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading More...
                    </>
                  ) : (
                    'Load More Recommendations'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {state.error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg max-w-2xl mx-auto">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{state.error}</p>
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