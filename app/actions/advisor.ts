"use server"

import { getAuthToken } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.iyte-gms.com"

// Types based on backend DTOs
export type ApplicationStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "RETURNED_FOR_REVISION"

export interface GraduationApplication {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  submissionDate: string
  status: ApplicationStatus
  advisorId?: string
  reviewDate?: string
  feedback?: string
  // Add other fields as needed based on your backend DTO
}

export interface ApplicationReview {
  applicationId: string
  advisorId: string
  status: ApplicationStatus
  feedback?: string
}

export interface ApplicationsResponse {
  applications: GraduationApplication[]
  total: number
}

// Get all pending applications
export async function getPendingApplications() {
  try {
    const token = await getAuthToken()

    if (!token) {
      return { error: "Authentication required. Please log in again." }
    }

    const response = await fetch(`${API_BASE_URL}/api/advisor/graduation-applications/pending`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { error: "Authentication failed. Please log in again." }
      } else if (response.status === 403) {
        return { error: "You don't have permission to access this resource." }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.message || "Failed to fetch pending applications." }
      }
    }

    const data: ApplicationsResponse = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Failed to fetch pending applications:", error)
    return { error: "Network error. Please check your connection and try again." }
  }
}

// Get applications by status
export async function getApplicationsByStatus(status: ApplicationStatus) {
  try {
    const token = await getAuthToken()

    if (!token) {
      return { error: "Authentication required. Please log in again." }
    }

    const response = await fetch(`${API_BASE_URL}/api/advisor/graduation-applications/status/${status}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { error: "Authentication failed. Please log in again." }
      } else if (response.status === 403) {
        return { error: "You don't have permission to access this resource." }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.message || `Failed to fetch ${status.toLowerCase()} applications.` }
      }
    }

    const data: ApplicationsResponse = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error(`Failed to fetch ${status} applications:`, error)
    return { error: "Network error. Please check your connection and try again." }
  }
}

// Get application details
export async function getApplicationDetails(applicationId: string) {
  try {
    const token = await getAuthToken()

    if (!token) {
      return { error: "Authentication required. Please log in again." }
    }

    const response = await fetch(`${API_BASE_URL}/api/advisor/graduation-applications/${applicationId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { error: "Authentication failed. Please log in again." }
      } else if (response.status === 403) {
        return { error: "You don't have permission to access this resource." }
      } else if (response.status === 404) {
        return { error: "Application not found." }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.message || "Failed to fetch application details." }
      }
    }

    const data: GraduationApplication = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Failed to fetch application details:", error)
    return { error: "Network error. Please check your connection and try again." }
  }
}

// Review application (approve/reject/return for revision)
export async function reviewApplication(reviewData: ApplicationReview) {
  try {
    const token = await getAuthToken()

    if (!token) {
      return { error: "Authentication required. Please log in again." }
    }

    const response = await fetch(`${API_BASE_URL}/api/advisor/graduation-applications/review`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { error: "Authentication failed. Please log in again." }
      } else if (response.status === 403) {
        return { error: "You don't have permission to review applications." }
      } else if (response.status === 404) {
        return { error: "Application not found." }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.message || "Failed to review application." }
      }
    }

    const data = await response.json()
    return {
      success: true,
      message: data.message || "Application reviewed successfully.",
      application: data.application,
    }
  } catch (error) {
    console.error("Failed to review application:", error)
    return { error: "Network error. Please check your connection and try again." }
  }
}
