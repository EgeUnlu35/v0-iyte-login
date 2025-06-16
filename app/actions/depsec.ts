"use server"

import { getAuthToken } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.iyte-gms.com"

// --- Generic Error and Success Response Types ---
export interface ApiErrorResponse {
  message: string
  errors?: { field: string; message: string }[]
  validationResults?: ImportValidationResult
  invalidEntries?: InvalidEntryDetail[]
}

export interface SuccessResponse<T> {
  success: true
  data: T
}

export interface SuccessMessageResponse {
  success: true
  message: string
}

export interface ErrorResponse {
  success?: false
  error: string
  details?: any
}

// --- Type Definitions ---
export type GraduationEntryStatus = "NEW" | "UNDER_REVIEW" | "PENDING_ISSUES" | "APPROVED" | "REJECTED" | "COMPLETED"

// Application types (from advisor.ts)
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

export interface GraduationListSummary {
  id: string
  name: string
  description: string
  createdAt: string
  entriesCount: number
}

export interface GraduationEntry {
  id: string
  studentId: string
  studentName: string
  studentLastName: string
  gpa: number
  graduationDate: string
  department: string
  creditsEarned: number
  status: GraduationEntryStatus
  notes?: string
}

export interface GraduationListDetail {
  id: string
  name: string
  description: string
  entries: GraduationEntry[]
}

export interface UpdateGraduationEntryPayload {
  studentId?: string
  studentName?: string
  studentLastName?: string
  gpa?: number
  graduationDate?: string
  department?: string
  creditsEarned?: number
  status?: "UNDER_REVIEW" | "PENDING_ISSUES"
  notes?: string
}

export interface ImportValidationResultErrorDetail {
  field: string
  message: string
}

export interface ImportValidationResultRowError {
  row: number
  errors: ImportValidationResultErrorDetail[]
}

export interface ImportValidationResult {
  isValid: boolean
  errors?: ImportValidationResultRowError[]
  validEntries?: GraduationEntry[]
  summary?: {
    total: number
    valid: number
    invalid: number
  }
}

export interface InvalidEntryDetail {
  id: string
  studentId: string
  studentName: string
  studentLastName: string
  errors: { field: string; message: string }[]
}

export interface GraduationRankingItem {
  rank: number
  studentId: string
  studentName: string
  studentLastName: string
  gpa: number
  department: string
  graduationDate: string
}

export interface GenerateCoverLetterRequest {
  notes: string
}

export interface CoverLetterResponseData {
  message: string
  entry: GraduationEntry
}

export interface CoverLetterData {
  studentId: string
  studentName: string
  studentLastName: string
  gpa: number
  graduationDate: string
  department: string
  creditsEarned: number
  status: GraduationEntryStatus
  notes?: string
}

export interface ApprovedApplication {
  id: string
  studentId: string
  studentName: string
  studentLastName: string
  submissionDate: string
  gpaOverall: number
  totalCredits: number
  departmentName: string
}

export interface ApprovedApplicationsResponseData {
  applications: ApprovedApplication[]
  total: number
}

export interface MapApplicationToEntryRequest {
  applicationId: string
  graduationListId: string
}

export interface MapApplicationToEntryResponseData {
  message: string
  graduationListId: string
  entryId: string
}

export interface CurriculumUploadResponseData {
  message: string
  curriculumCourses: string[]
}

// Application Cover Letter Request (for applications)
export interface ApplicationCoverLetterRequest {
  applicationId: string
  notes?: string
}

export interface ApplicationCoverLetterResponseData {
  message: string
  applicationId: string
  coverLetterUrl?: string
}

// YENİ: Mezuniyet onay mesajı için interface'ler
export interface GraduationApprovalMessageRequest {
  entryIds: string[]
  message?: string
  approvalType: "INDIVIDUAL" | "BULK"
}

export interface GraduationApprovalMessageResponse {
  message: string
  approvedCount: number
  failedEntries?: {
    entryId: string
    studentName: string
    error: string
  }[]
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
    const details: any = {}
    if (errorData.validationResults) details.validationResults = errorData.validationResults
    if (errorData.invalidEntries) details.invalidEntries = errorData.invalidEntries
    if (errorData.errors) details.errors = errorData.errors

    return { error: errorMessage, details: Object.keys(details).length > 0 ? details : undefined }
  }

  const contentType = response.headers.get("content-type")

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return { success: true, data: null }
  }

  if (contentType?.includes("text/csv")) {
    return { success: true, blob: await response.blob(), contentType: "text/csv" }
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

// UUID validation helper
function isValidUUID(id: string): boolean {
  if (!id || typeof id !== "string") return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

// Strict ID validation with detailed error
function validateAndLogId(functionName: string, id: any): { isValid: boolean; error?: string } {
  console.group(`🔍 STRICT ID VALIDATION - ${functionName}`)

  // Type check
  if (typeof id !== "string") {
    console.error(`❌ ID is not a string. Type: ${typeof id}, Value:`, id)
    console.groupEnd()
    return { isValid: false, error: `ID must be a string, got ${typeof id}: ${id}` }
  }

  // Empty check
  if (!id || id.trim() === "") {
    console.error(`❌ ID is empty or whitespace only. Value: "${id}"`)
    console.groupEnd()
    return { isValid: false, error: `ID cannot be empty` }
  }

  // Length check
  if (id.length !== 36) {
    console.error(`❌ ID length is ${id.length}, expected 36. Value: "${id}"`)
    console.groupEnd()
    return { isValid: false, error: `UUID must be 36 characters long, got ${id.length}: "${id}"` }
  }

  // UUID format check
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const isValidFormat = uuidRegex.test(id)

  if (!isValidFormat) {
    console.error(`❌ ID does not match UUID format. Value: "${id}"`)
    console.groupEnd()
    return { isValid: false, error: `Invalid UUID format: "${id}"` }
  }

  console.log("✅ ID is valid UUID format")
  console.groupEnd()
  return { isValid: true }
}

// --- APPLICATION API FUNCTIONS (from advisor.ts structure) ---

export async function getAllApplications(): Promise<
  SuccessResponse<{ applications: GraduationApplication[]; total: number }> | ErrorResponse
> {
  try {
    const token = await getAuthToken()
    if (!token) return { error: "Authentication required." }

    // Department Secretary için tüm departman applicationlarını getir
    const response = await fetch(`${API_BASE_URL}/api/depsec/graduation-applications/all`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { error: result.error }

    return {
      success: true,
      data: result.data,
    }
  } catch (error: any) {
    console.error("getAllApplications failed:", error)
    return { error: error.message || "Network error." }
  }
}

export async function reviewApplication(
  reviewData: ReviewApplicationRequest,
): Promise<SuccessResponse<{ message: string }> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { error: "Authentication required." }

    const response = await fetch(`${API_BASE_URL}/api/depsec/graduation-applications/review`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { error: result.error }

    return {
      success: true,
      data: result.data,
    }
  } catch (error: any) {
    console.error("reviewApplication failed:", error)
    return { error: error.message || "Network error." }
  }
}

export async function updateStudentInfo(
  applicationId: string,
  updateData: UpdateStudentInfoRequest,
): Promise<SuccessResponse<{ message: string }> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { error: "Authentication required." }

    const response = await fetch(`${API_BASE_URL}/api/depsec/graduation-applications/${applicationId}/update-info`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { error: result.error }

    return {
      success: true,
      data: result.data,
    }
  } catch (error: any) {
    console.error("updateStudentInfo failed:", error)
    return { error: error.message || "Network error." }
  }
}

export async function getApplicationDetails(
  applicationId: string,
): Promise<SuccessResponse<GraduationApplication> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { error: "Authentication required." }

    const validation = validateAndLogId("getApplicationDetails", applicationId)
    if (!validation.isValid) {
      return { error: validation.error! }
    }

    const response = await fetch(`${API_BASE_URL}/api/depsec/graduation-applications/${applicationId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { error: result.error }
    return { success: true, data: result.data }
  } catch (error: any) {
    console.error("getApplicationDetails failed:", error)
    return { error: error.message || "Network error." }
  }
}

export async function getApplicationsByStatus(
  status: ApplicationStatus,
): Promise<SuccessResponse<{ applications: GraduationApplication[]; total: number }> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { error: "Authentication required." }

    const response = await fetch(`${API_BASE_URL}/api/depsec/graduation-applications/status/${status}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { error: result.error }

    return {
      success: true,
      data: result.data,
    }
  } catch (error: any) {
    console.error("getApplicationsByStatus failed:", error)
    return { error: error.message || "Network error." }
  }
}

// NEW: Generate Cover Letter for Application (not graduation entry)
export async function generateApplicationCoverLetter(
  applicationId: string,
  payload: ApplicationCoverLetterRequest,
): Promise<SuccessResponse<ApplicationCoverLetterResponseData> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { error: "Authentication required." }

    const validation = validateAndLogId("generateApplicationCoverLetter", applicationId)
    if (!validation.isValid) {
      return { error: validation.error! }
    }

    console.log("Generating cover letter for application:", applicationId, "with payload:", payload)

    const response = await fetch(`${API_BASE_URL}/api/depsec/graduation-applications/${applicationId}/cover-letter`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { error: result.error, details: result.details }
    return { success: true, data: result.data }
  } catch (error: any) {
    console.error("generateApplicationCoverLetter failed:", error)
    return { error: error.message || "Network error." }
  }
}

// --- EXISTING GRADUATION LIST API FUNCTIONS ---

export async function uploadCurriculum(
  formData: FormData,
): Promise<SuccessResponse<CurriculumUploadResponseData> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { error: "Authentication required." }

    const response = await fetch(`${API_BASE_URL}/api/graduation/upload-curriculum`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) {
      return { error: result.error, details: result.details }
    }
    return { success: true, data: result.data }
  } catch (error: any) {
    console.error("uploadCurriculum failed:", error)
    return { error: error.message || "Network error." }
  }
}

export async function createGraduationList(
  formData: FormData,
): Promise<SuccessResponse<{ id: string; message: string }> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { error: "Authentication required." }

    const response = await fetch(`${API_BASE_URL}/api/graduation`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) {
      return { error: result.error, details: result.details }
    }
    return { success: true, data: result.data }
  } catch (error: any) {
    console.error("createGraduationList failed:", error)
    return { error: error.message || "Network error." }
  }
}

export async function getAllGraduationLists(): Promise<SuccessResponse<GraduationListSummary[]> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { error: "Authentication required." }

    const response = await fetch(`${API_BASE_URL}/api/graduation`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { error: result.error }
    return { success: true, data: result.data }
  } catch (error: any) {
    console.error("getAllGraduationLists failed:", error)
    return { error: error.message || "Network error." }
  }
}

export async function getGraduationList(id: string): Promise<SuccessResponse<GraduationListDetail> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { error: "Authentication required." }

    // STRICT VALIDATION - Backend'e gitmeden önce engelle
    const validation = validateAndLogId("getGraduationList", id)
    if (!validation.isValid) {
      return { error: validation.error! }
    }

    const response = await fetch(`${API_BASE_URL}/api/graduation/${id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { error: result.error }
    return { success: true, data: result.data }
  } catch (error: any) {
    console.error("getGraduationList failed:", error)
    return { error: error.message || "Network error." }
  }
}

export async function exportGraduationList(
  graduationListId: string,
  includeHeaders = true,
): Promise<{ success: true; blob: Blob; contentType: string; filename: string } | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { error: "Authentication required." }

    // STRICT VALIDATION
    const validation = validateAndLogId("exportGraduationList", graduationListId)
    if (!validation.isValid) {
      return { error: validation.error! }
    }

    const response = await fetch(`${API_BASE_URL}/api/graduation/export`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ graduationListId, includeHeaders }),
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { error: result.error }

    if (result.success && result.blob) {
      const disposition = response.headers.get("Content-Disposition")
      let filename = `graduation_list_${graduationListId}.csv`
      if (disposition && disposition.indexOf("attachment") !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        const matches = filenameRegex.exec(disposition)
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "")
        }
      }
      return { success: true, blob: result.blob, contentType: result.contentType!, filename }
    }
    return { error: "Failed to get CSV blob from response." }
  } catch (error: any) {
    console.error("exportGraduationList failed:", error)
    return { error: error.message || "Network error." }
  }
}

export async function updateGraduationEntry(
  id: string,
  entryData: UpdateGraduationEntryPayload,
): Promise<SuccessResponse<{ message: string; entry: GraduationEntry }> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { error: "Authentication required." }

    // STRICT VALIDATION
    const validation = validateAndLogId("updateGraduationEntry", id)
    if (!validation.isValid) {
      return { error: validation.error! }
    }

    const response = await fetch(`${API_BASE_URL}/api/graduation/entries/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(entryData),
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { error: result.error, details: result.details }
    return { success: true, data: result.data }
  } catch (error: any) {
    console.error("updateGraduationEntry failed:", error)
    return { error: error.message || "Network error." }
  }
}

export async function deleteGraduationEntry(id: string): Promise<SuccessMessageResponse | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { error: "Authentication required." }

    // STRICT VALIDATION
    const validation = validateAndLogId("deleteGraduationEntry", id)
    if (!validation.isValid) {
      return { error: validation.error! }
    }

    const response = await fetch(`${API_BASE_URL}/api/graduation/entries/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { error: result.error }
    const message = result.data?.message || "Entry deleted successfully."
    return { success: true, message }
  } catch (error: any) {
    console.error("deleteGraduationEntry failed:", error)
    return { error: error.message || "Network error." }
  }
}

export async function approveGraduationList(graduationListId: string): Promise<SuccessMessageResponse | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { error: "Authentication required." }

    // STRICT VALIDATION
    const validation = validateAndLogId("approveGraduationList", graduationListId)
    if (!validation.isValid) {
      return { error: validation.error! }
    }

    const response = await fetch(`${API_BASE_URL}/api/graduation/approve/${graduationListId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) {
      return { error: result.error, details: result.details }
    }
    const message = result.data?.message || "List approved successfully."
    return { success: true, message }
  } catch (error: any) {
    console.error("approveGraduationList failed:", error)
    return { error: error.message || "Network error." }
  }
}

export async function getCoverLetterData(entryId: string): Promise<SuccessResponse<CoverLetterData> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { error: "Authentication required." }

    // STRICT VALIDATION
    const validation = validateAndLogId("getCoverLetterData", entryId)
    if (!validation.isValid) {
      return { error: validation.error! }
    }

    const response = await fetch(`${API_BASE_URL}/api/graduation/${entryId}/cover-letter`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { error: result.error }
    return { success: true, data: result.data }
  } catch (error: any) {
    console.error("getCoverLetterData failed:", error)
    return { error: error.message || "Network error." }
  }
}

export async function generateCoverLetter(
  entryId: string,
  payload: GenerateCoverLetterRequest,
): Promise<SuccessResponse<CoverLetterResponseData> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { error: "Authentication required." }

    // STRICT VALIDATION
    const validation = validateAndLogId("generateCoverLetter", entryId)
    if (!validation.isValid) {
      return { error: validation.error! }
    }

    const response = await fetch(`${API_BASE_URL}/api/graduation/${entryId}/cover-letter`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { error: result.error, details: result.details }
    return { success: true, data: result.data }
  } catch (error: any) {
    console.error("generateCoverLetter failed:", error)
    return { error: error.message || "Network error." }
  }
}

export async function getGraduationRankings(
  graduationListId: string,
): Promise<SuccessResponse<GraduationRankingItem[]> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { error: "Authentication required." }

    // STRICT VALIDATION
    const validation = validateAndLogId("getGraduationRankings", graduationListId)
    if (!validation.isValid) {
      return { error: validation.error! }
    }

    const response = await fetch(`${API_BASE_URL}/api/graduation/graduation-rankings/${graduationListId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { error: result.error }
    return { success: true, data: result.data }
  } catch (error: any) {
    console.error("getGraduationRankings failed:", error)
    return { error: error.message || "Network error." }
  }
}

export async function getApprovedApplications(): Promise<
  SuccessResponse<ApprovedApplicationsResponseData> | ErrorResponse
> {
  try {
    const token = await getAuthToken()
    if (!token) return { error: "Authentication required." }

    console.log("Fetching approved applications from:", `${API_BASE_URL}/api/graduation/approved-applications`)

    const response = await fetch(`${API_BASE_URL}/api/graduation/approved-applications`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    console.log("Response status:", response.status)

    const result = await handleApiResponse(response)
    if (result.error) {
      console.error("API Error:", result.error)
      return { error: result.error }
    }

    console.log("API response:", result.data)

    return {
      success: true,
      data: result.data,
    }
  } catch (error: any) {
    console.error("getApprovedApplications failed:", error)
    return { error: error.message || "Network error." }
  }
}

export async function mapApplicationToGraduationEntry(
  payload: MapApplicationToEntryRequest,
): Promise<SuccessResponse<MapApplicationToEntryResponseData> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { error: "Authentication required." }

    // STRICT VALIDATION for both IDs
    const appIdValidation = validateAndLogId("mapApplicationToGraduationEntry[applicationId]", payload.applicationId)
    if (!appIdValidation.isValid) {
      return { error: `Application ID: ${appIdValidation.error}` }
    }

    const listIdValidation = validateAndLogId(
      "mapApplicationToGraduationEntry[graduationListId]",
      payload.graduationListId,
    )
    if (!listIdValidation.isValid) {
      return { error: `Graduation List ID: ${listIdValidation.error}` }
    }

    const response = await fetch(`${API_BASE_URL}/api/graduation/map-application-to-graduation-entry`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) return { error: result.error, details: result.details }
    return { success: true, data: result.data }
  } catch (error: any) {
    console.error("mapApplicationToGraduationEntry failed:", error)
    return { error: error.message || "Network error." }
  }
}

// YENİ: Mezuniyet onay mesajı gönderme fonksiyonu
export async function sendGraduationApprovalMessage(
  payload: GraduationApprovalMessageRequest,
): Promise<SuccessResponse<GraduationApprovalMessageResponse> | ErrorResponse> {
  try {
    const token = await getAuthToken()
    if (!token) return { error: "Authentication required." }

    // Tüm entry ID'lerini validate et
    for (const entryId of payload.entryIds) {
      const validation = validateAndLogId("sendGraduationApprovalMessage", entryId)
      if (!validation.isValid) {
        return { error: `Entry ID validation failed: ${validation.error}` }
      }
    }

    console.log("Sending graduation approval message for entries:", payload.entryIds)

    const response = await fetch(`${API_BASE_URL}/api/graduation/send-approval-message`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    })

    const result = await handleApiResponse(response)
    if (result.error) {
      console.error("API Error:", result.error)
      return { error: result.error, details: result.details }
    }

    console.log("Graduation approval message sent successfully:", result.data)

    return {
      success: true,
      data: result.data,
    }
  } catch (error: any) {
    console.error("sendGraduationApprovalMessage failed:", error)
    return { error: error.message || "Network error." }
  }
}
