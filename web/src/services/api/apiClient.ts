import { getAuthToken } from '@/lib/auth';

// Base API URL from environment variable
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

// Interface for API request options
interface ApiRequestOptions extends RequestInit {
  authenticated?: boolean;
}

// Function to create a full URL from path
const createUrl = (path: string): string => {
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

// Function to add authentication headers to request
const addAuthHeaders = (headers: HeadersInit): HeadersInit => {
  const token = getAuthToken();
  if (!token) return headers;

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
};

// General API request function
export const apiRequest = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const { authenticated = false, headers = {}, ...rest } = options;

  // Prepare headers
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add authentication headers if needed
  const finalHeaders = authenticated
    ? addAuthHeaders(requestHeaders)
    : requestHeaders;

  try {
    // Make the request
    const response = await fetch(createUrl(path), {
      headers: finalHeaders,
      ...rest,
    });

    // Check if the request was successful
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      } catch (jsonError) {
        // If JSON parsing fails, try to get response as text
        const textError = await response.text();
        throw new Error(
          `API error (${response.status}): ${textError.substring(0, 100)}`,
        );
      }
    }

    // Check content type
    const contentType = response.headers.get('content-type');

    // Try to parse as JSON first
    if (contentType && contentType.includes('application/json')) {
      try {
        return (await response.json()) as T;
      } catch (error) {
        console.warn(
          'Failed to parse JSON response despite content-type',
          error,
        );
        // Fall back to text if JSON parsing fails
        const text = await response.text();
        return text as unknown as T;
      }
    } else {
      // For non-JSON responses, return as text
      const text = await response.text();

      // If the caller expects an object, try to parse the text as JSON
      if (typeof Text !== 'function' || !(text instanceof Text)) {
        try {
          return JSON.parse(text) as T;
        } catch (e) {
          // If parsing fails, return the text as is
          return text as unknown as T;
        }
      }

      return text as unknown as T;
    }
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// API client with utility methods for common HTTP methods
const apiClient = {
  get: <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
    return apiRequest<T>(path, { method: 'GET', ...options });
  },

  post: <T>(
    path: string,
    data: any,
    options: ApiRequestOptions = {},
  ): Promise<T> => {
    return apiRequest<T>(path, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  },

  put: <T>(
    path: string,
    data: any,
    options: ApiRequestOptions = {},
  ): Promise<T> => {
    return apiRequest<T>(path, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  },

  patch: <T>(
    path: string,
    data: any,
    options: ApiRequestOptions = {},
  ): Promise<T> => {
    return apiRequest<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  },

  delete: <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
    return apiRequest<T>(path, { method: 'DELETE', ...options });
  },
};

export default apiClient;
