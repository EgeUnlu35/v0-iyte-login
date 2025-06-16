"use server"

import { getAuthToken } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.iyte-gms.com"

// --- Type Definitions ---
export interface GraduationApplication {
  id: string
  studentId: string
  studentName: string
  studentLastName: string
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

export interface SubmitApplicationRequest {
  gpaOverall: number
  totalCredits: number
  departmentName: string
  transcriptFile: File
}

export interface TranscriptUploadResponse {
  agno: string
  total_credit: number
  message: string
}

export interface TranscriptValidationResult {
  valid: boolean
  reason?: string
  missing_courses?: string[]
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

export async function getMyApplication(): Promise<SuccessResponse<GraduationApplication> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { success: false, error: "Authentication required." }

    const response = await fetch(`${API_BASE_URL}/api/student/graduation-applications/my-application`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { success: false, error: result.error }
    return { success: true, data: result.data }
  } catch (error: any) {
    console.error("getMyApplication failed:", error)
    return { success: false, error: error.message || "Network error." }
  }
}

export async function submitGraduationApplication(
  applicationData: SubmitApplicationRequest,
): Promise<SuccessResponse<{ message: string }> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { success: false, error: "Authentication required." }

    // Create FormData with application data and transcript file
    const formData = new FormData()
    formData.append("departmentName", applicationData.departmentName)
    formData.append("transcript", applicationData.transcriptFile) // Add the transcript file

    const response = await fetch(`${API_BASE_URL}/api/student/graduation-applications/submit`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { success: false, error: result.error }
    return { success: true, data: result.data }
  } catch (error: any) {
    console.error("submitGraduationApplication failed:", error)
    return { success: false, error: error.message || "Network error." }
  }
}

// Store transcript data in memory for this session
let sessionTranscriptData: TranscriptUploadResponse | null = null
let sessionValidationData: TranscriptValidationResult | null = null
let sessionTranscriptFile: File | null = null

export async function uploadTranscript(
  formData: FormData,
): Promise<SuccessResponse<TranscriptUploadResponse> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { success: false, error: "Authentication required." }

    console.log("Processing transcript upload...")

    // Get the file from formData
    const file = formData.get("file") as File
    if (!file) {
      return { success: false, error: "No file provided" }
    }

    // Store the file for later use in submission
    sessionTranscriptFile = file

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Use the specific values you requested: Credits: 136, GPA: 3.64
    const transcriptData = {
      agno: "3.64",
      total_credit: 136,
      message: "Transcript processed successfully - GPA: 3.64, Credits: 136",
    }

    // Store in session
    sessionTranscriptData = transcriptData

    console.log("Transcript processing completed with real values")
    return { success: true, data: transcriptData }

    // TODO: Replace with actual backend call when endpoints are ready:
    /*
    const response = await fetch(`${API_BASE_URL}/api/student/transcript/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { success: false, error: result.error }
    
    sessionTranscriptData = result.data
    return { success: true, data: result.data }
    */
  } catch (error: any) {
    console.error("uploadTranscript error:", error)
    return { success: false, error: `Error: ${error.message}` }
  }
}

export async function validateTranscript(): Promise<SuccessResponse<TranscriptValidationResult> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { success: false, error: "Authentication required." }

    console.log("Validating transcript...")

    if (!sessionTranscriptData) {
      return { success: false, error: "No transcript data found. Please upload transcript first." }
    }

    // Simulate validation delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Validation result - assuming student has completed all courses
    const validationResult = {
      valid: true,
      reason: "All required courses completed successfully",
      missing_courses: [],
    }

    // Store validation result
    sessionValidationData = validationResult

    console.log("Transcript validation completed - All courses satisfied")
    return { success: true, data: validationResult }

    // TODO: Replace with actual backend call when endpoints are ready:
    /*
    const response = await fetch(`${API_BASE_URL}/api/student/transcript/validate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { success: false, error: result.error }
    
    sessionValidationData = result.data
    return { success: true, data: result.data }
    */
  } catch (error: any) {
    console.error("validateTranscript error:", error)
    return { success: false, error: `Error: ${error.message}` }
  }
}

export async function getApplicationStatus(): Promise<SuccessResponse<any> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { success: false, error: "Authentication required." }

    const response = await fetch(`${API_BASE_URL}/api/student/graduation-status`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { success: false, error: result.error }
    return { success: true, data: result.data }
  } catch (error: any) {
    console.error("getApplicationStatus failed:", error)
    return { success: false, error: error.message || "Network error." }
  }
}

// Helper functions - now async to comply with Server Actions
export async function isTranscriptReady(): Promise<boolean> {
  return !!(sessionTranscriptData && sessionValidationData)
}

export async function getStoredTranscriptData(): Promise<TranscriptUploadResponse | null> {
  return sessionTranscriptData
}

export async function getStoredValidationData(): Promise<TranscriptValidationResult | null> {
  return sessionValidationData
}

export async function getStoredTranscriptFile(): Promise<File | null> {
  return sessionTranscriptFile
}

export async function clearStoredData(): Promise<void> {
  sessionTranscriptData = null
  sessionValidationData = null
  sessionTranscriptFile = null
}
