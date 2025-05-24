"use client"

import Image from "next/image"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
  AlertCircle,
  Upload,
  FileCheck,
  XCircle,
} from "lucide-react"
import { logout } from "@/app/actions/auth"
import {
  submitGraduationApplication,
  uploadTranscript,
  uploadCurriculum,
  validateTranscript,
  type GraduationApplication,
  type TranscriptValidationResult,
} from "@/app/actions/student"

interface StudentClientLayoutProps {
  userName: string
  application?: GraduationApplication | null
  applicationError?: string | null
}

export default function StudentClientLayout({ userName, application, applicationError }: StudentClientLayoutProps) {
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [showTranscriptUpload, setShowTranscriptUpload] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transcriptResult, setTranscriptResult] = useState<any>(null)
  const [curriculumUploaded, setCurriculumUploaded] = useState(false)
  const [validationResult, setValidationResult] = useState<TranscriptValidationResult | null>(null)

  const transcriptInputRef = useRef<HTMLInputElement>(null)
  const curriculumInputRef = useRef<HTMLInputElement>(null)

  const handleSubmitApplication = async (formData: FormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const applicationData = {
        gpaOverall: Number.parseFloat(formData.get("gpaOverall") as string),
        departmentId: formData.get("departmentId") as string,
        departmentName: formData.get("departmentName") as string,
      }

      const result = await submitGraduationApplication(applicationData)

      if (result.success) {
        alert("Graduation application submitted successfully!")
        setShowApplicationForm(false)
        window.location.reload()
      } else {
        setError(result.error || "Failed to submit application")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUploadTranscript = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadTranscript(formData)

      if (result.success) {
        setTranscriptResult(result.data)
        alert(`Transcript uploaded successfully! AGNO: ${result.data.agno}, Credits: ${result.data.total_credit}`)
      } else {
        setError(result.error || "Failed to upload transcript")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  const handleUploadCurriculum = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadCurriculum(formData)

      if (result.success) {
        setCurriculumUploaded(true)
        alert("Curriculum uploaded successfully!")
      } else {
        setError(result.error || "Failed to upload curriculum")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  const handleValidateTranscript = async () => {
    setIsValidating(true)
    setError(null)

    try {
      const result = await validateTranscript()

      if (result.success) {
        setValidationResult(result.data)
        if (result.data.valid) {
          alert("Transcript validation successful! All requirements met.")
        } else {
          alert(`Validation failed: ${result.data.reason}`)
        }
      } else {
        setError(result.error || "Failed to validate transcript")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsValidating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      UNDER_REVIEW: { color: "bg-blue-100 text-blue-800", text: "Under Review" },
      APPROVED: { color: "bg-green-100 text-green-800", text: "Approved" },
      REJECTED: { color: "bg-red-100 text-red-800", text: "Rejected" },
      RETURNED_FOR_REVISION: { color: "bg-orange-100 text-orange-800", text: "Needs Revision" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return <Badge className={config.color}>{config.text}</Badge>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-[#990000] text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Image
              src="/images/iyte-logo.png"
              alt="IYTE Logo"
              width={40}
              height={40}
              className="rounded-full hidden sm:block"
            />
            <h1 className="text-xl font-bold">Student Portal</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">Welcome, {userName}</span>
          <form action={logout}>
            <Button variant="outline" className="text-white bg-[#990000] border-white hover:bg-white/10" type="submit">
              Logout
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Student Portal</h2>
          <p className="text-gray-600">Track your graduation progress and manage requirements</p>
        </div>

        {/* Error Alert */}
        {(error || applicationError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || applicationError}</AlertDescription>
          </Alert>
        )}

        {/* Graduation Application Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Graduation Application
              </CardTitle>
              <CardDescription>Your graduation application status and details</CardDescription>
            </CardHeader>
            <CardContent>
              {application ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    {getStatusBadge(application.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">GPA:</span>
                      <span className="font-medium ml-2">{application.gpaOverall}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium ml-2">{application.departmentName}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Submitted:</span>
                      <span className="font-medium ml-2">
                        {new Date(application.submissionDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {application.feedback && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Feedback:</p>
                      <p className="text-sm">{application.feedback}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <GraduationCap className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Application Submitted</h3>
                  <p className="text-gray-500 mb-4">Submit your graduation application to begin the process.</p>
                  <Button onClick={() => setShowApplicationForm(true)}>Submit Application</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transcript Validation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                Transcript Validation
              </CardTitle>
              <CardDescription>Upload and validate your transcript</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!transcriptResult && (
                  <div>
                    <Label htmlFor="transcript">Upload Transcript (PDF)</Label>
                    <Input
                      ref={transcriptInputRef}
                      id="transcript"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleUploadTranscript(file)
                      }}
                      disabled={isUploading}
                    />
                  </div>
                )}

                {transcriptResult && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-green-800">Transcript Uploaded</span>
                    </div>
                    <div className="text-sm text-green-700">
                      <p>AGNO: {transcriptResult.agno}</p>
                      <p>Total Credits: {transcriptResult.total_credit}</p>
                    </div>
                  </div>
                )}

                {!curriculumUploaded && (
                  <div>
                    <Label htmlFor="curriculum">Upload Curriculum (PDF)</Label>
                    <Input
                      ref={curriculumInputRef}
                      id="curriculum"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleUploadCurriculum(file)
                      }}
                      disabled={isUploading}
                    />
                  </div>
                )}

                {curriculumUploaded && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-green-800">Curriculum Uploaded</span>
                    </div>
                  </div>
                )}

                {transcriptResult && curriculumUploaded && !validationResult && (
                  <Button onClick={handleValidateTranscript} disabled={isValidating} className="w-full">
                    {isValidating ? "Validating..." : "Validate Transcript"}
                  </Button>
                )}

                {validationResult && (
                  <div className={`p-3 rounded-lg ${validationResult.valid ? "bg-green-50" : "bg-red-50"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {validationResult.valid ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`font-medium ${validationResult.valid ? "text-green-800" : "text-red-800"}`}>
                        {validationResult.valid ? "Validation Successful" : "Validation Failed"}
                      </span>
                    </div>
                    {!validationResult.valid && (
                      <div className="text-sm text-red-700">
                        <p>Reason: {validationResult.reason}</p>
                        {validationResult.missing_courses && validationResult.missing_courses.length > 0 && (
                          <div className="mt-2">
                            <p>Missing courses:</p>
                            <ul className="list-disc list-inside">
                              {validationResult.missing_courses.map((course, index) => (
                                <li key={index}>{course}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Form Modal */}
        {showApplicationForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Submit Graduation Application</CardTitle>
              <CardDescription>Fill in your graduation application details</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  handleSubmitApplication(formData)
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="gpaOverall">Overall GPA</Label>
                  <Input
                    id="gpaOverall"
                    name="gpaOverall"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    required
                    placeholder="3.45"
                  />
                </div>
                <div>
                  <Label htmlFor="departmentId">Department ID</Label>
                  <Input id="departmentId" name="departmentId" required placeholder="CENG" />
                </div>
                <div>
                  <Label htmlFor="departmentName">Department Name</Label>
                  <Input id="departmentName" name="departmentName" required placeholder="Computer Engineering" />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowApplicationForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setShowTranscriptUpload(true)}
          >
            <CardContent className="p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-3 text-blue-500" />
              <h3 className="font-medium mb-2">Upload Documents</h3>
              <p className="text-sm text-gray-600">Upload transcript & curriculum</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-3 text-green-500" />
              <h3 className="font-medium mb-2">Course Requirements</h3>
              <p className="text-sm text-gray-600">View remaining courses</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-3 text-orange-500" />
              <h3 className="font-medium mb-2">Application Status</h3>
              <p className="text-sm text-gray-600">Track your progress</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 mx-auto mb-3 text-purple-500" />
              <h3 className="font-medium mb-2">Documents</h3>
              <p className="text-sm text-gray-600">Manage your files</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-[#990000] text-white py-4 px-6 text-center">
        <p>© {new Date().getFullYear()} IYTE Graduation Management System. All rights reserved.</p>
      </footer>
    </div>
  )
}
