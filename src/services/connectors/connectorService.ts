import type { SourceItem } from "@/shared/types/source";
import type { Connector } from "@/shared/types/connector";

export interface FetchResult {
  success: boolean;
  reviews: SourceItem[];
  errorMessage?: string;
}

// Fetch reviews from a connector
export async function fetchConnectorReviews(connector: Connector): Promise<FetchResult> {
  try {
    switch (connector.type) {
      case "app_store":
        return await fetchAppStoreReviews(connector.config);
      case "google_play":
        return await fetchGooglePlayReviews(connector.config);
      case "csv_url":
        return await fetchCSVReviews(connector.config);
      case "json_api":
        return await fetchJSONAPIReviews(connector.config);
      case "reddit":
        return await fetchRedditPosts(connector.config);
      case "twitter":
        return await fetchTwitterPosts(connector.config);
      default:
        return { success: false, reviews: [], errorMessage: "Unknown connector type" };
    }
  } catch (error) {
    return {
      success: false,
      reviews: [],
      errorMessage: error instanceof Error ? error.message : "Failed to fetch reviews",
    };
  }
}

// App Store Reviews (using iTunes RSS feed)
async function fetchAppStoreReviews(config: Record<string, string>): Promise<FetchResult> {
  const { appId, country = "us", pages = "1" } = config;
  const pageCount = Math.min(parseInt(pages) || 1, 10);
  const reviews: SourceItem[] = [];

  for (let page = 1; page <= pageCount; page++) {
    try {
      const response = await fetch(
        `https://itunes.apple.com/${country}/rss/customerreviews/page=${page}/id=${appId}/sortBy=mostRecent/json`
      );

      if (!response.ok) {
        if (page === 1) {
          return { success: false, reviews: [], errorMessage: `App not found or invalid ID` };
        }
        break;
      }

      const data = await response.json();
      const entries = data.feed?.entry || [];

      for (const entry of entries) {
        if (entry.content) {
          reviews.push({
            id: crypto.randomUUID(),
            source: "appstore",
            title: entry.title?.label || "",
            content: entry.content.label || "",
            rating: parseInt(entry["im:rating"]?.label) || 0,
            author: entry.author?.name?.label || "Anonymous",
            createdAt: new Date().toISOString(),
            metadata: {
              appId,
              country,
              version: entry["im:version"]?.label || "",
            },
          });
        }
      }
    } catch (error) {
      if (page === 1) throw error;
      break;
    }
  }

  return { success: true, reviews };
}

// Google Play Reviews (using a CORS proxy for the web scraping approach)
// Google Play Reviews (via SerpApi - requires an API key)
async function fetchGooglePlayReviews(config: Record<string, string>): Promise<FetchResult> {
  const { appId, apiKey, language = "en", country = "us", count = "50" } = config;

  if (!appId) {
    return { success: false, reviews: [], errorMessage: "App ID is required" };
  }
  if (!apiKey) {
    return { success: false, reviews: [], errorMessage: "API key is required. Get one from serpapi.com" };
  }

  try {
    const maxReviews = parseInt(count) || 50;
    const reviews: SourceItem[] = [];
    let nextPageToken: string | undefined;

    while (reviews.length < maxReviews) {
      const params = new URLSearchParams({
        engine: "google_play_product",
        store: "apps",
        product_id: appId,
        all_reviews: "true",
        hl: language,
        gl: country,
        api_key: apiKey,
      });
      if (nextPageToken) params.set("next_page_token", nextPageToken);

      const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);

      if (!response.ok) {
        return {
          success: false,
          reviews: [],
          errorMessage: `SerpApi request failed: ${response.status}`,
        };
      }

      const data = await response.json();
      const fetchedReviews = data.reviews || [];

      if (fetchedReviews.length === 0) break;

      for (const r of fetchedReviews) {
        if (reviews.length >= maxReviews) break;
        reviews.push({
          id: crypto.randomUUID(),
          source: "googleplay",
          title: "",
          content: r.snippet || r.text || "",
          rating: r.rating || 0,
          author: r.title || "Anonymous",
          createdAt: r.iso_date || new Date().toISOString(),
          metadata: { appId, platform: "google_play" },
        });
      }

      nextPageToken = data.serpapi_pagination?.next_page_token;
      if (!nextPageToken) break;
    }

    if (reviews.length === 0) {
      return { success: false, reviews: [], errorMessage: "No reviews found for this app ID" };
    }

    return { success: true, reviews };
  } catch (error) {
    return {
      success: false,
      reviews: [],
      errorMessage: `Google Play fetch error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// CSV URL Fetch
async function fetchCSVReviews(config: Record<string, string>): Promise<FetchResult> {
  const { url, contentColumn, ratingColumn, dateColumn } = config;

  const response = await fetch(url);
  if (!response.ok) {
    return { success: false, reviews: [], errorMessage: `Failed to fetch CSV: ${response.status}` };
  }

  const text = await response.text();
  const lines = text.split("\n").filter(Boolean);
  
  if (lines.length < 2) {
    return { success: false, reviews: [], errorMessage: "CSV file is empty or has no data rows" };
  }

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const contentIndex = headers.findIndex((h) => h.toLowerCase() === contentColumn.toLowerCase());
  const ratingIndex = ratingColumn ? headers.findIndex((h) => h.toLowerCase() === ratingColumn.toLowerCase()) : -1;
  const dateIndex = dateColumn ? headers.findIndex((h) => h.toLowerCase() === dateColumn.toLowerCase()) : -1;

  if (contentIndex === -1) {
    return { success: false, reviews: [], errorMessage: `Content column "${contentColumn}" not found in CSV` };
  }

  const reviews: SourceItem[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const content = values[contentIndex]?.trim();
    
    if (content) {
      reviews.push({
        id: crypto.randomUUID(),
        source: "csv_import",
        title: "",
        content,
        rating: ratingIndex >= 0 ? parseInt(values[ratingIndex]) || 0 : 0,
        createdAt: dateIndex >= 0 ? values[dateIndex] || new Date().toISOString() : new Date().toISOString(),
        metadata: { sourceUrl: url },
      });
    }
  }

  return { success: true, reviews };
}

// JSON API Fetch
async function fetchJSONAPIReviews(config: Record<string, string>): Promise<FetchResult> {
  const { url, authHeader, dataPath, contentField } = config;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    return { success: false, reviews: [], errorMessage: `API returned ${response.status}` };
  }

  let data = await response.json();

  // Navigate to data path
  if (dataPath) {
    const parts = dataPath.split(".");
    for (const part of parts) {
      data = data?.[part];
    }
  }

  if (!Array.isArray(data)) {
    return { success: false, reviews: [], errorMessage: "Data path does not point to an array" };
  }

  const reviews = data.map((item: any): SourceItem => ({
    id: crypto.randomUUID(),
    source: "api_import",
    title: item.title || "",
    content: item[contentField] || item.content || item.text || "",
    rating: item.rating || item.score || 0,
    author: item.author || item.user || "",
    createdAt: item.createdAt || item.date || item.created_at || new Date().toISOString(),
    metadata: { sourceUrl: url },
  })).filter((r) => r.content);

  return { success: true, reviews };
}

// Reddit Posts (using public JSON API)
async function fetchRedditPosts(config: Record<string, string>): Promise<FetchResult> {
  const { subreddit, searchQuery, sort = "hot", limit = "25" } = config;
  
  let url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}`;
  if (searchQuery) {
    url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(searchQuery)}&restrict_sr=1&sort=${sort}&limit=${limit}`;
  }

  const response = await fetch(url, {
    headers: { "User-Agent": "SignalDesk/1.0" },
  });

  if (!response.ok) {
    return { success: false, reviews: [], errorMessage: `Subreddit not found or rate limited` };
  }

  const data = await response.json();
  const posts = data.data?.children || [];

  const reviews: SourceItem[] = posts.map((post: any) => ({
    id: crypto.randomUUID(),
    source: "reddit",
    title: post.data?.title || "",
    content: post.data?.selftext || post.data?.title || "",
    rating: 0,
    author: post.data?.author || "",
    createdAt: new Date((post.data?.created_utc || 0) * 1000).toISOString(),
    metadata: {
      subreddit,
      score: post.data?.score,
      url: `https://reddit.com${post.data?.permalink}`,
    },
  })).filter((r: SourceItem) => r.content);

  return { success: true, reviews };
}

// Twitter/X Posts (requires API key)
async function fetchTwitterPosts(_config: Record<string, string>): Promise<FetchResult> {
  // Note: Twitter API v2 requires authentication and may have CORS issues from browser
  return {
    success: false,
    reviews: [],
    errorMessage: "Twitter connector requires a backend proxy due to API authentication. Export tweets and use CSV URL connector instead.",
  };
}

// Helper to parse CSV lines with proper quote handling
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}
