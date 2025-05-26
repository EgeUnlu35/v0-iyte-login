"use server"

import { getAuthToken } from "./auth"
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.iyte-gms.com"
const PYTHON_API_URL = "http://16.170.239.206:8000"
const MOCK_API_ENABLED = true; // Flag to enable/disable mock responses

// Types based on backend DTOs
export type ApplicationStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "RETURNED_FOR_REVISION"

export interface GraduationApplicationSubmit {
  studentId: string
  gpaOverall: number
  totalCredits: number
  departmentId: string
  departmentName: string
}

export interface GraduationApplication {
  id: string
  studentId: string
  studentName: string
  studentLastName: string
  gpaOverall: number
  departmentId: string
  departmentName: string
  status: ApplicationStatus
  submissionDate: string
  reviewDate?: string
  feedback?: string
}

export interface TranscriptValidationResult {
  valid: boolean
  missing_courses?: string[]
  reason?: string
}

// Type for successful transcript upload response
interface UploadTranscriptSuccessResponse {
  agno: string
  total_credit: number
  message: string
}

// Type for successful curriculum upload response
interface UploadCurriculumSuccessResponse {
  message: string
}

// Submit graduation application
export async function submitGraduationApplication(applicationData: GraduationApplicationSubmit) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return { error: "Authentication required. Please log in again." }
    }

    // Log the application data being sent
    console.log("Submitting Graduation Application with data:", applicationData)

    const response = await fetch(`${API_BASE_URL}/api/student/graduation-applications/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(applicationData),
      cache: "no-store",
    })

    if (!response.ok) {
      // Enhanced error logging
      console.error(`API Error: Status Code ${response.status} ${response.statusText}`);
      const responseHeaders: { [key: string]: string } = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.error("API Error Headers:", JSON.stringify(responseHeaders, null, 2));

      const responseText = await response.text(); // Get raw response text
      console.error("API Raw Error Response Text:", responseText);

      let errorData: any = { message: `Server returned status ${response.status}. See raw text above.` };
      try {
        // Attempt to parse if content-type suggests JSON, or just try anyway
        if (responseText && (responseHeaders['content-type']?.includes('application/json') || responseText.startsWith('{') || responseText.startsWith('['))) {
          errorData = JSON.parse(responseText);
        } else {
          // If not JSON-like, use a more informative message based on raw text
          errorData = { message: `Server returned status ${response.status}. Response was not JSON. Body (first 200 chars): ${responseText.substring(0,200)}` };
        }
      } catch (e) {
        console.error("Failed to parse API error response as JSON, even after checking content-type. Raw text logged above.", e);
        errorData = { message: `Server returned status ${response.status}. Response was not valid JSON. Raw text (first 200 chars): ${responseText.substring(0,200)}` };
      }
      
      console.error("API Parsed/Fallback Error Data:", errorData);

      if (response.status === 401) {
        return { error: "Authentication failed. Please log in again." }
      } else if (response.status === 400) {
        return { error: errorData.message || errorData.detail || "Invalid application data. Please check your inputs." }
      } else {
        return { error: errorData.message || errorData.detail || `Failed to submit application. Status: ${response.status}.` }
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Failed to submit graduation application (Network or other client-side error):", error)
    // Check if it's a TypeError, which can happen with network issues before fetch even completes
    if (error instanceof TypeError) {
        return { error: `Network error: ${error.message}. Please check your connection and API endpoint.` };
    }
    return { error: "Network error or client-side issue. Please check your connection and try again." }
  }
}

// Get current student's application
export async function getMyApplication() {
  try {
    const token = await getAuthToken()
    if (!token) {
      return { error: "Authentication required. Please log in again." }
    }

    const response = await fetch(`${API_BASE_URL}/api/student/graduation-applications/my-application`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 404) {
        return { error: "No application found. Please submit your graduation application first." }
      } else if (response.status === 401) {
        return { error: "Authentication failed. Please log in again." }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.message || "Failed to fetch application." }
      }
    }

    const data: GraduationApplication = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Failed to fetch application:", error)
    return { error: "Network error. Please check your connection and try again." }
  }
}

// Mocked Upload transcript to Python API
export async function uploadTranscript(formData: FormData): Promise<{ success: boolean; data?: UploadTranscriptSuccessResponse; error?: string }> {
  console.log("[Mock Action] Attempting to upload transcript...");
  if (MOCK_API_ENABLED) {
    console.log("[Mock Action] Returning MOCK response for /transcript");
    // Simulate a short delay
    await new Promise(resolve => setTimeout(resolve, 500)); 
    return {
      success: true,
      data: {
        agno: "3.64",
        total_credit: 136,
        message: "Transcript has been uploaded successfully. (Mocked)"
      }
    };
  }
  // Original axios implementation (can be kept for when MOCK_API_ENABLED is false)
  console.log("[Action] Attempting to upload transcript using AXIOS...");
  try {
    const response = await axios.post(`${PYTHON_API_URL}/transcript`, formData, {
      headers: {},
      timeout: 30000,
    });
    console.log("[Action AXIOS] Response status:", response.status);
    console.log("[Action AXIOS] Response data:", response.data);
    return { success: true, data: response.data as UploadTranscriptSuccessResponse };
  } catch (error: any) {
    console.error("[Action AXIOS] Error during transcript upload:", error.isAxiosError ? error.toJSON() : error);
    let errorMessage = "Network error during transcript upload with axios.";
    if (error.response) errorMessage = `Server responded with ${error.response.status}. Data: ${JSON.stringify(error.response.data)}`;
    else if (error.request) errorMessage = "No response received from server (axios).";
    else if (error.code === 'ECONNABORTED') errorMessage = "Request timed out (axios)."
    return { success: false, error: errorMessage };
  }
}

// Mocked Upload curriculum to Python API
export async function uploadCurriculum(formData: FormData): Promise<{ success: boolean; data?: UploadCurriculumSuccessResponse; error?: string }> {
  console.log("[Mock Action] Attempting to upload curriculum...");
  if (MOCK_API_ENABLED) {
    console.log("[Mock Action] Returning MOCK response for /curriculum");
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: {
        message: "Curriculum has been uploaded successfully. (Mocked)"
      }
    };
  }
  // Original fetch implementation (can be kept)
  try {
    const response = await fetch(`${PYTHON_API_URL}/curriculum`, {
      method: "POST",
      body: formData,
      cache: "no-store",
    })

    const data = await response.json()

    if (!response.ok) {
      // Try to use error message from API if available
      return { success: false, error: data.message || data.detail || "Failed to upload curriculum. Please try again." }
    }

    return { success: true, data: data as UploadCurriculumSuccessResponse }
  } catch (error) {
    console.error("Failed to upload curriculum:", error)
    return { success: false, error: "Network error. Please check your connection and try again." }
  }
}

// Mocked Validate transcript against curriculum
export async function validateTranscript(): Promise<{ success: boolean; data?: TranscriptValidationResult; error?: string }> {
  console.log("[Mock Action] Attempting to validate documents...");
  if (MOCK_API_ENABLED) {
    console.log("[Mock Action] Returning MOCK response for /validate");
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: {
        valid: true,
        missing_courses: ["CENG506 (Mocked)"],
        reason: "Mock validation: Success with one missing course for testing."
      }
    };
  }
  // Original fetch implementation (can be kept)
  try {
    const response = await fetch(`${PYTHON_API_URL}/validate`, { method: "GET", cache: "no-store" })
    const data = await response.json()
    if (!response.ok) return { success: false, error: data.reason || data.detail || "Failed to validate transcript." }
    return { success: true, data: data as TranscriptValidationResult }
  } catch (error) {
    console.error("Failed to validate transcript:", error)
    return { success: false, error: "Network error. Please check your connection and try again." }
  }
}

// Store transcript validation result in main database (optional)
export async function saveTranscriptValidation(validationResult: TranscriptValidationResult) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return { error: "Authentication required. Please log in again." }
    }

    // This would be a new endpoint in your main API to store validation results
    const response = await fetch(`${API_BASE_URL}/api/student/transcript-validation`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validationResult),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { error: errorData.message || "Failed to save validation result." }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Failed to save validation result:", error)
    return { error: "Network error. Please check your connection and try again." }
  }
}