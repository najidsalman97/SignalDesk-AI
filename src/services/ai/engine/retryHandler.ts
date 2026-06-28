/**
 * Retry Handler - Exponential backoff with configurable retries
 */

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  retryableStatuses: number[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 16000,
  retryableStatuses: [429, 500, 502, 503, 504],
};

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  attempts: number;
  lastStatus?: number;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.initialDelayMs * Math.pow(2, attempt);
  // Add jitter (±20%)
  const jitter = delay * 0.2 * (Math.random() - 0.5);
  return Math.min(delay + jitter, config.maxDelayMs);
}

/**
 * Check if error is retryable
 */
export function isRetryableError(status: number, errorText: string): boolean {
  // Network errors
  if (errorText.includes("Failed to fetch") || 
      errorText.includes("network") ||
      errorText.includes("timeout") ||
      errorText.includes("ETIMEDOUT")) {
    return true;
  }
  
  // Rate limits and server errors
  return DEFAULT_RETRY_CONFIG.retryableStatuses.includes(status);
}

/**
 * Parse provider-specific error messages
 */
export function parseProviderError(errorText: string): {
  isQuotaError: boolean;
  isRateLimit: boolean;
  isInvalidKey: boolean;
  isPermanentQuota: boolean;
  humanMessage: string;
} {
  const lower = errorText.toLowerCase();
  
  // Permanent quota errors (limit: 0) - don't retry
  if (lower.includes("limit: 0") || lower.includes("limit:0") || 
      (lower.includes("quota") && lower.includes("limit") && lower.includes("0"))) {
    return {
      isQuotaError: true,
      isRateLimit: false,
      isInvalidKey: false,
      isPermanentQuota: true,
      humanMessage: "Model quota disabled for your account. Try a different model (e.g., gemini-2.5-flash).",
    };
  }
  
  // Quota errors (but not permanent)
  if (lower.includes("resource_exhausted") || 
      lower.includes("quota exceeded") ||
      lower.includes("insufficient credits") ||
      lower.includes("402")) {
    return {
      isQuotaError: true,
      isRateLimit: false,
      isInvalidKey: false,
      isPermanentQuota: false,
      humanMessage: "API quota exhausted. Switching to next provider...",
    };
  }
  
  // Rate limits (transient, can retry)
  if (lower.includes("rate_limit") || 
      lower.includes("too many requests") ||
      lower.includes("429")) {
    return {
      isQuotaError: false,
      isRateLimit: true,
      isInvalidKey: false,
      isPermanentQuota: false,
      humanMessage: "Rate limited. Retrying with backoff...",
    };
  }
  
  // Invalid API key
  if (lower.includes("invalid") && lower.includes("key") ||
      lower.includes("unauthorized") ||
      lower.includes("401") ||
      lower.includes("access_token_type_unsupported")) {
    return {
      isQuotaError: false,
      isRateLimit: false,
      isInvalidKey: true,
      isPermanentQuota: false,
      humanMessage: "Invalid API key. Please check your credentials.",
    };
  }
  
  return {
    isQuotaError: false,
    isRateLimit: false,
    isInvalidKey: false,
    isPermanentQuota: false,
    humanMessage: errorText.slice(0, 200),
  };
}

/**
 * Execute function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  onRetry?: (attempt: number, delay: number, error: string) => void,
  signal?: AbortSignal
): Promise<RetryResult<T>> {
  const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError = "";
  let lastStatus = 0;
  
  for (let attempt = 0; attempt <= fullConfig.maxRetries; attempt++) {
    // Check for cancellation
    if (signal?.aborted) {
      return {
        success: false,
        error: "Cancelled",
        attempts: attempt,
      };
    }
    
    try {
      const result = await fn();
      return {
        success: true,
        data: result,
        attempts: attempt + 1,
      };
    } catch (error) {
      const errorText = error instanceof Error ? error.message : String(error);
      lastError = errorText;
      
      // Try to extract HTTP status
      const statusMatch = errorText.match(/(\d{3})/);
      if (statusMatch) {
        lastStatus = parseInt(statusMatch[1], 10);
      }
      
      // Check if retryable
      const parsed = parseProviderError(errorText);
      
      // Don't retry invalid keys, permanent quota, or regular quota errors
      if (parsed.isInvalidKey || parsed.isQuotaError || parsed.isPermanentQuota) {
        return {
          success: false,
          error: parsed.humanMessage,
          attempts: attempt + 1,
          lastStatus,
        };
      }
      
      // Check if we should retry
      if (attempt < fullConfig.maxRetries && (parsed.isRateLimit || isRetryableError(lastStatus, errorText))) {
        const delay = calculateDelay(attempt, fullConfig);
        onRetry?.(attempt + 1, delay, parsed.humanMessage);
        await sleep(delay);
        continue;
      }
      
      // No more retries
      return {
        success: false,
        error: parsed.humanMessage,
        attempts: attempt + 1,
        lastStatus,
      };
    }
  }
  
  return {
    success: false,
    error: lastError,
    attempts: fullConfig.maxRetries + 1,
    lastStatus,
  };
}
