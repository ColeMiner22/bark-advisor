'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentUser, signOut } from '@/lib/auth';
import { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-800">
            Bark Advisor
          </Link>
          
          <div className="flex space-x-4">
            <Link 
              href="/" 
              className={`text-gray-600 hover:text-gray-900 ${pathname === '/' ? 'font-medium' : ''}`}
            >
              Home
            </Link>
            <Link 
              href="/about" 
              className={`text-gray-600 hover:text-gray-900 ${pathname === '/about' ? 'font-medium' : ''}`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`text-gray-600 hover:text-gray-900 ${pathname === '/contact' ? 'font-medium' : ''}`}
            >
              Contact
            </Link>
            
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link 
                      href="/dashboard" 
                      className={`text-gray-600 hover:text-gray-900 ${pathname === '/dashboard' ? 'font-medium' : ''}`}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className={`text-gray-600 hover:text-gray-900 ${pathname === '/login' ? 'font-medium' : ''}`}
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/signup" 
                      className={`text-gray-600 hover:text-gray-900 ${pathname === '/signup' ? 'font-medium' : ''}`}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 