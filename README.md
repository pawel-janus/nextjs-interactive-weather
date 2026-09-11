# Weather Dashboard - Next.js SSR POC

Simple weather application demonstrating **Server-Side Rendering (SSR)** with Next.js 16 App Router.

## Overview

This POC explores Next.js SSR fundamentals by building a real-time weather dashboard that fetches data server-side and renders complete HTML before sending to the browser.

**Live data:** Current weather for Warsaw from [wttr.in](https://wttr.in) API with weather icon

## Tech Stack

- **Next.js 16.3.4** - React framework with SSR
- **React 19.2.8** - Server Components & Suspense
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling with CSS-based config
- **Turbopack** - Fast dev server (Rust-based)

## Key Features

### Server-Side Rendering (SSR)
- Async Server Components fetch data on every request
- HTML includes weather data before reaching browser
- No client-side loading spinners for initial data
- SEO-friendly (complete HTML in page source)

### Suspense Boundaries
- Loading skeleton while fetching weather data
- Progressive rendering - instant page shell, then content
- Better perceived performance

### Error Handling
- Custom `error.tsx` boundary catches fetch failures
- Retry button for network errors
- Graceful degradation

### Dark Mode
- Automatic based on system preference (`prefers-color-scheme`)
- CSS variables + Tailwind dark mode classes
- No JavaScript required

## Project Structure

```
app/
  layout.tsx       # Root layout, fonts, metadata
  page.tsx         # Weather Dashboard (SSR)
  error.tsx        # Error boundary with retry
  globals.css      # Tailwind + theme config
public/            # Static assets
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

1. Open the page in browser
2. Right-click → "View Page Source"
3. Search for temperature value (e.g., "15°C")
4. ✅ Data is in HTML source = Server-Side Rendered!

## How It Works

### Server Component (async)
```tsx
async function WeatherData() {
  const res = await fetch('https://wttr.in/Warsaw?format=j1', {
    cache: 'no-store' // Always fresh data (SSR)
  });
  
  const data = await res.json();
  const current = data.current_condition[0];
  
  return (
    <div>
      <img src={current.weatherIconUrl[0].value} alt={current.weatherDesc[0].value} />
      <div>{current.temp_C}°C</div>
    </div>
  );
}
```

### Suspense Boundary
```tsx
<Suspense fallback={<LoadingSkeleton />}>
  <WeatherData />
</Suspense>
```

**Flow:**
1. Request → Next.js server
2. Server executes `await fetch()`
3. Server renders HTML with real data
4. Server sends complete HTML to browser
5. Browser displays instantly (no loading)

## What I Learned

### Next.js 16 Features
- **App Router** - file-based routing (`app/page.tsx` → `/`)
- **Server Components** - async/await in components (game changer!)
- **Suspense** - built-in loading states
- **Error boundaries** - `error.tsx` auto-wraps pages

### SSR vs CSR
| | SSR (this POC) | CSR (traditional React) |
|---|---|---|
| **First paint** | Instant (HTML ready) | Blank (wait for JS) |
| **SEO** | Excellent (full HTML) | Poor (empty div) |
| **Data fetching** | Server-side | Client-side (useEffect) |
| **Loading state** | Suspense fallback | Manual useState |

### Tailwind v4 Changes
- Config in CSS (`@theme inline`) not `tailwind.config.js`
- Faster hot reload (CSS only, no JS rebuild)
- CSS variables for design tokens

### Next.js Conventions
- `layout.tsx` - wraps all pages (fonts, metadata)
- `page.tsx` - route endpoint (`export default function`)
- `error.tsx` - auto error boundary
- `loading.tsx` - auto Suspense fallback (not used here, manual Suspense instead)

## Build for Production

```bash
npm run build
npm start
```

## Docker Build

Multi-stage Dockerfile optimized for Cloud Run:

```bash
docker build -t nextjs-weather:latest .
docker run -p 3000:3000 nextjs-weather:latest
```

**Features:**
- Multi-stage build (deps → builder → runner)
- `output: 'standalone'` for minimal image size
- node:20-alpine base (small footprint)
- Non-root user for security
- Optimized layer caching

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
  --tag ${REGION}-docker.pkg.dev/${PROJECT_ID}/nextjs-apps/weather-dashboard:latest

# 2. Deploy to Cloud Run
gcloud run deploy weather-dashboard \
  --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/nextjs-apps/weather-dashboard:latest \
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
gcloud run services describe weather-dashboard \
  --region=europe-central2 \
  --format='value(status.url)'
```

### Verify SSR in Production

```bash
# Fetch HTML and check if weather data is in the source
curl -s $(gcloud run services describe weather-dashboard \
  --region=europe-central2 \
  --format='value(status.url)') | grep "°C"
```

If you see temperature in the output → SSR works! ✅

## Commits

Clean git history documenting each step:
- `Initial commit from Create Next App` - Project scaffolding
- `Add Weather Dashboard with SSR` - Core implementation
- `Add comprehensive documentation` - README with learnings
- `Add weather icon from wttr.in API` - Visual enhancement
- `Add Docker support for Cloud Run deployment` - Containerization

## Future Enhancements

- [ ] Multi-city support (dropdown selector)
- [ ] 7-day forecast
- [ ] Docker + Cloud Run deployment
- [ ] CI/CD with GitHub Actions

## Part of React/Next.js POC Series

This is POC #1 in a series exploring React and Next.js patterns:
1. **Next.js SSR Basics** ← You are here
2. Next.js Client Components & Hydration
3. Next.js API Routes
4. Next.js + Database Integration
5. Next.js + Authentication
6. ISR/SSG Strategies
7. React Server Actions

---

**Learning focus:** Server-Side Rendering fundamentals  
**Status:** ✅ Core implementation complete  
**Next:** Cloud Run deployment or new POC
