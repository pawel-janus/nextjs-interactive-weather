# Interactive Weather Dashboard - Next.js POC

Interactive weather application demonstrating **Client Components**, **API Routes**, and **state management** with Next.js 16 App Router.

## Overview

This POC explores the full Next.js client/server architecture by building an interactive weather dashboard where users can search for any city, see current weather (SSR), and view recent searches stored via API Routes.

**Key concepts:** Client vs Server Components boundary, API Routes with Zod validation, in-memory state, hydration, and shared TypeScript types.

## Tech Stack

- **Next.js 16.3.4** - React framework with App Router
- **React 19.2.8** - Server Components & Client Components
- **TypeScript** - Type safety across frontend and backend
- **Zod** - Runtime schema validation for API Routes
- **Tailwind CSS v4** - Styling with CSS-based config
- **Turbopack** - Fast dev server (Rust-based)

## Key Features

### Interactive City Search (Client Component)
- Input field for any city name
- Submit button triggers API call
- `useState` for local form state
- `useRouter().refresh()` to re-render Server Components

### Recent Searches (Client Component + API Routes)
- Last 5 searched cities stored in-memory
- `useEffect` fetches data on mount
- Click to search again
- Timestamps for each search

### API Routes with Zod Validation
- `POST /api/cities/recent` - Add city to recent searches
- `GET /api/cities/recent` - Get last 5 cities
- Runtime validation with Zod schemas
- Type-safe request/response with inferred types

### Server-Side Rendering (SSR)
- Weather data fetched server-side (no client loading)
- HTML includes weather before reaching browser
- SEO-friendly (complete HTML in page source)

### Shared TypeScript Types
- Single source of truth: Zod schemas → TypeScript types
- Type safety across frontend and backend
- `types/weather.ts` imported by both Client Components and API Routes

### Client vs Server Boundary
- Server Components: async data fetching (weather API)
- Client Components: user interaction (form, state)
- Demonstrates when to use `'use client'` directive

## Project Structure

```
app/
  layout.tsx                    # Root layout, fonts, metadata
  page.tsx                      # Weather Dashboard (Server Component)
  error.tsx                     # Error boundary with retry
  globals.css                   # Tailwind + theme config
  api/
    cities/
      recent/
        route.ts                # API Route: GET/POST recent cities
types/
  weather.ts                    # Shared Zod schemas + TypeScript types
components/                     # (Phase 3 - to be added)
  CitySelector.tsx              # Client Component: city search form
  RecentSearches.tsx            # Client Component: recent cities list
```

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Verify SSR

1. Open the page in browser (http://localhost:3000)
2. Right-click → "View Page Source"
3. Search for temperature value (e.g., "15°C")
4. ✅ Data is in HTML source = Server-Side Rendered!

### Test API Routes

```bash
# Get recent cities (should be empty initially)
curl http://localhost:3000/api/cities/recent | jq .

# Add a city
curl -X POST http://localhost:3000/api/cities/recent \
  -H "Content-Type: application/json" \
  -d '{"city":"London"}' | jq .

# Get recent cities again (should show London)
curl http://localhost:3000/api/cities/recent | jq .

# Test validation (should return 400)
curl -X POST http://localhost:3000/api/cities/recent \
  -H "Content-Type: application/json" \
  -d '{"city":""}' | jq .
```

## How It Works

### API Route with Zod Validation
```tsx
// app/api/cities/recent/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Validate with Zod
  const validationResult = addCityRequestSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
  
  const { city } = validationResult.data;
  recentCities.set(city.toLowerCase(), { name: city, timestamp: Date.now() });
  
  return NextResponse.json({ success: true, city });
}
```

### Shared Zod Schema
```tsx
// types/weather.ts
import { z } from 'zod';

export const addCityRequestSchema = z.object({
  city: z.string().min(1).max(100),
});

export type AddCityRequest = z.infer<typeof addCityRequestSchema>;
```

### Client Component (to be added in Phase 3)
```tsx
'use client';

function CitySelector() {
  const [city, setCity] = useState('');
  const router = useRouter();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/cities/recent', {
      method: 'POST',
      body: JSON.stringify({ city }),
    });
    router.refresh(); // Re-render Server Components
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

**Full Flow:**
1. User types city name → Client Component state (`useState`)
2. Submit → POST `/api/cities/recent` (Zod validates)
3. API saves to in-memory Map
4. `router.refresh()` → Server Components re-render with new city
5. Recent searches update (GET `/api/cities/recent`)

## What I Learned

### Client vs Server Components
| | Server Component | Client Component |
|---|---|---|
| **Directive** | None (default) | `'use client'` at top |
| **Can be async** | ✅ Yes | ❌ No |
| **Can use hooks** | ❌ No (useState, useEffect) | ✅ Yes |
| **Event handlers** | ❌ No (onClick, onChange) | ✅ Yes |
| **When to use** | Data fetching, static UI | User interaction, state |
| **Hydration** | N/A (stays on server) | HTML → React takeover |

### API Routes (App Router)
- File: `app/api/*/route.ts` (not `pages/api/*` from Pages Router)
- Export named functions: `GET`, `POST`, `PUT`, `DELETE`
- Use `NextRequest` and `NextResponse` (not Node.js `req`/`res`)
- Return `NextResponse.json()` for JSON responses
- Validation best practice: Zod `safeParse()` before processing

### Zod for Type Safety
- **Schema definition** → automatic TypeScript types (`z.infer<>`)
- **Runtime validation** → `safeParse()` returns `success` boolean
- **Single source of truth** → no duplicate interfaces
- **Shared types** → same schema for frontend and backend

### Hydration Process
1. Server renders Server Components to HTML
2. HTML includes Client Component placeholders
3. Browser receives HTML (instant visual)
4. React JS bundle loads
5. Client Components "hydrate" (HTML → interactive React)
6. Event handlers attach, state initializes

### Next.js Conventions
- `app/api/*/route.ts` - API Routes (backend endpoints)
- `'use client'` - marks Client Component boundary
- `useRouter()` from `'next/navigation'` (not `'next/router'`)
- `router.refresh()` - re-render Server Components without page reload

## Build for Production

```bash
npm run build
npm start
```

## Docker Build

Multi-stage Dockerfile optimized for Cloud Run:

```bash
# Build locally
docker build -t nextjs-interactive-weather:latest .

# Run locally
docker run -p 3000:3000 nextjs-interactive-weather:latest
```

**Features:**
- Multi-stage build (deps → builder → runner)
- `output: 'standalone'` for minimal image size
- node:20-alpine base (small footprint)
- Non-root user for security
- Optimized layer caching

**Note:** In-memory storage (recentCities Map) resets when container restarts - this is expected for POC. Phase 3+ will add persistent storage.

## Cloud Run Deployment

### Prerequisites

**GCP Setup:**
```bash
# 1. Create Artifact Registry repository (one-time setup for all Next.js POCs)
gcloud artifacts repositories create nextjs-apps \
  --repository-format=docker \
  --location=europe-central2 \
  --description="Docker images for Next.js POC applications"

# 2. Create Service Account (one-time setup for all Next.js POCs)
gcloud iam service-accounts create nextjs-apps-sa \
  --display-name="Next.js Applications Service Account"
```

**Note:** These are shared resources for all Next.js POC applications.

### Deploy to Cloud Run

```bash
# Set variables
PROJECT_ID=your-gcp-project-id
REGION=europe-central2

# 1. Build Docker image with Cloud Build
gcloud builds submit \
  --tag ${REGION}-docker.pkg.dev/${PROJECT_ID}/nextjs-apps/interactive-weather:latest

# 2. Deploy to Cloud Run
gcloud run deploy interactive-weather \
  --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/nextjs-apps/interactive-weather:latest \
  --platform=managed \
  --region=${REGION} \
  --service-account=nextjs-apps-sa@${PROJECT_ID}.iam.gserviceaccount.com \
  --allow-unauthenticated \
  --port=3000 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10
```

### Get Service URL

After deployment, get your service URL:

```bash
gcloud run services describe interactive-weather \
  --region=${REGION} \
  --format='value(status.url)'
```

### Verify in Production

```bash
# Get the service URL
SERVICE_URL=$(gcloud run services describe interactive-weather \
  --region=${REGION} \
  --format='value(status.url)')

# Verify SSR (weather data in HTML source)
curl -s ${SERVICE_URL} | grep "°C"

# Test API Routes
curl -s ${SERVICE_URL}/api/cities/recent | jq .
curl -X POST ${SERVICE_URL}/api/cities/recent \
  -H "Content-Type: application/json" \
  -d '{"city":"Paris"}' | jq .
```

If you see temperature and API responses → deployment works! ✅

**Note:** In-memory storage resets on each Cloud Run cold start - expected for POC.

## Development Progress

### Phase 1: Project Setup ✅
- Fork from POC #1 (nextjs-ssr-basics)
- Clean git history
- Package renamed to `nextjs-interactive-weather`
- Verified local dev server works

### Phase 2: API Routes ✅
- Installed Zod for runtime validation
- Created shared types with Zod schemas (`types/weather.ts`)
- Implemented `GET /api/cities/recent` (returns last 5 cities)
- Implemented `POST /api/cities/recent` (add city to in-memory Map)
- Tested with curl (valid and invalid requests)

### Phase 3: Client Components 🔄 (Next)
- [ ] Create `CitySelector.tsx` (Client Component with useState)
- [ ] Create `RecentSearches.tsx` (Client Component with useEffect)
- [ ] Integrate with Server Component
- [ ] Test full user flow

### Phase 4-8: Remaining
- UI enhancements (loading states, error handling)
- Local testing (edge cases)
- Docker + Cloud Run deployment
- Documentation update

## Commits

Clean git history documenting each step:
- `Initial commit - Weather Dashboard base (forked from nextjs-ssr-basics)`
- `Add API Routes for recent cities with Zod validation`
- (more to come as POC progresses)

## Part of React/Next.js POC Series

This is POC #2 in a series exploring React and Next.js patterns:
1. ✅ **Next.js SSR Basics** - Server-Side Rendering fundamentals
2. 🔄 **Interactive Weather Dashboard** ← You are here
3. Next.js + Database (Firestore/Cloud SQL integration)
4. Next.js + Authentication (Firebase Auth or NextAuth)
5. ISR/SSG Strategies
6. React Server Actions

---

**Learning focus:** Client Components, API Routes, Client/Server boundary  
**Status:** 🔄 Phase 2 complete (API Routes), Phase 3 in progress  
**Next:** Client Components (CitySelector, RecentSearches)
