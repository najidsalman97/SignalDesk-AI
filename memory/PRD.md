# SignalDesk AI - Product Requirements Document

## Overview
SignalDesk AI is a frontend-only React application for analyzing customer feedback. The core flow is: **Upload Reviews → Preview Import → Analyze with AI → Professional Dashboard → Export Report**.

## Architecture
- **Frontend-only**: React 19, TypeScript, Vite, Tailwind CSS v4, Zustand (with localStorage persistence)
- **NO BACKEND**: Strictly forbidden by user - all data stored in browser localStorage
- **AI Providers**: Direct browser fetch to Gemini, OpenAI, OpenRouter, Groq, Ollama APIs
- **Exports**: jsPDF for PDF generation, native JSON/Markdown

## Tech Stack
```
/app/
├── src/
│   ├── app/           # Layout components (AppLayout.tsx)
│   ├── features/      # Page modules (analysis, dashboard, landing, reports, settings, sources, connectors)
│   ├── shared/        # Reusable UI components (Sidebar, Navbar, MetricCard, EmptyState)
│   ├── store/         # Zustand state management
│   ├── services/      
│   │   ├── ai/
│   │   │   ├── engine/           # NEW: Production AI Engine
│   │   │   │   ├── index.ts      # Main orchestrator
│   │   │   │   ├── tokenEstimator.ts
│   │   │   │   ├── chunkManager.ts
│   │   │   │   ├── retryHandler.ts
│   │   │   │   ├── progressReporter.ts
│   │   │   │   ├── partialResult.ts
│   │   │   │   ├── providerAdapter.ts
│   │   │   │   └── prompts.ts
│   │   │   ├── providers/        # Provider implementations
│   │   │   └── providerService.ts
│   │   ├── connectors/
│   │   └── parsers/
│   ├── data/          # Demo dataset (demoReviews.ts)
│   ├── index.css      # Global Tailwind/Theme styles
├── vite.config.ts     # Vite configuration (allowedHosts: true for preview URL)
```

## Implemented Features

### ✅ Core MVP (Completed)
1. **Universal Intake** - Import from CSV, Excel, JSON, TXT, DOCX
2. **Demo Data** - 188 realistic mobile app reviews for testing
3. **AI Analysis** - Multi-provider support with auto-fallback
4. **Executive Dashboard** - Severity metrics, issue tracking, communications
5. **Export Reports** - PDF, Markdown, JSON formats

### ✅ Production AI Engine (Completed 2025-06-28)
The AI processing pipeline has been completely redesigned for production scalability:

1. **Intelligent Token Estimation**
   - Estimates prompt size without external tokenizer packages (~4 chars/token)
   - Provider-specific context limits (Gemini: 1M, OpenAI: 128K, Groq: 32K)
   - 70% safety margin to leave room for responses

2. **Smart Chunking**
   - Calculates optimal chunk size based on provider context window
   - Deduplicates reviews by content
   - Optimizes reviews by removing excessive whitespace

3. **Parallel Processing**
   - Configurable concurrency (default: 2 parallel chunks)
   - Respects browser limits and provider rate limits

4. **Retry with Exponential Backoff**
   - Automatically retries on 429, 500, 502, 503, 504 errors
   - Exponential backoff: 1s → 2s → 4s → 8s (with jitter)
   - Detects permanent quota errors (limit:0) and fails fast

5. **Provider Failover**
   - Automatically tries next provider on quota/rate limit errors
   - Maintains priority order from Settings
   - Detailed error reporting when all providers fail

6. **Live Progress Reporting**
   - Real-time progress percentage
   - Chunk progress (e.g., "Chunk 3 of 8")
   - Elapsed time and estimated remaining time
   - Current provider indicator

7. **Fast Mode vs Deep Mode**
   - **Fast Mode**: Samples ~100 representative reviews for quick insights (~15s)
   - **Deep Mode**: Analyzes all reviews with chunking (30-120s for 188 reviews)
   - Mode selector appears when dataset > 100 reviews

8. **Cancellation Support**
   - Cancel button during analysis
   - Aborts outstanding fetch requests
   - Cleans up state properly

### ✅ AI Provider Manager (Completed 2025-06-28)
1. **5 Provider Support**: Gemini, OpenAI, OpenRouter, Groq, Ollama
2. **Test Connection**: Validates API key, shows Connected/Invalid/Unreachable status
3. **Response Time**: Displays API response latency
4. **Model Fetching**: Automatically retrieves available models after connection
5. **Auto-Select Default**: Preselects recommended model per provider
   - Gemini: `gemini-2.5-flash` (gemini-2.0-flash has quota issues)
   - OpenAI: `gpt-4o-mini`
   - Groq: `llama-3.1-8b-instant` (free tier friendly)
   - OpenRouter: `deepseek/deepseek-chat-v3-0324:free` (free tier)
6. **Auto-Fallback**: Tries providers in priority order if one fails
7. **Priority Reordering**: Up/down arrows to change provider priority
8. **Enable/Disable Toggle**: Per-provider activation control
9. **Local Storage**: Secure browser-only credential storage

### ✅ Data Connectors (Completed 2025-06-28)
1. **6 Connector Types**: App Store, Google Play, CSV URL, JSON API, Reddit, Twitter/X
2. **App Store**: Fetches reviews via iTunes RSS API (no API key required)
3. **Google Play**: Configuration ready (requires backend proxy for production)
4. **CSV URL**: Import from any public CSV file with column mapping
5. **JSON API**: Connect to REST APIs with auth headers and data path navigation
6. **Reddit**: Fetch posts from subreddits using public JSON API
7. **Twitter/X**: Configuration ready (requires backend proxy for production)
8. **Sync Status**: Shows Connected/Syncing/Error with last sync timestamp
9. **Review Counter**: Tracks total reviews imported per connector

### ✅ UI/UX Cleanup (Completed 2025-06-28)
1. **Removed**: SD button, duplicate Settings, notification bell, search bar
2. **Removed**: Insights page (redundant), Integrations page (placeholder)
3. **Simplified Navbar**: Only project name + "SignalDesk AI • v1.0"
4. **Clean Sidebar**: Dashboard, Sources, Analysis, Reports, Connectors
5. **Settings Access**: Only via AI Provider card at bottom of sidebar

## Performance Goals (Achieved)

| Reviews | Target Time | Actual |
|---------|-------------|--------|
| 10 | <5s | ✅ |
| 100 | <20s | ✅ |
| 188 (demo) | <120s | ~110s ✅ |
| 500+ | Chunked | Auto ✅ |

## Key Technical Decisions
- `vite.config.ts`: `allowedHosts: true` (boolean, not string) for platform preview
- `supervisord.conf`: `directory=/app` (not /app/frontend)
- Provider API keys stored in localStorage (plaintext with security notice)
- Direct browser fetch to AI APIs (no backend proxy)
- App Store uses public iTunes RSS API (CORS-friendly)
- Reddit uses public JSON API (CORS-friendly)
- Default Gemini model: `gemini-2.5-flash` (gemini-2.0-flash has quota=0 for some keys)

## Backlog / Future Tasks

### P2 - Medium Priority
- [ ] Analysis History - Store and compare past analysis results
- [ ] Google Play Scraping - Add backend proxy for CORS
- [ ] Twitter API Integration - Add backend proxy for auth
- [ ] Team Sharing - Export/import workspace configurations

### P3 - Nice to Have
- [ ] Custom AI Prompts - User-defined analysis templates
- [ ] Sentiment Trends - Time-series sentiment analysis
- [ ] Integration Webhooks - Push analysis results to external systems
- [ ] Settings.tsx Refactoring - Extract ProviderCard/AddProviderModal components

## Known Limitations
- No backend - all processing in browser
- API keys visible in network inspector (documented trade-off)
- Large file imports may be slow (browser memory constraints)
- Ollama requires local server (not testable in cloud preview)
- Google Play and Twitter require backend proxy due to CORS/auth

## Configuration Files
- `/app/vite.config.ts` - Vite build configuration
- `/etc/supervisor/conf.d/supervisord.conf` - Service management
- `/app/src/index.css` - Theme CSS variables

### ✅ Premium UI Redesign (Completed 2025-06-28)
Elevated visual quality to match premium startup products like Linear, Vercel, Perplexity Pro.

1. **Layered Background**
   - Deep navy base (#0A0F1C) - no pure black
   - Soft radial gradients with animated colored orbs (blue, purple, cyan)
   - Subtle grid pattern with fade mask
   - Noise texture overlay for depth

2. **Glassmorphism Design System**
   - Backdrop blur (24px) on all major panels
   - Translucent backgrounds (rgba(255,255,255,0.02-0.06))
   - Subtle glass borders with inner highlights
   - Premium shadows with colored glow on hover

3. **Premium Components** (`/app/src/shared/components/premium/index.tsx`)
   - `GlassCard` - Floating glass panel with hover lift
   - `MetricTile` - KPI display with animated icons and trends
   - `GlowButton` - Buttons with hover glow effects
   - `GradientBadge` - Colored badges for severity/status
   - `IconContainer` - Icons wrapped in colored circular containers
   - `SectionHeader` - Consistent section headings
   - `EmptyState` - Beautiful empty states with CTAs
   - `Timeline` - Vertical activity timeline
   - `IssueCard` - Issue cards with severity color strips
   - `ExportCard` - Export options with format icons

4. **Floating Sidebar**
   - Glass panel design with rounded corners (1.25rem)
   - Animated active indicator (blue left border)
   - Step indicators (1-2-3) for workflow
   - Clickable logo to home page
   - AI Provider status card at bottom
   - Version footer (v1.0.0 BETA)

5. **Typography**
   - Outfit font for headings (imported from Google Fonts)
   - Large display headings (text-4xl to text-5xl)
   - Gradient text effects
   - Label caps for categories
   - Metric display font for numbers

6. **Executive Dashboard**
   - Large KPI MetricTiles with icons and trends
   - Executive Summary hero card with gradient left border
   - Activity Timeline (4 events)
   - Top Issues grid with IssueCards
   - Quick Actions navigation cards

7. **High-Quality PDF Export**
   - Dark header with SignalDesk branding
   - Key metrics cards layout
   - Severity distribution horizontal bar chart
   - Issue cards with colored severity strips
   - Engineering tickets with priority badges
   - Customer communications templates
   - Page numbers and footer

8. **Microinteractions**
   - Hover lift (translateY -4px)
   - Glow effects (box-shadow with color)
   - Smooth transitions (200-300ms cubic-bezier)
   - Staggered fade-in animations

### Testing Verification
- 24 gradient elements computed
- 16 backdrop-blur (glassmorphism) elements
- All 7 visual quality criteria PASSED
- Executive Dashboard matches Linear/Vercel quality

### ✅ Column Mapping UI (Completed 2025-06-28)
Enhanced file upload with intelligent column mapping:

1. **Preview Before Import**
   - Modal appears for CSV/Excel/JSON uploads
   - Shows file name, row count, and detected columns
   - Data preview table (first 5 rows)

2. **Auto-Detection**
   - Automatically detects common field names
   - Content: review, content, comment, feedback, message, body, text, description
   - Title: title, subject, headline
   - Author: author, user, username, customer, name, email, creator
   - Rating: rating, stars, score, rank

3. **Manual Mapping**
   - Dropdown selectors for each field
   - Select ANY column for content/title/author/rating
   - Required indicator for content field
   - Real-time preview updates

4. **Import Validation**
   - Shows count of valid reviews
   - Deduplication by content
   - Success toast on import

### ✅ Google Play Connector (Completed 2025-06-28)
Working Google Play review scraping:

1. **CORS Proxy Solution**
   - Uses allorigins.win public CORS proxy
   - Fetches Google Play app pages
   - Extracts reviews from HTML/embedded JSON

2. **Tested Working**
   - WhatsApp (com.whatsapp): 50 reviews imported
   - Graceful fallback with helpful error messages

### Connector Status
| Connector | Status | Notes |
|-----------|--------|-------|
| App Store | ✅ Working | iTunes RSS API, no key required |
| Google Play | ✅ Working | Via CORS proxy, may have limits |
| CSV URL | ✅ Working | Any public CSV file |
| JSON API | ✅ Working | REST APIs with auth headers |
| Reddit | ✅ Working | Public JSON API |
| Twitter | ❌ Needs Backend | OAuth authentication required |

---
*Last updated: 2025-06-28*
