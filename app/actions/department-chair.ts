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
    
    // Validate and fix the data according to the workflow documentation
    if (result.data && result.data.coverLetters) {
      result.data.coverLetters = result.data.coverLetters.map((letter: any) => {
        // If stage is empty/undefined, and the letter hasn't been signed by department chair,
        // it should be in PENDING_DEPARTMENT_CHAIR stage according to the workflow
        if (!letter.stage || letter.stage.trim() === "") {
          if (!letter.departmentChairSigned) {
            letter.stage = "PENDING_DEPARTMENT_CHAIR"
            console.log(`Fixed empty stage for letter ${letter.id || letter.entryId}: set to PENDING_DEPARTMENT_CHAIR`)
          } else {
            // If already signed but stage is empty, it might be in the next stage
            letter.stage = "PENDING_FACULTY_SECRETARY"
            console.log(`Fixed empty stage for signed letter ${letter.id || letter.entryId}: set to PENDING_FACULTY_SECRETARY`)
          }
        }
        
        // Ensure all required fields are present
        return {
          id: letter.id || letter.entryId || "unknown",
          entryId: letter.entryId || letter.id || "unknown",
          studentId: letter.studentId || "Unknown",
          studentName: letter.studentName || "Unknown",
          studentLastName: letter.studentLastName || "Student",
          gpa: typeof letter.gpa === 'number' ? letter.gpa : 0,
          graduationDate: letter.graduationDate || new Date().toISOString(),
          department: letter.department || "Unknown Department",
          creditsEarned: typeof letter.creditsEarned === 'number' ? letter.creditsEarned : 0,
          notes: letter.notes || "",
          stage: letter.stage || "PENDING_DEPARTMENT_CHAIR",
          departmentChairSigned: Boolean(letter.departmentChairSigned),
          departmentChairSignedAt: letter.departmentChairSignedAt || null,
          departmentChairSignedBy: letter.departmentChairSignedBy || null,
          createdAt: letter.createdAt || new Date().toISOString(),
        }
      })
      
      console.log("Processed cover letters:", result.data.coverLetters.map((l: CoverLetter) => ({ 
        id: l.id, 
        stage: l.stage, 
        departmentChairSigned: l.departmentChairSigned 
      })))
    }
    
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
