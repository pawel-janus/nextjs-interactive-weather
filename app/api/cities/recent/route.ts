import { NextRequest, NextResponse } from 'next/server';
import {
  addCityRequestSchema,
  recentCitySchema,
  type RecentCitiesResponse,
  type AddCityResponse,
  type RecentCity,
} from '@/types/weather';

// In-memory storage for recent cities (Map: city name -> RecentCity)
// This will reset when the server restarts - fine for POC
const recentCities = new Map<string, RecentCity>();

/**
 * GET /api/cities/recent
 * Returns list of recent cities (last 5, sorted by timestamp desc)
 */
export async function GET(): Promise<NextResponse<RecentCitiesResponse>> {
  const cities = Array.from(recentCities.values())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  return NextResponse.json({ cities });
}

/**
 * POST /api/cities/recent
 * Adds a city to recent searches
 */
export async function POST(request: NextRequest): Promise<NextResponse<AddCityResponse>> {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const validationResult = addCityRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, city: '' },
        { status: 400 }
      );
    }

    const { city } = validationResult.data;
    const normalizedCity = city.trim();

    // Create city object and validate with schema
    const cityObject: RecentCity = {
      name: normalizedCity,
      timestamp: Date.now(),
    };

    // Validate city object (ensures data integrity)
    recentCitySchema.parse(cityObject);

    // Add or update city with current timestamp (use lowercase as key for deduplication)
    recentCities.set(normalizedCity.toLowerCase(), cityObject);

    return NextResponse.json({ success: true, city: normalizedCity });
  } catch (error) {
    console.error('Error adding city:', error);
    return NextResponse.json(
      { success: false, city: '' },
      { status: 500 }
    );
  }
}
