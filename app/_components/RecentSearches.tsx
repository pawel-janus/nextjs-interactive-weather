'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { RecentCity } from '@/types/weather';

export function RecentSearches() {
  const [cities, setCities] = useState<RecentCity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchRecentCities();
  }, [searchParams]); // Re-fetch when URL changes

  const fetchRecentCities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cities/recent');

      if (!response.ok) {
        throw new Error('Failed to fetch recent cities');
      }

      const data = await response.json();
      setCities(data.cities || []);
    } catch (err) {
      setError('Failed to load recent searches');
      console.error('Error fetching recent cities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCityClick = async (cityName: string) => {
    try {
      // Save clicked city as recent
      await fetch('/api/cities/recent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city: cityName }),
      });

      // Navigate to show weather for clicked city (updates URL)
      router.push(`/?city=${encodeURIComponent(cityName)}`);
    } catch (err) {
      console.error('Error selecting city:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
          Recent Searches
        </h3>
        <div className="animate-pulse flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-20"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (cities.length === 0) {
    return (
      <div className="w-full max-w-md">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
          Recent Searches
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          No recent searches yet. Try searching for a city!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
        Recent Searches
      </h3>
      <div className="flex flex-wrap gap-2">
        {cities.map((city) => (
          <button
            key={city.timestamp}
            onClick={() => handleCityClick(city.name)}
            className="px-4 py-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-sm text-foreground hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {city.name}
          </button>
        ))}
      </div>
    </div>
  );
}
