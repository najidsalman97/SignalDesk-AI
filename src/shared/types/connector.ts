export type ConnectorType =
  | "app_store"
  | "google_play"
  | "csv_url"
  | "json_api"
  | "reddit"
  | "twitter";

export type ConnectorStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "error"
  | "syncing";

export interface ConnectorField {
  key: string;
  label: string;
  type: "text" | "url" | "password" | "number" | "select";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface ConnectorConfig {
  id: ConnectorType;
  name: string;
  description: string;
  icon: string;
  fields: ConnectorField[];
  color: string;
}

export interface Connector {
  id: string;
  type: ConnectorType;
  name: string;
  config: Record<string, string>;
  status: ConnectorStatus;
  lastSync?: string;
  reviewCount?: number;
  errorMessage?: string;
}

export const CONNECTOR_CONFIGS: Record<ConnectorType, ConnectorConfig> = {
  app_store: {
    id: "app_store",
    name: "App Store",
    description: "Import reviews from Apple App Store",
    icon: "🍎",
    color: "from-gray-500/20 to-gray-600/10 border-gray-500/20",
    fields: [
      { key: "appId", label: "App ID", type: "text", placeholder: "e.g., 123456789", required: true },
      { key: "country", label: "Country", type: "select", required: true, options: [
        { value: "us", label: "United States" },
        { value: "gb", label: "United Kingdom" },
        { value: "de", label: "Germany" },
        { value: "fr", label: "France" },
        { value: "jp", label: "Japan" },
        { value: "cn", label: "China" },
        { value: "in", label: "India" },
        { value: "br", label: "Brazil" },
      ]},
      { key: "pages", label: "Pages to Fetch", type: "number", placeholder: "1-10", required: false },
    ],
  },
  google_play: {
    id: "google_play",
    name: "Google Play",
    description: "Import reviews from Google Play Store",
    icon: "🤖",
    color: "from-green-500/20 to-emerald-600/10 border-green-500/20",
    fields: [
      { key: "appId", label: "Package Name", type: "text", placeholder: "e.g., com.example.app", required: true },
      { key: "language", label: "Language", type: "select", required: true, options: [
        { value: "en", label: "English" },
        { value: "es", label: "Spanish" },
        { value: "de", label: "German" },
        { value: "fr", label: "French" },
        { value: "ja", label: "Japanese" },
        { value: "zh", label: "Chinese" },
        { value: "pt", label: "Portuguese" },
        { value: "hi", label: "Hindi" },
      ]},
      { key: "count", label: "Review Count", type: "number", placeholder: "50-500", required: false },
    ],
  },
  csv_url: {
    id: "csv_url",
    name: "CSV URL",
    description: "Import from a publicly accessible CSV file",
    icon: "📊",
    color: "from-blue-500/20 to-cyan-600/10 border-blue-500/20",
    fields: [
      { key: "url", label: "CSV URL", type: "url", placeholder: "https://example.com/reviews.csv", required: true },
      { key: "contentColumn", label: "Content Column", type: "text", placeholder: "review_text", required: true },
      { key: "ratingColumn", label: "Rating Column", type: "text", placeholder: "rating", required: false },
      { key: "dateColumn", label: "Date Column", type: "text", placeholder: "created_at", required: false },
    ],
  },
  json_api: {
    id: "json_api",
    name: "JSON API",
    description: "Fetch reviews from a REST API endpoint",
    icon: "🔗",
    color: "from-purple-500/20 to-violet-600/10 border-purple-500/20",
    fields: [
      { key: "url", label: "API URL", type: "url", placeholder: "https://api.example.com/reviews", required: true },
      { key: "authHeader", label: "Auth Header", type: "password", placeholder: "Bearer token...", required: false },
      { key: "dataPath", label: "Data Path", type: "text", placeholder: "data.reviews", required: false },
      { key: "contentField", label: "Content Field", type: "text", placeholder: "text", required: true },
    ],
  },
  reddit: {
    id: "reddit",
    name: "Reddit",
    description: "Import posts and comments from subreddits",
    icon: "🔴",
    color: "from-orange-500/20 to-red-600/10 border-orange-500/20",
    fields: [
      { key: "subreddit", label: "Subreddit", type: "text", placeholder: "e.g., webdev", required: true },
      { key: "searchQuery", label: "Search Query", type: "text", placeholder: "Optional filter", required: false },
      { key: "sort", label: "Sort By", type: "select", required: true, options: [
        { value: "hot", label: "Hot" },
        { value: "new", label: "New" },
        { value: "top", label: "Top" },
        { value: "relevance", label: "Relevance" },
      ]},
      { key: "limit", label: "Post Limit", type: "number", placeholder: "25-100", required: false },
    ],
  },
  twitter: {
    id: "twitter",
    name: "Twitter/X",
    description: "Import tweets mentioning your brand",
    icon: "𝕏",
    color: "from-slate-500/20 to-gray-600/10 border-slate-500/20",
    fields: [
      { key: "query", label: "Search Query", type: "text", placeholder: "@yourbrand OR #hashtag", required: true },
      { key: "bearerToken", label: "Bearer Token", type: "password", placeholder: "Twitter API token", required: true },
      { key: "maxResults", label: "Max Results", type: "number", placeholder: "10-100", required: false },
    ],
  },
};
