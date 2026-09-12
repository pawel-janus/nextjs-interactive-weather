import { Suspense } from 'react';
import { CitySelector } from '@/app/_components/CitySelector';
import { RecentSearches } from '@/app/_components/RecentSearches';

async function WeatherData({ city }: { city: string }) {
  const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, {
    cache: 'no-store', // Always fetch fresh data (SSR)
  });

  if (!res.ok) {
    throw new Error(`Weather API error: ${res.status}`);
  }

  const data = await res.json();

  if (!data.current_condition?.[0]) {
    throw new Error('Invalid weather data format');
  }

  const current = data.current_condition[0];

  const iconUrl = current.weatherIconUrl[0].value;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 min-w-[300px]">
      <div className="text-center">
        <img
          src={iconUrl}
          alt={current.weatherDesc[0].value}
          width={64}
          height={64}
          loading="lazy"
          className="mx-auto mb-4"
        />
        <div className="text-6xl font-bold text-foreground mb-2">
          {current.temp_C}°C
        </div>
        <div className="text-xl text-gray-600 dark:text-gray-400">
          {current.weatherDesc[0].value}
        </div>
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-500">
          Wind: {current.windspeedKmph} km/h
        </div>
      </div>
    </div>
  );
}

function LoadingWeather() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 min-w-[300px]">
      <div className="text-center animate-pulse">
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto mb-2"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto mt-4"></div>
      </div>
    </div>
  );
}

export default async function WeatherDashboard({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const params = await searchParams;
  const city = params.city || 'Warsaw';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 space-y-8">
        <h1 className="text-4xl font-bold text-foreground">
          Interactive Weather Dashboard
        </h1>

        {/* City search form (Client Component) */}
        <CitySelector />

        {/* Current city weather */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            {city}
          </h2>
          <Suspense fallback={<LoadingWeather />}>
            <WeatherData city={city} />
          </Suspense>
        </div>

        {/* Recent searches (Client Component) */}
        <RecentSearches />
      </div>
    </div>
  );
}
