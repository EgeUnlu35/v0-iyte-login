"use server"

import { getAuthToken } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.iyte-gms.com"

// --- Type Definitions ---
export interface GraduationApplication {
  id: string
  studentId: string
  studentName: string
  studentLastName: string
  studentEmail?: string
  gpaOverall: number
  totalCredits: number
  departmentName: string
  status: string
  submissionDate: string
  reviewDate?: string
  feedback?: string
  missingCourses0?: string
  missingCourses1?: string
  missingCourses2?: string
}

export type ApplicationStatus = "APPROVED" | "REJECTED" | "RETURNED_FOR_REVISION"

export interface ReviewApplicationRequest {
  applicationId: string
  status: ApplicationStatus
  feedback?: string
}

export interface UpdateStudentInfoRequest {
  gpaOverall?: number
  totalCredits?: number
  reason: string
}

export interface SuccessResponse<T> {
  success: true
  data: T
  message?: string
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

export async function getAllApplications(): Promise<
  SuccessResponse<{ applications: GraduationApplication[]; total: number }> | ErrorResponse
> {
  try {
    const token = await getAuthToken()
    if (!token) return { success: false, error: "Authentication required." }

    // Mevcut /my-students endpoint'ini kullan - advisor'ın tüm öğrencilerini getirir
    const response = await fetch(`${API_BASE_URL}/api/advisor/graduation-applications/my-students`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { success: false, error: result.error }

    return {
      success: true,
      data: result.data,
    }
  } catch (error: any) {
    console.error("getAllApplications failed:", error)
    return { success: false, error: error.message || "Network error." }
  }
}

export async function reviewApplication(
  reviewData: ReviewApplicationRequest,
): Promise<SuccessResponse<{ message: string }> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { success: false, error: "Authentication required." }

    const response = await fetch(`${API_BASE_URL}/api/advisor/graduation-applications/review`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { success: false, error: result.error }

    return {
      success: true,
      data: result.data,
      message: result.data?.message || "Application reviewed successfully.",
    }
  } catch (error: any) {
    console.error("reviewApplication failed:", error)
    return { success: false, error: error.message || "Network error." }
  }
}

export async function updateStudentInfo(
  applicationId: string,
  updateData: UpdateStudentInfoRequest,
): Promise<SuccessResponse<{ message: string }> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { success: false, error: "Authentication required." }

    const response = await fetch(`${API_BASE_URL}/api/advisor/graduation-applications/${applicationId}/update-info`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { success: false, error: result.error }

    return {
      success: true,
      data: result.data,
      message: result.data?.message || "Student information updated successfully.",
    }
  } catch (error: any) {
    console.error("updateStudentInfo failed:", error)
    return { success: false, error: error.message || "Network error." }
  }
}

export async function getApplicationDetails(
  applicationId: string,
): Promise<SuccessResponse<GraduationApplication> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { success: false, error: "Authentication required." }

    const response = await fetch(`${API_BASE_URL}/api/advisor/graduation-applications/${applicationId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { success: false, error: result.error }
    return { success: true, data: result.data }
  } catch (error: any) {
    console.error("getApplicationDetails failed:", error)
    return { success: false, error: error.message || "Network error." }
  }
}

export async function getApplicationsByStatus(
  status: ApplicationStatus,
): Promise<SuccessResponse<{ applications: GraduationApplication[]; total: number }> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { success: false, error: "Authentication required." }

    const response = await fetch(`${API_BASE_URL}/api/advisor/graduation-applications/status/${status}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { success: false, error: result.error }

    return {
      success: true,
      data: result.data,
    }
  } catch (error: any) {
    console.error("getApplicationsByStatus failed:", error)
    return { success: false, error: error.message || "Network error." }
  }
}
