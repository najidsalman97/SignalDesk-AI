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
│   ├── features/      # Page modules (analysis, dashboard, landing, reports, settings, sources)
│   ├── shared/        # Reusable UI components (Sidebar, Navbar, MetricCard, EmptyState)
│   ├── store/         # Zustand state management
│   ├── services/      # AI providers and data parsers
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

### ✅ UI/UX (Completed)
1. **Dark Glassmorphism Theme** - Enterprise SaaS aesthetic (Linear/Vercel style)
2. **Glass Cards** - Semi-transparent with backdrop blur
3. **Responsive Design** - Mobile-friendly layouts
4. **Loading States** - Spinners and progress indicators
5. **Empty States** - Helpful guidance when no data

## Key Technical Decisions
- `vite.config.ts`: `allowedHosts: true` (boolean, not string) for platform preview
- `supervisord.conf`: `directory=/app` (not /app/frontend)
- Provider API keys stored in localStorage (plaintext with security notice)
- Direct browser fetch to AI APIs (no backend proxy)

## Backlog / Future Tasks

### P1 - High Priority
- [ ] Multi-chunk Analysis - Handle large datasets with chunking and merging
- [ ] Real-time Analysis Progress - Show chunk-by-chunk progress

### P2 - Medium Priority
- [ ] Data Connectors - Direct integrations with App Store, Google Play, Reddit, GitHub Issues
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

## Configuration Files
- `/app/vite.config.ts` - Vite build configuration
- `/etc/supervisor/conf.d/supervisord.conf` - Service management
- `/app/src/index.css` - Theme CSS variables

---
*Last updated: 2025-06-28*
