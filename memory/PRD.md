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
│   ├── services/      # AI providers, data parsers, connectors
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

### ✅ AI Provider Manager (Completed 2025-06-28)
1. **5 Provider Support**: Gemini, OpenAI, OpenRouter, Groq, Ollama
2. **Test Connection**: Validates API key, shows Connected/Invalid/Unreachable status
3. **Response Time**: Displays API response latency
4. **Model Fetching**: Automatically retrieves available models after connection
5. **Auto-Select Default**: Preselects recommended model per provider
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

## Key Technical Decisions
- `vite.config.ts`: `allowedHosts: true` (boolean, not string) for platform preview
- `supervisord.conf`: `directory=/app` (not /app/frontend)
- Provider API keys stored in localStorage (plaintext with security notice)
- Direct browser fetch to AI APIs (no backend proxy)
- App Store uses public iTunes RSS API (CORS-friendly)
- Reddit uses public JSON API (CORS-friendly)

## Backlog / Future Tasks

### P1 - High Priority
- [ ] Multi-chunk Analysis - Handle large datasets with chunking and merging
- [ ] Real-time Analysis Progress - Show chunk-by-chunk progress

### P2 - Medium Priority
- [ ] Google Play Scraping - Add backend proxy for CORS
- [ ] Twitter API Integration - Add backend proxy for auth
- [ ] Analysis History - Store and compare past analysis results
- [ ] Team Sharing - Export/import workspace configurations

### P3 - Nice to Have
- [ ] Custom AI Prompts - User-defined analysis templates
- [ ] Sentiment Trends - Time-series sentiment analysis
- [ ] Integration Webhooks - Push analysis results to external systems

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

## Recent Updates (2025-06-28)

### UX Improvements
- Added helpful error detection for OAuth tokens mistakenly used as Gemini API keys
- When users paste an OAuth token (starts with 'AQ.Ab8R...'), the app now shows: "Invalid key format. You provided an OAuth token, not an API key. Get a proper API key (starts with 'AIza...') from https://aistudio.google.com/app/apikey"
- URL-encoded API keys in Gemini requests to prevent issues with special characters

### Testing Status
- All UI flows verified working (Settings, Sources, Analysis pages)
- Error handling for API failures confirmed working
- Demo data loading (188 reviews) confirmed working
- Pending: Success path verification requires valid Gemini API key (AIza...)

---
*Last updated: 2025-06-28*
