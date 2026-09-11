import { Suspense } from 'react';

async function WeatherData() {
  const res = await fetch('https://wttr.in/Warsaw?format=j1', {
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

export default function WeatherDashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold mb-8 text-foreground">
          Warsaw Weather
        </h1>

        <Suspense fallback={<LoadingWeather />}>
          <WeatherData />
        </Suspense>
      </div>
    </div>
  );
}
