'use client';

import React, { useState, useEffect } from 'react';

interface DogProfile {
  name: string;
  breed: string;
  weight: number;
  vet_issues?: string;
  dietary_restrictions?: string;
}

export default function DogProfileForm() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dogProfile, setDogProfile] = useState<DogProfile>({
    name: '',
    breed: '',
    weight: 0,
    vet_issues: '',
    dietary_restrictions: ''
  });

  useEffect(() => {
    // Load profile from local storage
    const savedProfile = localStorage.getItem('dogProfile');
    if (savedProfile) {
      setDogProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDogProfile(prev => ({
      ...prev,
      [name]: name === 'weight' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Save to local storage
      localStorage.setItem('dogProfile', JSON.stringify(dogProfile));
      setSuccess('Dog profile saved successfully!');
    } catch (err) {
      console.error('Error saving dog profile:', err);
      setError('Failed to save your dog profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white shadow-soft-lg rounded-xl p-6 border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 font-poppins">
        Your Dog Profile
      </h2>
      
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4 shadow-soft" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded-xl relative mb-4 shadow-soft" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Dog's Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={dogProfile.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-xl shadow-soft py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="breed" className="block text-sm font-medium text-gray-700">
            Breed
          </label>
          <input
            type="text"
            id="breed"
            name="breed"
            value={dogProfile.breed}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-xl shadow-soft py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
            Weight (lbs)
          </label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={dogProfile.weight}
            onChange={handleChange}
            required
            min="0"
            className="mt-1 block w-full border border-gray-300 rounded-xl shadow-soft py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="vet_issues" className="block text-sm font-medium text-gray-700">
            Veterinary Issues (optional)
          </label>
          <textarea
            id="vet_issues"
            name="vet_issues"
            value={dogProfile.vet_issues || ''}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-xl shadow-soft py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="Any health conditions, allergies, or medications"
          />
        </div>
        
        <div>
          <label htmlFor="dietary_restrictions" className="block text-sm font-medium text-gray-700">
            Dietary Restrictions (optional)
          </label>
          <textarea
            id="dietary_restrictions"
            name="dietary_restrictions"
            value={dogProfile.dietary_restrictions || ''}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-xl shadow-soft py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="Any food allergies or special dietary needs"
          />
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
} 