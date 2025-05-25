"use server"

import { getAuthToken } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.iyte-gms.com"

// --- Generic Error and Success Response Types ---
export interface ApiErrorResponse {
  message: string;
  // For errors that include field-specific details
  errors?: { field: string; message: string }[];
  // For specific error responses like CSV import or list approval
  validationResults?: ImportValidationResult;
  invalidEntries?: InvalidEntryDetail[];
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface SuccessMessageResponse {
  success: true;
  message: string;
}

export interface ErrorResponse {
  success?: false; // To make it compatible when success field is expected
  error: string; // General error message
  details?: any; // For specific error data like validationResults or invalidEntries
}


// --- Type Definitions based on Schemas ---

export type GraduationEntryStatus = "NEW" | "UNDER_REVIEW" | "PENDING_ISSUES" | "APPROVED" | "REJECTED" | "COMPLETED";
// export type ApplicationStatus // This would be from student or a shared types file, if needed for depsec context.

export interface GraduationListSummary {
  id: string;
  name: string;
  description: string;
  createdAt: string; // format: date-time
  entriesCount: number;
}

export interface GraduationEntry {
  id: string; // format: uuid
  studentId: string;
  studentName: string;
  studentLastName: string;
  gpa: number; // minimum: 0, maximum: 4
  graduationDate: string; // format: date
  department: string;
  creditsEarned: number; // minimum: 0
  status: GraduationEntryStatus;
  notes?: string;
}

// For GET /api/graduation/{id}
export interface GraduationListDetail {
  id: string; // format: uuid
  name: string;
  description: string;
  // createdAt: string; // Not in the schema for GraduationList, but often present in detailed views. Keeping it out to strictly follow schema.
  entries: GraduationEntry[];
}

export interface UpdateGraduationEntryPayload {
  studentId?: string;
  studentName?: string;
  studentLastName?: string;
  gpa?: number; // minimum: 2.5, maximum: 4 in swagger for PUT, but GraduationEntry schema is 0-4. Using 0-4 for consistency.
  graduationDate?: string; // format: date
  department?: string;
  creditsEarned?: number; // minimum: 140 in swagger for PUT
  status?: "UNDER_REVIEW" | "PENDING_ISSUES"; // As per swagger for PUT
  notes?: string;
}

export interface ImportValidationResultErrorDetail {
  field: string;
  message: string;
}

export interface ImportValidationResultRowError {
  row: number;
  errors: ImportValidationResultErrorDetail[];
}

export interface ImportValidationResult {
  isValid: boolean;
  errors?: ImportValidationResultRowError[];
  validEntries?: GraduationEntry[];
  summary?: {
    total: number;
    valid: number;
    invalid: number;
  };
}

// For POST /api/graduation (on 400 error)
interface CreateGraduationListErrorResponse extends ErrorResponse {
  details?: { validationResults: ImportValidationResult };
}

// For POST /api/graduation/approve/{graduationListId} (on 400 error)
export interface InvalidEntryDetail {
  id: string; // format: uuid
  studentId: string;
  studentName: string;
  studentLastName: string;
  errors: { field: string; message: string }[];
}
interface ApproveGraduationListErrorResponse extends ErrorResponse {
  details?: { invalidEntries: InvalidEntryDetail[] };
}

// For GET /api/graduation/graduation-rankings/{id}
export interface GraduationRankingItem {
  rank: number;
  studentId: string;
  studentName: string;
  studentLastName: string;
  gpa: number;
  department: string;
  graduationDate: string; // format: date-time
}

// For POST /api/graduation/{id}/cover-letter
export interface GenerateCoverLetterRequest {
  notes: string; // minLength: 1
}

export interface CoverLetterResponseData {
  message: string;
  entry: GraduationEntry;
}

// For GET /api/graduation/{id}/cover-letter
export interface CoverLetterData {
  studentId: string;
  studentName: string;
  studentLastName: string;
  gpa: number;
  graduationDate: string; // format: date
  department: string;
  creditsEarned: number;
  status: GraduationEntryStatus;
  notes?: string;
}

// For POST /api/graduation/entries/validate
export interface ValidateGraduationEntryFieldsRequest {
  gpa?: number;
  graduationDate?: string;
  creditsEarned?: number;
}

export interface ValidateGraduationEntryFieldsResponse {
  isValid: boolean;
  errors?: { field: string; message: string }[];
}

// For GET /api/graduation/approved-applications
export interface ApprovedApplication {
  id: string; // format: uuid
  studentId: string;
  studentName: string;
  studentLastName: string;
  submissionDate: string; // format: date-time
  gpaOverall: number;
  totalCredits: number;
  departmentName: string;
}

export interface ApprovedApplicationsResponseData {
  applications: ApprovedApplication[];
  total: number;
}

// For POST /api/graduation/map-application-to-graduation-entry
export interface MapApplicationToEntryRequest {
  applicationId: string; // format: uuid
  graduationListId: string; // format: uuid
}

export interface MapApplicationToEntryResponseData {
  message: string;
  graduationListId: string; // format: uuid
  entryId: string; // format: uuid
}

// --- Helper for Error Handling ---
async function handleApiResponse(response: Response) {
  if (!response.ok) {
    let errorData: any = {};
    try {
      // Try to parse JSON first, as many APIs return JSON errors
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON (e.g. plain text or HTML error page)
      const text = await response.text().catch(() => "Failed to read error response text.");
      errorData = { message: `Server returned ${response.status}. Response: ${text.substring(0, 200)}` };
    }
    
    const errorMessage = errorData.message || errorData.detail || `Request failed with status ${response.status}`;
    const details: any = {};
    if (errorData.validationResults) details.validationResults = errorData.validationResults;
    if (errorData.invalidEntries) details.invalidEntries = errorData.invalidEntries;
    if (errorData.errors) details.errors = errorData.errors;

    return { error: errorMessage, details: Object.keys(details).length > 0 ? details : undefined };
  }

  // Handle successful responses
  const contentType = response.headers.get("content-type");

  // For 204 No Content or other non-JSON success responses for specific endpoints
  if (response.status === 204 || response.headers.get("content-length") === "0") {
      return { success: true, data: null };
  }

  // For CSV download which returns blob
  if (contentType?.includes("text/csv")) {
      return { success: true, blob: await response.blob(), contentType: "text/csv" };
  }
  
  // For other successful responses, attempt to parse as JSON
  // but handle cases where it might not be JSON even with a 2xx status.
  if (contentType?.includes("application/json")) {
    try {
      return { success: true, data: await response.json() };
    } catch (e: any) {
      // This can happen if Content-Type is application/json but body is invalid JSON
      console.error("handleApiResponse: Failed to parse supposedly JSON response:", e);
      return { error: `Failed to parse JSON response: ${e.message}` };
    }
  }

  // If content-type is not JSON, or parsing failed, but status was ok,
  // return the raw text for inspection or treat as an unexpected response type.
  // This case should be rare for well-behaved APIs that correctly set Content-Type.
  try {
    const textData = await response.text();
    console.warn(`handleApiResponse: Received non-JSON response with status ${response.status} and Content-Type: ${contentType}. Body: ${textData.substring(0,200)}`);
    // Depending on requirements, you might return the text data or an error.
    // For now, let's assume if it was a 2xx and not explicitly handled (CSV, JSON, No Content), it might be an issue.
    return { error: `Unexpected response type. Status: ${response.status}, Content-Type: ${contentType}` };
  } catch (e:any) {
    return { error: `Failed to read response text: ${e.message}` };
  }
}


// --- API Functions ---

/**
 * @swagger /api/graduation (POST)
 * Create graduation list from CSV file
 */
export async function createGraduationList(
  formData: FormData
): Promise<SuccessResponse<{ id: string; message: string }> | CreateGraduationListErrorResponse> {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Authentication required." };

    const response = await fetch(`${API_BASE_URL}/api/graduation`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      cache: "no-store",
    });

    const result = await handleApiResponse(response);
    if (result.error) {
      return { error: result.error, details: result.details };
    }
    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("createGraduationList failed:", error);
    return { error: error.message || "Network error." };
  }
}

/**
 * @swagger /api/graduation (GET)
 * Get all graduation lists
 */
export async function getAllGraduationLists(): Promise<SuccessResponse<GraduationListSummary[]> | ErrorResponse> {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Authentication required." };

    const response = await fetch(`${API_BASE_URL}/api/graduation`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    });
    
    const result = await handleApiResponse(response);
    if (result.error) return { error: result.error };
    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("getAllGraduationLists failed:", error);
    return { error: error.message || "Network error." };
  }
}

/**
 * @swagger /api/graduation/{id} (GET)
 * Get graduation list by ID
 */
export async function getGraduationList(id: string): Promise<SuccessResponse<GraduationListDetail> | ErrorResponse> {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Authentication required." };

    const response = await fetch(`${API_BASE_URL}/api/graduation/${id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    });

    const result = await handleApiResponse(response);
    if (result.error) return { error: result.error };
    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("getGraduationList failed:", error);
    return { error: error.message || "Network error." };
  }
}

/**
 * @swagger /api/graduation/export (POST)
 * Export graduation list to CSV file
 */
export async function exportGraduationList(
  graduationListId: string,
  includeHeaders = true
): Promise<{ success: true; blob: Blob; contentType: string; filename: string } | ErrorResponse> {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Authentication required." };

    const response = await fetch(`${API_BASE_URL}/api/graduation/export`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ graduationListId, includeHeaders }),
      cache: "no-store",
    });

    const result = await handleApiResponse(response);
    if (result.error) return { error: result.error };
    
    if (result.success && result.blob) {
      // Extract filename from Content-Disposition header if available
      const disposition = response.headers.get('Content-Disposition');
      let filename = `graduation_list_${graduationListId}.csv`;
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      return { success: true, blob: result.blob, contentType: result.contentType!, filename };
    }
    return { error: "Failed to get CSV blob from response."};
  } catch (error: any) {
    console.error("exportGraduationList failed:", error);
    return { error: error.message || "Network error." };
  }
}

/**
 * @swagger /api/graduation/entries/{id} (PUT)
 * Update graduation entry
 */
export async function updateGraduationEntry(
  id: string,
  entryData: UpdateGraduationEntryPayload
): Promise<SuccessResponse<{ message: string; entry: GraduationEntry }> | ErrorResponse> {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Authentication required." };

    const response = await fetch(`${API_BASE_URL}/api/graduation/entries/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(entryData),
      cache: "no-store",
    });

    const result = await handleApiResponse(response);
    if (result.error) return { error: result.error, details: result.details };
    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("updateGraduationEntry failed:", error);
    return { error: error.message || "Network error." };
  }
}

/**
 * @swagger /api/graduation/entries/{id} (DELETE)
 * Delete graduation entry
 */
export async function deleteGraduationEntry(id: string): Promise<SuccessMessageResponse | ErrorResponse> {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Authentication required." };

    const response = await fetch(`${API_BASE_URL}/api/graduation/entries/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }, // Content-Type not usually needed for DELETE with no body
      cache: "no-store",
    });

    const result = await handleApiResponse(response);
    if (result.error) return { error: result.error };
    // Ensure result.data exists and has a message property
    const message = result.data?.message || "Entry deleted successfully.";
    return { success: true, message };
  } catch (error: any) {
    console.error("deleteGraduationEntry failed:", error);
    return { error: error.message || "Network error." };
  }
}

/**
 * @swagger /api/graduation/entries/validate (POST)
 * Validate graduation entry fields
 */
export async function validateGraduationEntryFields(
  payload: ValidateGraduationEntryFieldsRequest
): Promise<SuccessResponse<ValidateGraduationEntryFieldsResponse> | ErrorResponse> {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Authentication required." };

    const response = await fetch(`${API_BASE_URL}/api/graduation/entries/validate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const result = await handleApiResponse(response);
    if (result.error) return { error: result.error, details: result.details };
    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("validateGraduationEntryFields failed:", error);
    return { error: error.message || "Network error." };
  }
}

/**
 * @swagger /api/graduation/approve/{graduationListId} (POST)
 * Approve graduation list
 */
export async function approveGraduationList(
  graduationListId: string
): Promise<SuccessMessageResponse | ApproveGraduationListErrorResponse> {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Authentication required." };

    const response = await fetch(`${API_BASE_URL}/api/graduation/approve/${graduationListId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }, // Content-Type not strictly needed if no body
      cache: "no-store",
    });

    const result = await handleApiResponse(response);
    if (result.error) {
      return { error: result.error, details: result.details };
    }
    // Ensure result.data exists and has a message property
    const message = result.data?.message || "List approved successfully.";
    return { success: true, message };
  } catch (error: any) {
    console.error("approveGraduationList failed:", error);
    return { error: error.message || "Network error." };
  }
}

/**
 * @swagger /api/graduation/{id}/cover-letter (GET)
 * Get cover letter data for graduation entry auto-fill
 */
export async function getCoverLetterData(entryId: string): Promise<SuccessResponse<CoverLetterData> | ErrorResponse> {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Authentication required." };

    const response = await fetch(`${API_BASE_URL}/api/graduation/${entryId}/cover-letter`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    });

    const result = await handleApiResponse(response);
    if (result.error) return { error: result.error };
    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("getCoverLetterData failed:", error);
    return { error: error.message || "Network error." };
  }
}

/**
 * @swagger /api/graduation/{id}/cover-letter (POST)
 * Generate cover letter and complete graduation process
 */
export async function generateCoverLetter(
  entryId: string,
  payload: GenerateCoverLetterRequest
): Promise<SuccessResponse<CoverLetterResponseData> | ErrorResponse> {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Authentication required." };

    const response = await fetch(`${API_BASE_URL}/api/graduation/${entryId}/cover-letter`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    
    const result = await handleApiResponse(response);
    if (result.error) return { error: result.error, details: result.details };
    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("generateCoverLetter failed:", error);
    return { error: error.message || "Network error." };
  }
}

/**
 * @swagger /api/graduation/graduation-rankings/{id} (GET)
 * Get graduation rankings list
 */
export async function getGraduationRankings(graduationListId: string): Promise<SuccessResponse<GraduationRankingItem[]> | ErrorResponse> {
  // Swagger path is /api/graduation/graduation-rankings/{id} where id is Graduation list ID
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Authentication required." };

    const response = await fetch(`${API_BASE_URL}/api/graduation/graduation-rankings/${graduationListId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    });

    const result = await handleApiResponse(response);
    if (result.error) return { error: result.error };
    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("getGraduationRankings failed:", error);
    return { error: error.message || "Network error." };
  }
}

/**
 * @swagger /api/graduation/approved-applications (GET)
 * Get all applications approved by advisor
 */
export async function getApprovedApplications(): Promise<SuccessResponse<ApprovedApplicationsResponseData> | ErrorResponse> {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Authentication required." };

    const response = await fetch(`${API_BASE_URL}/api/graduation/approved-applications`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    });

    const result = await handleApiResponse(response);
    if (result.error) return { error: result.error };
    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("getApprovedApplications failed:", error);
    return { error: error.message || "Network error." };
  }
}

/**
 * @swagger /api/graduation/map-application-to-graduation-entry (POST)
 * Map single approved application to graduation entry
 */
export async function mapApplicationToGraduationEntry(
  payload: MapApplicationToEntryRequest
): Promise<SuccessResponse<MapApplicationToEntryResponseData> | ErrorResponse> {
  try {
    const token = await getAuthToken();
    if (!token) return { error: "Authentication required." };

    const response = await fetch(`${API_BASE_URL}/api/graduation/map-application-to-graduation-entry`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const result = await handleApiResponse(response);
    if (result.error) return { error: result.error, details: result.details };
    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("mapApplicationToGraduationEntry failed:", error);
    return { error: error.message || "Network error." };
  }
}
