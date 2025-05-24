"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, File, CheckCircle, AlertCircle, X } from "lucide-react"

interface CSVUploadFormProps {
  uploadAction: (formData: FormData) => Promise<{
    success?: boolean
    error?: string
    message?: string
    data?: any
  }>
}

export default function CSVUploadForm({ uploadAction }: CSVUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setUploadResult({
          type: "error",
          message: "Please select a valid CSV file.",
        })
        return
      }

      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        setUploadResult({
          type: "error",
          message: "File size must be less than 10MB.",
        })
        return
      }

      setSelectedFile(file)
      setUploadResult({ type: null, message: "" })
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setUploadResult({ type: null, message: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedFile) {
      setUploadResult({
        type: "error",
        message: "Please select a CSV file to upload.",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadResult({ type: null, message: "" })

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const formData = new FormData()
      formData.append("csvFile", selectedFile)

      const result = await uploadAction(formData)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result.success) {
        setUploadResult({
          type: "success",
          message: result.message || "CSV file uploaded successfully!",
        })
        // Clear the form after successful upload
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        setUploadResult({
          type: "error",
          message: result.error || "Upload failed. Please try again.",
        })
      }
    } catch (error) {
      clearInterval(progressInterval)
      setUploadResult({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      })
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Input */}
      <div className="space-y-2">
        <Label htmlFor="csvFile">Select CSV File</Label>
        <div className="flex items-center gap-4">
          <Input
            ref={fileInputRef}
            id="csvFile"
            name="csvFile"
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="shrink-0"
          >
            <Upload className="w-4 h-4 mr-2" />
            Browse
          </Button>
        </div>
      </div>

      {/* Selected File Display */}
      {selectedFile && (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-3">
            <File className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-medium text-sm">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={handleRemoveFile} disabled={isUploading}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* Upload Result */}
      {uploadResult.type && (
        <Alert
          className={uploadResult.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
        >
          {uploadResult.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={uploadResult.type === "success" ? "text-green-800" : "text-red-800"}>
            {uploadResult.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={!selectedFile || isUploading} className="w-full">
        {isUploading ? (
          <>
            <Upload className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload CSV File
          </>
        )}
      </Button>
    </form>
  )
}
