"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// API base URL - in a real app, this would be in an environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.iyte-gms.com"

// Types for API responses
type UserDto = {
  email: string
  firstName: string
  lastName: string
}

// Updated token structure to match the actual API response
type TokenDto = {
  token: string // Changed from accessToken to token
  expiresIn: number
}

type LoginResponse = {
  user: UserDto
  token: TokenDto
}

type RegisterResponse = UserDto

// Error mapping for better error messages
const errorMessages = {
  // Login errors
  invalid_credentials: "Invalid credentials",
  account_locked: "Your account has been locked due to too many failed login attempts. Please contact support.",
  account_disabled: "Your account has been disabled. Please contact support.",
  email_not_verified: "Please verify your email address before logging in.",

  // Registration errors
  email_exists: "An account with this email already exists.",
  weak_password: "The password you provided is too weak. Please choose a stronger password.",
  invalid_email: "Please provide a valid IYTE email address.",

  // General errors
  network_error: "Unable to connect to the server. Please check your internet connection.",
  server_error: "The server encountered an error. Please try again later.",
  timeout: "The request timed out. Please try again.",
  unknown: "An unknown error occurred. Please try again.",
}

// Helper function to get a user-friendly error message
function getErrorMessage(error: string): string {
  return errorMessages[error as keyof typeof errorMessages] || error
}

// Email validation function
function validateEmail(email: string): { isValid: boolean; error: string | null } {
  // Check if email is empty
  if (!email) {
    return { isValid: false, error: "Email is required" }
  }

  // Check email length
  if (email.length > 50) {
    return { isValid: false, error: "Email cannot exceed 50 characters" }
  }

  // Check if email contains @
  if (!email.includes("@")) {
    return { isValid: false, error: "Enter a valid iyte.edu.tr email address" }
  }

  // Check domain
  if (!email.endsWith("@iyte.edu.tr") && !email.endsWith("@std.iyte.edu.tr")) {
    return { isValid: false, error: "Only @iyte.edu.tr emails are allowed" }
  }

  // Check for invalid characters or spaces
  const validEmailRegex = /^[a-zA-Z0-9._-]+@(iyte\.edu\.tr|std\.iyte\.edu\.tr)$/
  if (!validEmailRegex.test(email)) {
    return { isValid: false, error: "Enter a valid iyte.edu.tr email address" }
  }

  return { isValid: true, error: null }
}

// Password validation function
function validatePassword(password: string): { isValid: boolean; error: string | null } {
  // Check if password is empty
  if (!password) {
    return { isValid: false, error: "Password is required" }
  }

  // Check password length
  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters" }
  }

  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one uppercase letter" }
  }

  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one lowercase letter" }
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one number" }
  }

  // Check for special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one special character" }
  }

  return { isValid: true, error: null }
}

export async function login(formData: FormData) {
  // Get form data
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Validate form data
  if (!email || !password) {
    console.error("Email and password are required")
    return { error: "Both email and password are required to log in." }
  }

  // Validate email
  const emailValidation = validateEmail(email)
  if (!emailValidation.isValid) {
    return { error: emailValidation.error }
  }

  // Validate password
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    return { error: passwordValidation.error }
  }

  try {
    // For demo purposes - hardcoded credentials check
    // In a real app, this would be replaced with an actual API call
    if (email === "egeunlu@std.iyte.edu.tr" && password === "iytE2024!") {
      console.log("Demo login successful")

      // Create mock user data
      const userData = {
        email: "egeunlu@std.iyte.edu.tr",
        firstName: "Ege",
        lastName: "Unlu",
      }

      // Create mock token
      const tokenData = {
        token: "demo-token-" + Date.now(), // Changed from accessToken to token
        expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
      }

      // Store user info in session
      const session = {
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
        role: "student",
        isAuthenticated: true,
      }

      // Store token in HTTP-only cookie
      cookies().set("auth_token", tokenData.token, {
        // Changed from accessToken to token
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: tokenData.expiresIn,
        path: "/",
        sameSite: "lax",
      })

      // Store session in cookie
      cookies().set("session", JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: tokenData.expiresIn,
        path: "/",
        sameSite: "lax",
      })

      return { success: true }
    }

    // Try the API call if demo credentials don't match
    console.log("Attempting API login for:", email)
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
      cache: "no-store",
    })

    // Log the raw response for debugging
    const responseText = await response.text()
    console.log("API Response:", responseText)

    // Parse the response as JSON
    let data: LoginResponse
    try {
      data = JSON.parse(responseText) as LoginResponse
    } catch (e) {
      console.error("Failed to parse API response:", e)
      return { error: "Invalid response from server. Please try again." }
    }

    // Handle API response
    if (!response.ok) {
      // Handle different error status codes
      if (response.status === 401) {
        return { error: getErrorMessage("invalid_credentials") }
      } else if (response.status === 404) {
        return { error: "No account found with this email address. Please register first." }
      } else if (response.status === 403) {
        return { error: getErrorMessage("account_disabled") }
      } else if (response.status === 429) {
        return { error: "Too many login attempts. Please try again later." }
      } else if (response.status >= 500) {
        return { error: getErrorMessage("server_error") }
      } else {
        const errorCode = data.token ? "unknown" : "unknown"
        return { error: getErrorMessage(errorCode) || "Login failed. Please try again." }
      }
    }

    // Validate the response data
    if (!data.user || !data.token || !data.token.token) {
      console.error("Invalid API response structure:", data)
      return { error: "Invalid response from server. Please try again." }
    }

    console.log("API login successful:", {
      user: data.user,
      tokenLength: data.token.token.length,
      expiresIn: data.token.expiresIn,
    })

    // Store user info in session
    const session = {
      email: data.user.email,
      name: `${data.user.firstName} ${data.user.lastName}`,
      role: "student",
      isAuthenticated: true,
    }

    // Store token in HTTP-only cookie
    cookies().set("auth_token", data.token.token, {
      // Changed from accessToken to token
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: data.token.expiresIn,
      path: "/",
      sameSite: "lax",
    })

    // Store session in cookie
    cookies().set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: data.token.expiresIn,
      path: "/",
      sameSite: "lax",
    })

    // Return success
    return { success: true }
  } catch (error) {
    console.error("Login failed:", error)
    return { error: getErrorMessage("network_error") }
  }
}

export async function register(formData: FormData) {
  // Get form data
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  // Validate form data
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    console.error("All fields are required")
    return { error: "All fields are required to create an account." }
  }

  // Validate email
  const emailValidation = validateEmail(email)
  if (!emailValidation.isValid) {
    return { error: emailValidation.error }
  }

  // Validate password
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    return { error: passwordValidation.error }
  }

  if (password !== confirmPassword) {
    console.error("Passwords do not match")
    return { error: "Passwords do not match. Please ensure both passwords are identical." }
  }

  try {
    // Make API request to register endpoint
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
      }),
      cache: "no-store",
    })

    // Handle API response
    if (!response.ok) {
      // Handle different error status codes
      if (response.status === 409) {
        return { error: getErrorMessage("email_exists") }
      } else if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}))
        if (errorData.code === "weak_password") {
          return { error: getErrorMessage("weak_password") }
        } else if (errorData.code === "invalid_email") {
          return { error: getErrorMessage("invalid_email") }
        } else {
          return { error: errorData.message || "Registration failed. Please check your information and try again." }
        }
      } else if (response.status >= 500) {
        return { error: getErrorMessage("server_error") }
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorCode = errorData.code || "unknown"
        return { error: getErrorMessage(errorCode) || errorData.message || "Registration failed. Please try again." }
      }
    }

    // Parse successful response
    const data: RegisterResponse = await response.json()

    // Return success
    return { success: true }
  } catch (error) {
    console.error("Registration failed:", error)
    return { error: getErrorMessage("network_error") }
  }
}

export async function logout() {
  // Delete the auth token and session cookies
  cookies().delete("auth_token")
  cookies().delete("session")

  // Redirect to home page
  redirect("/")
}

export async function getSession() {
  const session = cookies().get("session")?.value

  if (!session) {
    return null
  }

  return JSON.parse(session)
}

export async function getAuthToken() {
  return cookies().get("auth_token")?.value
}

export async function checkAuth() {
  const token = await getAuthToken()
  const session = await getSession()

  // Check if both token and session exist
  if (!token || !session) {
    return false
  }

  // Check if session has isAuthenticated flag
  if (session.isAuthenticated === true) {
    return true
  }

  // Fallback check - if we have both token and session, consider authenticated
  return true
}

// Helper function to make authenticated API requests
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getAuthToken()

  if (!token) {
    throw new Error("Not authenticated")
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  }

  return fetch(url, {
    ...options,
    headers,
  })
}
