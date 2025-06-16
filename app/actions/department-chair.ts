"use server"

import { getAuthToken } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.iyte-gms.com"

// --- Type Definitions ---
export interface CoverLetter {
  id: string
  entryId: string
  studentId: string
  studentName: string
  studentLastName: string
  gpa: number
  graduationDate: string
  department: string
  creditsEarned: number
  notes?: string
  stage: string
  departmentChairSigned: boolean
  departmentChairSignedAt?: string
  departmentChairSignedBy?: string
  createdAt: string
}

export interface CoverLetterListResponse {
  coverLetters: CoverLetter[]
  total: number
}

export interface SignCoverLetterResponse {
  message: string
  coverLetter: CoverLetter
}

export interface SuccessResponse<T> {
  success: true
  data: T
}

export interface ErrorResponse {
  success: false
  error: string
}

// --- Helper for Error Handling ---
async function handleApiResponse(response: Response) {
  if (!response.ok) {
    let errorData: any = {}
    try {
      errorData = await response.json()
    } catch (e) {
      const text = await response.text().catch(() => "Failed to read error response text.")
      errorData = { message: `Server returned ${response.status}. Response: ${text.substring(0, 200)}` }
    }

    const errorMessage = errorData.message || errorData.detail || `Request failed with status ${response.status}`
    return { error: errorMessage }
  }

  const contentType = response.headers.get("content-type")

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return { success: true, data: null }
  }

  if (contentType?.includes("application/json")) {
    try {
      return { success: true, data: await response.json() }
    } catch (e: any) {
      console.error("handleApiResponse: Failed to parse supposedly JSON response:", e)
      return { error: `Failed to parse JSON response: ${e.message}` }
    }
  }

  try {
    const textData = await response.text()
    console.warn(
      `handleApiResponse: Received non-JSON response with status ${response.status} and Content-Type: ${contentType}. Body: ${textData.substring(0, 200)}`,
    )
    return { error: `Unexpected response type. Status: ${response.status}, Content-Type: ${contentType}` }
  } catch (e: any) {
    return { error: `Failed to read response text: ${e.message}` }
  }
}

// --- API Functions ---

export async function getCoverLettersForReview(): Promise<SuccessResponse<CoverLetterListResponse> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { success: false, error: "Authentication required." }

    const response = await fetch(`${API_BASE_URL}/api/department-chair/cover-letters`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { success: false, error: result.error }
    return { success: true, data: result.data }
  } catch (error: any) {
    console.error("getCoverLettersForReview failed:", error)
    return { success: false, error: error.message || "Network error." }
  }
}

export async function getCoverLetterById(entryId: string): Promise<SuccessResponse<CoverLetter> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { success: false, error: "Authentication required." }

    const response = await fetch(`${API_BASE_URL}/api/department-chair/cover-letters/${entryId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { success: false, error: result.error }
    return { success: true, data: result.data }
  } catch (error: any) {
    console.error("getCoverLetterById failed:", error)
    return { success: false, error: error.message || "Network error." }
  }
}

export async function signCoverLetter(
  entryId: string,
): Promise<SuccessResponse<SignCoverLetterResponse> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { success: false, error: "Authentication required." }

    const response = await fetch(`${API_BASE_URL}/api/department-chair/cover-letters/${entryId}/sign`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { success: false, error: result.error }
    return { success: true, data: result.data }
  } catch (error: any) {
    console.error("signCoverLetter failed:", error)
    return { success: false, error: error.message || "Network error." }
  }
}
