"use server"

import { getAuthToken } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.iyte-gms.com"

// Types based on backend DTOs
export type GraduationStatus = "NEW" | "UNDER_REVIEW" | "PENDING_ISSUES" | "APPROVED" | "REJECTED" | "COMPLETED"

export interface GraduationList {
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
  status: GraduationStatus
  notes?: string
}

export interface GraduationListDetail {
  id: string
  name: string
  description: string
  createdAt: string
  entries: GraduationEntry[]
}

export interface ValidationError {
  field: string
  message: string
}

export interface UpdateGraduationEntry {
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

// Create graduation list from CSV
export async function createGraduationList(formData: FormData) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return { error: "Authentication required. Please log in again." }
    }

    const response = await fetch(`${API_BASE_URL}/api/graduation`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { error: "Authentication failed. Please log in again." }
      } else if (response.status === 403) {
        return { error: "You don't have permission to create graduation lists." }
      } else if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}))
        return {
          error: errorData.message || "Invalid CSV data.",
          validationResults: errorData.validationResults,
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.message || "Failed to create graduation list." }
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Failed to create graduation list:", error)
    return { error: "Network error. Please check your connection and try again." }
  }
}

// Get all graduation lists
export async function getAllGraduationLists() {
  try {
    const token = await getAuthToken()
    if (!token) {
      return { error: "Authentication required. Please log in again." }
    }

    const response = await fetch(`${API_BASE_URL}/api/graduation`, {
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
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.message || "Failed to fetch graduation lists." }
      }
    }

    const data: GraduationList[] = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Failed to fetch graduation lists:", error)
    return { error: "Network error. Please check your connection and try again." }
  }
}

// Get graduation list by ID
export async function getGraduationList(id: string) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return { error: "Authentication required. Please log in again." }
    }

    const response = await fetch(`${API_BASE_URL}/api/graduation/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 404) {
        return { error: "Graduation list not found." }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.message || "Failed to fetch graduation list." }
      }
    }

    const data: GraduationListDetail = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Failed to fetch graduation list:", error)
    return { error: "Network error. Please check your connection and try again." }
  }
}

// Export graduation list to CSV
export async function exportGraduationList(graduationListId: string, includeHeaders = true) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return { error: "Authentication required. Please log in again." }
    }

    const response = await fetch(`${API_BASE_URL}/api/graduation/export`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ graduationListId, includeHeaders }),
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 404) {
        return { error: "Graduation list not found." }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.message || "Failed to export graduation list." }
      }
    }

    // Handle CSV download
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `graduation_list_${graduationListId}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    return { success: true, message: "Graduation list exported successfully." }
  } catch (error) {
    console.error("Failed to export graduation list:", error)
    return { error: "Network error. Please check your connection and try again." }
  }
}

// Update graduation entry
export async function updateGraduationEntry(id: string, entryData: UpdateGraduationEntry) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return { error: "Authentication required. Please log in again." }
    }

    const response = await fetch(`${API_BASE_URL}/api/graduation/entries/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entryData),
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 404) {
        return { error: "Graduation entry not found." }
      } else if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.message || "Validation error." }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.message || "Failed to update graduation entry." }
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Failed to update graduation entry:", error)
    return { error: "Network error. Please check your connection and try again." }
  }
}

// Delete graduation entry
export async function deleteGraduationEntry(id: string) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return { error: "Authentication required. Please log in again." }
    }

    const response = await fetch(`${API_BASE_URL}/api/graduation/entries/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 404) {
        return { error: "Graduation entry not found." }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.message || "Failed to delete graduation entry." }
      }
    }

    const data = await response.json()
    return { success: true, message: data.message }
  } catch (error) {
    console.error("Failed to delete graduation entry:", error)
    return { error: "Network error. Please check your connection and try again." }
  }
}

// Approve graduation list
export async function approveGraduationList(graduationListId: string) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return { error: "Authentication required. Please log in again." }
    }

    const response = await fetch(`${API_BASE_URL}/api/graduation/approve/${graduationListId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 404) {
        return { error: "Graduation list not found." }
      } else if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}))
        return {
          error: errorData.message || "Cannot approve list due to validation errors.",
          invalidEntries: errorData.invalidEntries,
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.message || "Failed to approve graduation list." }
      }
    }

    const data = await response.json()
    return { success: true, message: data.message }
  } catch (error) {
    console.error("Failed to approve graduation list:", error)
    return { error: "Network error. Please check your connection and try again." }
  }
}

// Get graduation rankings
export async function getGraduationRankings(id: string) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return { error: "Authentication required. Please log in again." }
    }

    const response = await fetch(`${API_BASE_URL}/api/graduation/graduation-rankings/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { error: errorData.message || "Failed to fetch graduation rankings." }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Failed to fetch graduation rankings:", error)
    return { error: "Network error. Please check your connection and try again." }
  }
}

// Generate cover letter
export async function generateCoverLetter(entryId: string, notes: string) {
  try {
    const token = await getAuthToken()
    if (!token) {
      return { error: "Authentication required. Please log in again." }
    }

    const response = await fetch(`${API_BASE_URL}/api/graduation/${entryId}/cover-letter`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notes }),
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 404) {
        return { error: "Graduation entry not found." }
      } else if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.message || "Entry must be APPROVED to generate cover letter." }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.message || "Failed to generate cover letter." }
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error("Failed to generate cover letter:", error)
    return { error: "Network error. Please check your connection and try again." }
  }
}
