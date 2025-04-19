'use client'

import React from 'react'
import { DogProfileInput } from '@/types/dog-profile'

interface DogProfileFormProps {
  dogProfile: DogProfileInput
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSubmit?: (e: React.FormEvent) => void
  showSubmitButton?: boolean
  className?: string
}

export const DogProfileForm: React.FC<DogProfileFormProps> = ({
  dogProfile,
  onChange,
  onSubmit,
  showSubmitButton = false,
  className = '',
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Dog's Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={dogProfile.name}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
            value={dogProfile.breed}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
            value={dogProfile.weight || ''}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="e.g., 70"
            min="0"
            required
          />
        </div>
        
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
            Age
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={dogProfile.age || ''}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="e.g., 5"
            min="0"
            required
          />
        </div>
        
        <div>
          <label htmlFor="dietary_restrictions" className="block text-sm font-medium text-gray-700 mb-1">
            Dietary Restrictions (comma-separated)
          </label>
          <input
            type="text"
            id="dietary_restrictions"
            name="dietary_restrictions"
            value={dogProfile.dietary_restrictions || ''}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="e.g., chicken, grains"
          />
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="vet_issues" className="block text-sm font-medium text-gray-700 mb-1">
            Health Issues (comma-separated)
          </label>
          <input
            type="text"
            id="vet_issues"
            name="vet_issues"
            value={dogProfile.vet_issues || ''}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="e.g., allergies, joint pain"
          />
        </div>
      </div>
      
      {showSubmitButton && (
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary"
          >
            Save Profile
          </button>
        </div>
      )}
    </form>
  )
} 