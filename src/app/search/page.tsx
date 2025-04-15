'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DogProfile } from '@/types/dog-profile';
import { ProductAnalysis, analyzeProduct } from '@/lib/services/openai.service';
import { dogProfileService } from '@/lib/services/dog-profile.service';

export default function SearchPage() {
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [dogProfile, setDogProfile] = useState<DogProfile | null>(null);
  const router = useRouter();

  // Fetch dog profile on component mount
  useEffect(() => {
    const fetchDogProfile = async () => {
      try {
        const profiles = await dogProfileService.getUserDogProfiles();
        if (profiles && profiles.length > 0) {
          setDogProfile(profiles[0]);
        } else {
          setError('Please create a dog profile first to use the product search feature.');
        }
      } catch (err) {
        console.error('Error fetching dog profile:', err);
        setError('Failed to load your dog profile');
      }
    };

    fetchDogProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dogProfile) {
      router.push('/dashboard');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeProduct(productName, dogProfile);
      setAnalysis(result);
    } catch (err) {
      console.error('Error analyzing product:', err);
      setError('Failed to analyze the product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 font-poppins">Product Search & Analysis</h1>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-6 shadow-soft" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name..."
              className="flex-1 rounded-xl border-gray-300 shadow-soft focus:border-primary focus:ring-primary"
              required
            />
            <button
              type="submit"
              disabled={loading || !dogProfile}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 shadow-soft"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </form>

        {loading && (
          <div className="text-center py-8">
            <div className="text-lg text-gray-600">Analyzing product compatibility...</div>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-white rounded-xl shadow-soft-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 font-poppins">Compatibility Score</h2>
                <span className="text-3xl font-bold text-primary">{analysis.score}/100</span>
              </div>
              <p className="text-gray-600">{analysis.explanation}</p>
            </div>

            {/* Alternative Products */}
            <div className="bg-white rounded-xl shadow-soft-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 font-poppins">Recommended Alternatives</h2>
              <div className="grid gap-4">
                {analysis.alternatives.map((alt, index) => (
                  <div key={index} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 shadow-soft transition-all duration-200">
                    <h3 className="font-medium text-primary mb-2 font-poppins">{alt.name}</h3>
                    <p className="text-gray-600">{alt.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 