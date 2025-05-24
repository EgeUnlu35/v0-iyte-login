"use server"

import { getAuthToken } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.iyte-gms.com"

export async function uploadCSV(formData: FormData) {
  try {
    // Get the authentication token
    const token = await getAuthToken()

    if (!token) {
      return { error: "Authentication required. Please log in again." }
    }

    // Get the file from form data
    const file = formData.get("csvFile") as File

    if (!file) {
      return { error: "Please select a CSV file to upload." }
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      return { error: "Please select a valid CSV file." }
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      return { error: "File size must be less than 10MB." }
    }

    // Create FormData for the API request
    const apiFormData = new FormData()
    apiFormData.append("csvFile", file)

    console.log("Uploading CSV file:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })

    // Make API request to upload CSV
    const response = await fetch(`${API_BASE_URL}/api/admin/upload-allowed-users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: apiFormData,
    })

    // Handle API response
    if (!response.ok) {
      if (response.status === 401) {
        return { error: "Authentication failed. Please log in again." }
      } else if (response.status === 403) {
        return { error: "You don't have permission to upload files." }
      } else if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.message || "Invalid file format or content." }
      } else if (response.status >= 500) {
        return { error: "Server error. Please try again later." }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { error: errorData.message || "Upload failed. Please try again." }
      }
    }

    // Parse successful response
    const result = await response.json()

    console.log("CSV upload successful:", result)

    return {
      success: true,
      message: result.message || "CSV file uploaded successfully!",
      data: result.data || null,
    }
  } catch (error) {
    console.error("CSV upload failed:", error)
    return { error: "Network error. Please check your connection and try again." }
  }
}
