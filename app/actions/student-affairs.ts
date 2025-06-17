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
  // Department Chair signing info
  departmentChairSigned: boolean
  departmentChairSignedAt?: string
  departmentChairSignedBy?: string
  // Faculty Secretary signing info
  facultySecretary: boolean
  facultySecretarySignedBy?: string
  facultySecretarySignedAt?: string
  // Student Affairs signing info
  studentAffairsSigned: boolean
  studentAffairsSignedAt?: string
  studentAffairsSignedBy?: string
  // Overall completion status
  isFullySigned: boolean
  completedAt?: string
  createdAt: string
}

export interface CoverLetterListResponse {
  coverLetters: CoverLetter[]
  total: number
}

export interface SignCoverLetterResponse {
  message: string
  entry: CoverLetter
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

/**
 * Get cover letters pending student affairs signature from faculty secretaries
 * According to workflow: Status Required: COMPLETED, Stage Required: PENDING_STUDENT_AFFAIRS
 */
export async function getCoverLettersForReview(): Promise<SuccessResponse<CoverLetterListResponse> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { success: false, error: "Authentication required." }

    const response = await fetch(`${API_BASE_URL}/api/student-affairs/cover-letters`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { success: false, error: result.error }
    
    // Validate and fix the data according to the workflow documentation
    if (result.data && result.data.coverLetters) {
      const rawLetters = [...result.data.coverLetters]; // Store raw data for debugging
      
      result.data.coverLetters = result.data.coverLetters.map((letter: any) => {
        // Ensure all required fields are present
        const coverLetterData = letter.coverLetter || letter; // Handle nested structure
        
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
          stage: coverLetterData.stage || letter.stage || "PENDING_STUDENT_AFFAIRS",
          // Department Chair info - check both nested and flat structures
          departmentChairSigned: Boolean(
            coverLetterData.departmentChairSigned || 
            letter.departmentChairSigned ||
            coverLetterData.deptChairSigned || 
            letter.deptChairSigned ||
            coverLetterData.departmentChairApproved ||
            letter.departmentChairApproved ||
            coverLetterData.isSignedByDepartmentChair ||
            letter.isSignedByDepartmentChair ||
            (coverLetterData.stage === "PENDING_STUDENT_AFFAIRS" || coverLetterData.stage === "FULLY_SIGNED") ||
            false
          ),
          departmentChairSignedAt: coverLetterData.departmentChairSignedAt || letter.departmentChairSignedAt || coverLetterData.deptChairSignedAt || letter.deptChairSignedAt || null,
          departmentChairSignedBy: coverLetterData.departmentChairSignedBy || letter.departmentChairSignedBy || coverLetterData.deptChairSignedBy || letter.deptChairSignedBy || null,
          // Faculty Secretary info - check both nested and flat structures
          facultySecretary: Boolean(
            coverLetterData.facultySecretary || 
            letter.facultySecretary ||
            coverLetterData.facultySecretarySigned ||
            letter.facultySecretarySigned ||
            coverLetterData.isSignedByFacultySecretary ||
            letter.isSignedByFacultySecretary ||
            (coverLetterData.stage === "PENDING_STUDENT_AFFAIRS" || coverLetterData.stage === "FULLY_SIGNED") ||
            false
          ),
          facultySecretarySignedBy: coverLetterData.facultySecretarySignedBy || letter.facultySecretarySignedBy || null,
          facultySecretarySignedAt: coverLetterData.facultySecretarySignedAt || letter.facultySecretarySignedAt || null,
          // Student Affairs info - check both nested and flat structures
          studentAffairsSigned: Boolean(
            coverLetterData.studentAffairsSigned || 
            letter.studentAffairsSigned ||
            coverLetterData.isSignedByStudentAffairs ||
            letter.isSignedByStudentAffairs ||
            false
          ),
          studentAffairsSignedAt: coverLetterData.studentAffairsSignedAt || letter.studentAffairsSignedAt || null,
          studentAffairsSignedBy: coverLetterData.studentAffairsSignedBy || letter.studentAffairsSignedBy || null,
          // Overall status - check both nested and flat structures
          isFullySigned: Boolean(coverLetterData.isFullySigned || letter.isFullySigned),
          completedAt: coverLetterData.completedAt || letter.completedAt || null,
          createdAt: coverLetterData.createdAt || letter.createdAt || new Date().toISOString(),
        }
      })
      
      console.log("Student Affairs - Raw API data sample:", rawLetters[0]);
      console.log("Student Affairs - Nested structure analysis:", rawLetters.map((raw: any) => ({
        id: raw.id || raw.entryId,
        hasNestedCoverLetter: !!raw.coverLetter,
        topLevelStage: raw.stage,
        nestedStage: raw.coverLetter?.stage,
        topLevelFacultySigned: raw.facultySecretary,
        nestedFacultySigned: raw.coverLetter?.facultySecretary,
        nestedFacultySignedAt: raw.coverLetter?.facultySecretarySignedAt,
        topLevelStudentAffairsSigned: raw.studentAffairsSigned,
        nestedStudentAffairsSigned: raw.coverLetter?.studentAffairsSigned,
      })));
      console.log("Student Affairs - Processed cover letters:", result.data.coverLetters.map((l: CoverLetter) => ({ 
        id: l.id, 
        stage: l.stage, 
        departmentChairSigned: l.departmentChairSigned,
        facultySecretary: l.facultySecretary,
        studentAffairsSigned: l.studentAffairsSigned,
        inferredFromStage: l.stage === "PENDING_STUDENT_AFFAIRS" || l.stage === "FULLY_SIGNED"
      })))
    }
    
    return { success: true, data: result.data }
  } catch (error: any) {
    console.error("getCoverLettersForReview failed:", error)
    return { success: false, error: error.message || "Network error." }
  }
}

/**
 * Get specific cover letter by ID
 */
export async function getCoverLetterById(entryId: string): Promise<SuccessResponse<CoverLetter> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { success: false, error: "Authentication required." }

    const response = await fetch(`${API_BASE_URL}/api/student-affairs/cover-letters/${entryId}`, {
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

/**
 * Sign cover letter as student affairs (final signature)
 * According to workflow: Action: POST /api/student-affairs/cover-letters/{id}/sign
 * Final Stage: FULLY_SIGNED
 */
export async function signCoverLetter(
  entryId: string,
): Promise<SuccessResponse<SignCoverLetterResponse> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { success: false, error: "Authentication required." }

    const response = await fetch(`${API_BASE_URL}/api/student-affairs/cover-letters/${entryId}/sign`, {
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