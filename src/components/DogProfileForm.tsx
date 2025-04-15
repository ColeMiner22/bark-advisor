'use client'

import { useState } from 'react'

interface DogProfile {
  name: string
  breed: string
  age: string
  weight: string
  specialNeeds: string
}

export default function DogProfileForm() {
  const [profile, setProfile] = useState<DogProfile>({
    name: '',
    breed: '',
    age: '',
    weight: '',
    specialNeeds: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Handle form submission
    console.log('Form submitted:', profile)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Dog's Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={profile.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          required
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
          value={profile.breed}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700">
          Age
        </label>
        <input
          type="text"
          id="age"
          name="age"
          value={profile.age}
          onChange={handleChange}
          placeholder="e.g., 2 years"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
          Weight
        </label>
        <input
          type="text"
          id="weight"
          name="weight"
          value={profile.weight}
          onChange={handleChange}
          placeholder="e.g., 25 lbs"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="specialNeeds" className="block text-sm font-medium text-gray-700">
          Special Needs/Notes
        </label>
        <textarea
          id="specialNeeds"
          name="specialNeeds"
          value={profile.specialNeeds}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Add Dog Profile
        </button>
      </div>
    </form>
  )
} 