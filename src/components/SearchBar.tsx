import React, { useState, useEffect, useRef } from 'react';

interface SearchSuggestion {
  type: 'category' | 'recent';
  text: string;
  icon?: string;
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  suggestions: SearchSuggestion[];
  recentSearches: SearchSuggestion[];
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  suggestions,
  recentSearches,
  className = '',
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const allSuggestions = [
    ...recentSearches.map(s => ({ ...s, label: 'Recent' })),
    ...suggestions.map(s => ({ ...s, label: 'Categories' }))
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowSuggestions(true);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => 
        prev < allSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0) {
        handleSuggestionClick(allSuggestions[focusedIndex].text);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setFocusedIndex(-1);
    }
  };

  const handleSuggestionClick = (text: string) => {
    onChange(text);
    onSearch(text);
    setShowSuggestions(false);
    setFocusedIndex(-1);
  };

  const handleSearch = () => {
    if (value.trim()) {
      onSearch(value);
      setShowSuggestions(false);
      setFocusedIndex(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-primary pl-12 pr-12"
          placeholder="Search for dog products or categories..."
        />
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          onClick={handleSearch}
          className="absolute inset-y-0 right-0 pr-4 flex items-center"
        >
          <span className="sr-only">Search</span>
          <svg className="h-5 w-5 text-gray-400 hover:text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {showSuggestions && allSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
        >
          {recentSearches.length > 0 && (
            <div className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50">
              Recent Searches
            </div>
          )}
          {recentSearches.map((suggestion, index) => (
            <button
              key={`recent-${suggestion.text}`}
              onClick={() => handleSuggestionClick(suggestion.text)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2
                ${focusedIndex === index ? 'bg-gray-100' : ''}`}
            >
              <span className="text-gray-400">🕒</span>
              <span>{suggestion.text}</span>
            </button>
          ))}

          {suggestions.length > 0 && (
            <div className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50">
              Categories
            </div>
          )}
          {suggestions.map((suggestion, index) => (
            <button
              key={`category-${suggestion.text}`}
              onClick={() => handleSuggestionClick(suggestion.text)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2
                ${focusedIndex === index + recentSearches.length ? 'bg-gray-100' : ''}`}
            >
              <span>{suggestion.icon}</span>
              <span>{suggestion.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 