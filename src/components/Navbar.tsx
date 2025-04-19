'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="relative w-12 h-12 mr-3 animate-float">
                <svg 
                  className="w-full h-full text-primary transform transition-transform group-hover:scale-110" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M17 12c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zM7 12c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm5-16c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
                </svg>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse"></div>
              </div>
              <span className="text-2xl font-fredoka font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Bark Advisor
              </span>
            </Link>
          </div>
          
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <Link
              href="/"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                pathname === '/'
                ? 'bg-primary text-white shadow-md transform -translate-y-0.5'
                : 'text-gray-500 hover:text-primary hover:bg-orange-50'
              }`}
            >
              Home
            </Link>
            <Link
              href="/search"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                pathname === '/search'
                ? 'bg-primary text-white shadow-md transform -translate-y-0.5'
                : 'text-gray-500 hover:text-primary hover:bg-orange-50'
              }`}
            >
              Product Search
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 