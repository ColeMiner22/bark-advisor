import React from 'react'
import DogProfileForm from '@/components/DogProfileForm'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Bark Advisor Dashboard</h1>
        
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Total Dogs</h2>
            <p className="text-3xl font-bold text-primary">12</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Active Care Plans</h2>
            <p className="text-3xl font-bold text-primary">8</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Upcoming Appointments</h2>
            <p className="text-3xl font-bold text-primary">5</p>
          </div>
        </div>

        {/* Dog Profile Form Section */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Add New Dog Profile</h2>
          <DogProfileForm />
        </div>
      </div>
    </main>
  )
} 