"use server"

import { getAuthToken } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.iyte-gms.com"
const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000"

// Types based on backend DTOs
export type ApplicationStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "RETURNED_FOR_REVISION"

export interface GraduationApplicationSubmit {
  gpaOverall: number
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
  agno?: string
  total_credit?: number
  missing_courses?: string[]
  reason?: string
  message?: string
}

// Submit graduation application
export async function submitGraduationApplication(applicationData: GraduationApplicationSubmit) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return { error: "Authentication required. Please log in again." }
    }

    const response = await fetch(`${API_BASE_URL}/api/student/graduation-applications`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(applicationData),
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { error: "Authentication failed. Please log in again." }
      } else if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.message || "Invalid application data." }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.message || "Failed to submit application." }
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Failed to submit graduation application:", error)
    return { error: "Network error. Please check your connection and try again." }
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

// Upload transcript to Python API
export async function uploadTranscript(formData: FormData) {
  try {
    const response = await fetch(`${PYTHON_API_URL}/transcript`, {
      method: "POST",
      body: formData,
      cache: "no-store",
    })

    if (!response.ok) {
      return { error: "Failed to upload transcript. Please try again." }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Failed to upload transcript:", error)
    return { error: "Network error. Please check your connection and try again." }
  }
}

// Upload curriculum to Python API
export async function uploadCurriculum(formData: FormData) {
  try {
    const response = await fetch(`${PYTHON_API_URL}/curriculum`, {
      method: "POST",
      body: formData,
      cache: "no-store",
    })

    if (!response.ok) {
      return { error: "Failed to upload curriculum. Please try again." }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Failed to upload curriculum:", error)
    return { error: "Network error. Please check your connection and try again." }
  }
}

// Validate transcript against curriculum
export async function validateTranscript() {
  try {
    const response = await fetch(`${PYTHON_API_URL}/validate`, {
      method: "GET",
      cache: "no-store",
    })

    if (!response.ok) {
      return { error: "Failed to validate transcript. Please try again." }
    }

    const data: TranscriptValidationResult = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Failed to validate transcript:", error)
    return { error: "Network error. Please check your connection and try again." }
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
