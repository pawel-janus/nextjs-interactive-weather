'use client';

import { useState, FormEvent, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function CitySelector() {
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const trimmedCity = city.trim();
    if (!trimmedCity) {
      setError('Please enter a city name');
      return;
    }

    try {
      const response = await fetch('/api/cities/recent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city: trimmedCity }),
      });

      if (!response.ok) {
        setError('Failed to save city');
        return;
      }

      // Clear input and navigate to new city (updates URL searchParams)
      setCity('');
      startTransition(() => {
        router.push(`/?city=${encodeURIComponent(trimmedCity)}`);
      });
    } catch (err) {
      setError('Something went wrong');
      console.error('Error saving city:', err);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isPending}
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Loading...' : 'Search'}
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </form>
    </div>
  );
}
