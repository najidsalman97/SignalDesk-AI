import type {
  AIProvider,
  ProviderModel,
  TestConnectionResult,
  ProviderSettings,
} from "@/shared/types/provider";

// Test connection and fetch models for each provider
export async function testProviderConnection(
  provider: AIProvider,
  apiKey: string,
  baseUrl?: string
): Promise<TestConnectionResult> {
  const startTime = performance.now();

  try {
    switch (provider) {
      case "gemini":
        return await testGeminiConnection(apiKey, startTime);
      case "openai":
        return await testOpenAIConnection(apiKey, startTime);
      case "openrouter":
        return await testOpenRouterConnection(apiKey, startTime);
      case "groq":
        return await testGroqConnection(apiKey, startTime);
      case "ollama":
        return await testOllamaConnection(apiKey, baseUrl, startTime);
      default:
        return {
          success: false,
          status: "invalid",
          errorMessage: "Unknown provider",
        };
    }
  } catch (error) {
    const responseTime = Math.round(performance.now() - startTime);
    const errorMessage = error instanceof Error ? error.message : "Connection failed";
    
    // Determine if unreachable or invalid
    const isNetworkError = errorMessage.includes("fetch") || 
                           errorMessage.includes("network") ||
                           errorMessage.includes("CORS") ||
                           errorMessage.includes("Failed to fetch");
    
    return {
      success: false,
      status: isNetworkError ? "unreachable" : "invalid",
      responseTime,
      errorMessage,
    };
  }
}

// Gemini - uses API key as query param
async function testGeminiConnection(
  apiKey: string,
  startTime: number
): Promise<TestConnectionResult> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
  );

  const responseTime = Math.round(performance.now() - startTime);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    let errorMessage = error.error?.message || `HTTP ${response.status}`;
    
    // Detect OAuth token error and provide helpful guidance
    if (errorMessage.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED") || 
        errorMessage.includes("OAuth 2 access token")) {
      errorMessage = "Invalid key format. You provided an OAuth token, not an API key. Get a proper API key (starts with 'AIza...') from https://aistudio.google.com/app/apikey";
    }
    
    return {
      success: false,
      status: response.status === 401 || response.status === 403 ? "invalid" : "unreachable",
      responseTime,
      errorMessage,
    };
  }

  const data = await response.json();
  const models: ProviderModel[] = (data.models || [])
    .filter((m: any) => m.name?.includes("gemini") && m.supportedGenerationMethods?.includes("generateContent"))
    .map((m: any) => ({
      id: m.name.replace("models/", ""),
      name: m.displayName || m.name.replace("models/", ""),
      description: m.description,
      contextLength: m.inputTokenLimit,
      isDefault: m.name.includes("gemini-2.5-flash") && !m.name.includes("lite"),
    }));

  return {
    success: true,
    status: "connected",
    responseTime,
    models,
  };
}

// OpenAI - uses Bearer token
async function testOpenAIConnection(
  apiKey: string,
  startTime: number
): Promise<TestConnectionResult> {
  const response = await fetch("https://api.openai.com/v1/models", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const responseTime = Math.round(performance.now() - startTime);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return {
      success: false,
      status: response.status === 401 ? "invalid" : "unreachable",
      responseTime,
      errorMessage: error.error?.message || `HTTP ${response.status}`,
    };
  }

  const data = await response.json();
  const chatModels = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo", "o1", "o1-mini", "o1-preview"];
  
  const models: ProviderModel[] = (data.data || [])
    .filter((m: any) => chatModels.some(cm => m.id.startsWith(cm)))
    .map((m: any) => ({
      id: m.id,
      name: m.id,
      isDefault: m.id === "gpt-4o-mini",
    }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name));

  return {
    success: true,
    status: "connected",
    responseTime,
    models,
  };
}

// OpenRouter - uses Bearer token
async function testOpenRouterConnection(
  apiKey: string,
  startTime: number
): Promise<TestConnectionResult> {
  const response = await fetch("https://openrouter.ai/api/v1/models", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const responseTime = Math.round(performance.now() - startTime);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return {
      success: false,
      status: response.status === 401 ? "invalid" : "unreachable",
      responseTime,
      errorMessage: error.error?.message || `HTTP ${response.status}`,
    };
  }

  const data = await response.json();
  const models: ProviderModel[] = (data.data || [])
    .slice(0, 50) // Limit to top 50
    .map((m: any) => ({
      id: m.id,
      name: m.name || m.id,
      description: m.description,
      contextLength: m.context_length,
      isDefault: m.id === "deepseek/deepseek-chat-v3-0324:free", // Free tier default
    }));

  return {
    success: true,
    status: "connected",
    responseTime,
    models,
  };
}

// Groq - uses Bearer token (OpenAI compatible)
async function testGroqConnection(
  apiKey: string,
  startTime: number
): Promise<TestConnectionResult> {
  const response = await fetch("https://api.groq.com/openai/v1/models", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const responseTime = Math.round(performance.now() - startTime);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return {
      success: false,
      status: response.status === 401 ? "invalid" : "unreachable",
      responseTime,
      errorMessage: error.error?.message || `HTTP ${response.status}`,
    };
  }

  const data = await response.json();
  const models: ProviderModel[] = (data.data || [])
    .filter((m: any) => m.active !== false)
    .map((m: any) => ({
      id: m.id,
      name: m.id,
      contextLength: m.context_window,
      isDefault: m.id === "llama-3.1-8b-instant", // Free tier with higher limits
    }));

  return {
    success: true,
    status: "connected",
    responseTime,
    models,
  };
}

// Ollama - local server only (cloud API blocked by CORS)
async function testOllamaConnection(
  _apiKey: string,
  baseUrl: string = "http://localhost:11434",
  startTime: number
): Promise<TestConnectionResult> {
  // Local server mode
  try {
    const response = await fetch(`${baseUrl}/api/tags`);

    const responseTime = Math.round(performance.now() - startTime);

    if (!response.ok) {
      return {
        success: false,
        status: "unreachable",
        responseTime,
        errorMessage: `Ollama server returned HTTP ${response.status}. Make sure Ollama is running locally.`,
      };
    }

    const data = await response.json();
    const models: ProviderModel[] = (data.models || []).map((m: any) => ({
      id: m.name,
      name: m.name,
      description: `${m.details?.family || ""} ${m.details?.parameter_size || ""}`.trim(),
      isDefault: m.name.includes("llama3"),
    }));

    if (models.length === 0) {
      return {
        success: false,
        status: "connected",
        responseTime,
        errorMessage: "Ollama is running but no models are installed. Run 'ollama pull llama3.2' to install a model.",
      };
    }

    return {
      success: true,
      status: "connected",
      responseTime,
      models,
    };
  } catch (error) {
    const responseTime = Math.round(performance.now() - startTime);
    const errorMsg = error instanceof Error ? error.message : "Connection failed";
    
    return {
      success: false,
      status: "unreachable",
      responseTime,
      errorMessage: errorMsg.includes("Failed to fetch") 
        ? "Cannot connect to Ollama. Make sure Ollama is running locally on port 11434."
        : errorMsg,
    };
  }
}

// Get the best available provider based on priority and connection status
export function getBestProvider(providers: ProviderSettings[]): ProviderSettings | null {
  const enabledProviders = providers
    .filter(p => p.enabled && p.connectionStatus === "connected")
    .sort((a, b) => a.priority - b.priority);

  return enabledProviders[0] || null;
}

// Get next fallback provider
export function getNextFallbackProvider(
  providers: ProviderSettings[],
  currentProvider: AIProvider
): ProviderSettings | null {
  const enabledProviders = providers
    .filter(p => p.enabled && p.connectionStatus === "connected" && p.provider !== currentProvider)
    .sort((a, b) => a.priority - b.priority);

  return enabledProviders[0] || null;
}
