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
  text: string;
  type: 'category' | 'recent';
  timestamp: number;
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

interface SearchPageState {
  dogInfo: {
    name: string;
    breed: string;
    weight: string;
    age: string;
    healthIssues?: string;
    dietaryRestrictions?: string;
  };
  category: string;
  recommendations: CategoryRecommendation[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
  };
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
    recommendations: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 4
    }
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
    
    // Only validate required fields
    if (!state.dogInfo.name || !state.dogInfo.breed || !state.dogInfo.weight || !state.dogInfo.age) {
      setState(prev => ({ 
        ...prev, 
        error: 'Please fill in the required fields: name, breed, weight, and age.' 
      }));
      return;
    }

    if (!searchText.trim()) {
      setState(prev => ({ 
        ...prev, 
        error: 'Please enter a product or category to search for.' 
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    setSearchQuery(searchText);

    const weightNum = state.dogInfo.weight ? Number(state.dogInfo.weight) : 0;
    const ageNum = state.dogInfo.age ? Number(state.dogInfo.age) : 0;
    
    if (isNaN(weightNum) || isNaN(ageNum)) {
      setState(prev => ({ 
        ...prev, 
        error: "Please enter valid numbers for weight and age",
        loading: false 
      }));
      return;
    }

    try {
      const dogProfile = {
        name: state.dogInfo.name,
        breed: state.dogInfo.breed,
        weight: weightNum,
        age: ageNum,
        healthIssues: state.dogInfo.healthIssues ? state.dogInfo.healthIssues.split(',').map(issue => issue.trim()).filter(Boolean) : [],
        dietaryRestrictions: state.dogInfo.dietaryRestrictions ? state.dogInfo.dietaryRestrictions.split(',').map(restriction => restriction.trim()).filter(Boolean) : []
      };

      // Step 1: Get product ideas
      const ideasResponse = await fetch('/api/generateIdeas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dogProfile, query: searchText })
      });

      if (!ideasResponse.ok) {
        throw new Error('Failed to generate product ideas');
      }

      const { ideas } = await ideasResponse.json();

      // Step 2: Get product details
      const productsResponse = await fetch('/api/fetchProducts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dogProfile, ideas })
      });

      if (!productsResponse.ok) {
        throw new Error('Failed to fetch products');
      }

      const result = await productsResponse.json();

      // Save to search history
      const newHistory: SearchHistory[] = [...searchHistory, {
        text: searchText,
        type: 'recent' as const,
        timestamp: Date.now()
      }];
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));

      setState(prev => ({
        ...prev,
        recommendations: result.recommendations,
        pagination: result.pagination,
        category: searchText,
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching recommendations. Please try again.'
      }));
    }
  };

  const handleLoadMore = async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const weightNum = state.dogInfo.weight ? Number(state.dogInfo.weight) : 0;
      const ageNum = state.dogInfo.age ? Number(state.dogInfo.age) : 0;
      
      if (isNaN(weightNum) || isNaN(ageNum)) {
        setState(prev => ({ 
          ...prev, 
          error: "Please enter valid numbers for weight and age",
          loading: false 
        }));
        return;
      }

      const dogProfile: DogProfileInput = {
        name: state.dogInfo.name,
        breed: state.dogInfo.breed,
        weight: weightNum,
        age: ageNum,
        healthIssues: state.dogInfo.healthIssues ? state.dogInfo.healthIssues.split(',').map(issue => issue.trim()).filter(Boolean) : [],
        dietaryRestrictions: state.dogInfo.dietaryRestrictions ? state.dogInfo.dietaryRestrictions.split(',').map(restriction => restriction.trim()).filter(Boolean) : []
      };

      const nextPage = state.pagination.currentPage + 1;
      const result = await getCategoryRecommendations(dogProfile, nextPage, state.pagination.itemsPerPage, searchQuery);

      setState(prev => ({
        ...prev,
        recommendations: [...prev.recommendations, ...result.recommendations],
        pagination: {
          ...result.pagination,
          currentPage: nextPage
        },
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

  const handleMoreRecommendations = async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const weightNum = Number(state.dogInfo.weight);
      const ageNum = Number(state.dogInfo.age);
      
      const dogProfile: DogProfileInput = {
        name: state.dogInfo.name,
        breed: state.dogInfo.breed,
        weight: weightNum,
        age: ageNum,
        healthIssues: state.dogInfo.healthIssues ? state.dogInfo.healthIssues.split(',').map(issue => issue.trim()).filter(Boolean) : [],
        dietaryRestrictions: state.dogInfo.dietaryRestrictions ? state.dogInfo.dietaryRestrictions.split(',').map(restriction => restriction.trim()).filter(Boolean) : []
      };

      // Get new recommendations
      const result = await getCategoryRecommendations(dogProfile, 1, 5, state.category);

      // Add new recommendations to the existing ones
      setState(prev => ({
        ...prev,
        recommendations: [...prev.recommendations, ...result.recommendations],
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error fetching more recommendations:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching more recommendations.'
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
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
          Find the Perfect Products for Your Dog 🐾
        </h1>
        
        {/* Dog Info Form */}
        <Card className="mb-6 shadow-lg bg-white/80 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent">
              Dog Profile
            </CardTitle>
            <CardDescription className="text-gray-600">
              Tell us about your furry friend to get personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 group">
                <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700 group-hover:text-orange-600 transition-colors">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={state.dogInfo.name}
                  onChange={handleDogInfoChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white/70"
                  required
                  placeholder="E.g., Max, Luna, Bella"
                />
              </div>
              <div className="space-y-2 group">
                <label htmlFor="breed" className="block text-sm font-medium mb-1 text-gray-700 group-hover:text-orange-600 transition-colors">
                  Breed *
                </label>
                <input
                  type="text"
                  id="breed"
                  name="breed"
                  value={state.dogInfo.breed}
                  onChange={handleDogInfoChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white/70"
                  required
                  placeholder="E.g., Labrador Retriever, German Shepherd, Mixed Breed"
                />
              </div>
              <div className="space-y-2 group">
                <label htmlFor="weight" className="block text-sm font-medium mb-1 text-gray-700 group-hover:text-blue-600 transition-colors">
                  Weight (lbs) *
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={state.dogInfo.weight}
                  onChange={handleDogInfoChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70"
                  required
                  placeholder="E.g., 25 for a small dog, 70 for a large dog"
                />
              </div>
              <div className="space-y-2 group">
                <label htmlFor="age" className="block text-sm font-medium mb-1 text-gray-700 group-hover:text-blue-600 transition-colors">
                  Age (years) *
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={state.dogInfo.age}
                  onChange={handleDogInfoChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70"
                  required
                  placeholder="E.g., 2 for adult, 0.5 for puppy, 8 for senior"
                />
              </div>
              <div className="space-y-2 group">
                <label htmlFor="healthIssues" className="block text-sm font-medium mb-1 text-gray-700 group-hover:text-orange-600 transition-colors">
                  Health Issues (optional)
                </label>
                <input
                  type="text"
                  id="healthIssues"
                  name="healthIssues"
                  value={state.dogInfo.healthIssues}
                  onChange={handleDogInfoChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white/70"
                  placeholder="E.g., joint pain, allergies, sensitive stomach (separate with commas)"
                />
              </div>
              <div className="space-y-2 group">
                <label htmlFor="dietaryRestrictions" className="block text-sm font-medium mb-1 text-gray-700 group-hover:text-orange-600 transition-colors">
                  Dietary Restrictions (optional)
                </label>
                <input
                  type="text"
                  id="dietaryRestrictions"
                  name="dietaryRestrictions"
                  value={state.dogInfo.dietaryRestrictions}
                  onChange={handleDogInfoChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white/70"
                  placeholder="E.g., grain-free, chicken-free, limited ingredients (separate with commas)"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Products Section */}
        <Card className="shadow-lg bg-white/80 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
              <span>Search Products</span>
              <span className="text-2xl animate-bounce">🔍</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Discover the perfect products for your furry friend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                suggestions={COMMON_CATEGORIES}
                recentSearches={searchHistory.map(item => ({ type: item.type, text: item.text, icon: '🕒' }))}
                className="w-full"
              />
            </div>

            {/* Quick Category Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Popular Categories</h3>
              <div className="flex flex-wrap gap-2">
                {COMMON_CATEGORIES.slice(0, 8).map((category, index) => (
                  <button
                    key={category.text}
                    onClick={() => handleSearch(category.text)}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-blue-100 hover:from-orange-200 hover:to-blue-200 text-gray-800 text-sm border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {state.error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{state.error}</span>
              </div>
            )}

            {state.loading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Section */}
      {state.recommendations.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Recommendations for {state.category}</h2>
          <div className="grid grid-cols-1 gap-6">
            {state.recommendations.map((item, index) => (
              <Card key={index} className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">{item.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.score >= 90 ? 'bg-green-100 text-green-800' :
                          item.score >= 75 ? 'bg-blue-100 text-blue-800' :
                          item.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.score >= 90 ? 'Excellent' :
                           item.score >= 75 ? 'Great' :
                           item.score >= 60 ? 'Good' :
                           'Poor'} Recommendation
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end ml-4">
                      <div className="relative w-20">
                        <div className="relative">
                          <svg viewBox="0 0 36 20" className="w-20">
                            <path
                              d="M2 18a16 16 0 0 1 32 0"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                            <path
                              d="M2 18a16 16 0 0 1 32 0"
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeDasharray={`${(item.score / 100) * 50.24} 50.24`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: '12px' }}>
                            <div className="text-2xl font-bold text-gray-800">{Math.round(item.score)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-5 mb-4">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {`Perfect for ${state.dogInfo.name}: ${item.reason}`}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    {item.affiliateLink ? (
                      <a
                        href={item.affiliateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                        onClick={(e) => {
                          console.log('Opening Amazon link for:', item.name);
                          console.log('Affiliate Link:', item.affiliateLink);
                          console.log('Price:', item.price);
                        }}
                      >
                        View on Amazon
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <div className="mt-4 px-4 py-2 bg-gray-200 text-gray-600 rounded-lg flex items-center justify-center gap-2">
                        Amazon link not available
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Add More Recommendations Button */}
          <div className="flex justify-center mt-8 space-x-4">
            {state.pagination.totalPages > state.pagination.currentPage && (
              <Button
                onClick={handleLoadMore}
                disabled={state.loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {state.loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading More...
                  </>
                ) : (
                  'Load More Results'
                )}
              </Button>
            )}
            
            <Button
              onClick={handleMoreRecommendations}
              disabled={state.loading}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              {state.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding More...
                </>
              ) : (
                <>
                  Get More Recommendations
                  <span className="ml-2">✨</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}