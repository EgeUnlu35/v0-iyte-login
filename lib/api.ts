import { getAuthToken } from "@/app/actions/auth"

// API base URL - in a real app, this would be in an environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.iyte-gms.com"

// Types
export type ApiResponse<T> = {
  data?: T
  error?: string
  status: number
}

// Generic API client function
export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type")
    const isJson = contentType && contentType.includes("application/json")

    let data
    if (isJson) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    if (!response.ok) {
      return {
        error: isJson ? data.message || "An error occurred" : "An error occurred",
        status: response.status,
      }
    }

    return {
      data: data as T,
      status: response.status,
    }
  } catch (error) {
    console.error("API request failed:", error)
    return {
      error: "Network error. Please check your connection and try again.",
      status: 0,
    }
  }
}

// Authenticated API client function
export async function authApiClient<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = await getAuthToken()

  if (!token) {
    return {
      error: "Not authenticated",
      status: 401,
    }
  }

  return apiClient<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}

// API endpoints
export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    register: (userData: { email: string; password: string; firstName: string; lastName: string }) =>
      apiClient("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      }),
  },
  // Add more API endpoints as needed
}
