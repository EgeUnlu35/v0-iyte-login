"use client"

import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  FileText,
  GraduationCap,
  Upload,
  Loader2,
  Info,
  ChevronRight,
  ShieldCheck,
  AlertTriangleIcon,
  RotateCcw,
} from "lucide-react"
import { logout } from "@/app/actions/auth"
import {
  submitGraduationApplication,
  uploadTranscript,
  validateTranscript,
  isTranscriptReady,
  getStoredTranscriptData,
  getStoredValidationData,
  getStoredTranscriptFile,
  clearStoredData,
  type GraduationApplication,
  type TranscriptValidationResult,
} from "@/app/actions/student"

interface UploadTranscriptSuccessResponse {
  agno: string
  total_credit: number
  message: string
}

interface StudentClientLayoutProps {
  userName: string
  application?: GraduationApplication | null
  applicationError?: string | null
}

// Enum for application steps
enum ApplicationStep {
  UploadTranscript = 1,
  ValidateDocuments = 2,
  FillApplication = 3,
  Submitted = 4,
}

export default function StudentClientLayout({ userName, application, applicationError }: StudentClientLayoutProps) {
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(applicationError || null)

  const [selectedTranscriptFile, setSelectedTranscriptFile] = useState<File | null>(null)

  const [transcriptUploadData, setTranscriptUploadData] = useState<UploadTranscriptSuccessResponse | null>(null)
  const [validationResult, setValidationResult] = useState<TranscriptValidationResult | null>(null)

  const [gpaForApplicationForm, setGpaForApplicationForm] = useState("")
  const [totalCreditsForApplicationForm, setTotalCreditsForApplicationForm] = useState("")

  const transcriptInputRef = useRef<HTMLInputElement>(null)

  // State for current step in the application process
  const [currentStep, setCurrentStep] = useState<ApplicationStep>(ApplicationStep.UploadTranscript)

  // Load stored data on component mount
  useEffect(() => {
    const loadStoredData = async () => {
      const storedTranscript = await getStoredTranscriptData()
      const storedValidation = await getStoredValidationData()

      if (storedTranscript) {
        setTranscriptUploadData(storedTranscript)
        setGpaForApplicationForm(storedTranscript.agno)
        setTotalCreditsForApplicationForm(storedTranscript.total_credit.toString())
        setCurrentStep(ApplicationStep.ValidateDocuments)
      }

      if (storedValidation) {
        setValidationResult(storedValidation)
        if (storedValidation.valid) {
          setCurrentStep(ApplicationStep.FillApplication)
        }
      }
    }

    loadStoredData()
  }, [])

  const resetApplicationProcess = async () => {
    setCurrentStep(ApplicationStep.UploadTranscript)
    setSelectedTranscriptFile(null)
    setTranscriptUploadData(null)
    setValidationResult(null)
    setGpaForApplicationForm("")
    setTotalCreditsForApplicationForm("")
    setError(null)
    if (transcriptInputRef.current) transcriptInputRef.current.value = ""

    // Clear stored data
    await clearStoredData()
  }

  const handleOpenApplicationForm = async () => {
    // Check if we have stored data
    const hasStoredData = await isTranscriptReady()
    if (hasStoredData) {
      const storedTranscript = await getStoredTranscriptData()
      const storedValidation = await getStoredValidationData()

      if (storedTranscript) {
        setTranscriptUploadData(storedTranscript)
        setGpaForApplicationForm(storedTranscript.agno)
        setTotalCreditsForApplicationForm(storedTranscript.total_credit.toString())
      }

      if (storedValidation) {
        setValidationResult(storedValidation)
        if (storedValidation.valid) {
          setCurrentStep(ApplicationStep.FillApplication)
        } else {
          setCurrentStep(ApplicationStep.ValidateDocuments)
        }
      } else {
        setCurrentStep(ApplicationStep.ValidateDocuments)
      }
    } else {
      await resetApplicationProcess()
    }

    setShowApplicationForm(true)
  }

  const handleSubmitApplication = async (formData: FormData) => {
    if (!transcriptUploadData || !validationResult?.valid) {
      setError("Please complete all previous steps, including successful document validation.")
      return
    }

    // Get the stored transcript file
    const storedFile = await getStoredTranscriptFile()
    if (!storedFile) {
      setError("Transcript file not found. Please upload transcript again.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const applicationData = {
        gpaOverall: Number.parseFloat(gpaForApplicationForm),
        totalCredits: Number.parseInt(totalCreditsForApplicationForm),
        departmentName: "CENG", // Auto-populate as requested
        transcriptFile: storedFile, // Include the transcript file
      }

      const result = await submitGraduationApplication(applicationData)
      if (result.success) {
        alert("Graduation application submitted successfully!")
        setShowApplicationForm(false)
        setCurrentStep(ApplicationStep.Submitted)

        // Clear stored data after successful submission
        await clearStoredData()

        window.location.reload()
      } else {
        setError(result.error || "Failed to submit application")
      }
    } catch (error) {
      setError("An unexpected error occurred during submission.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUploadTranscript = async (file: File) => {
    if (!file) return
    setIsUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadTranscript(formData)
      if (result.success && result.data) {
        setTranscriptUploadData(result.data)
        setGpaForApplicationForm(result.data.agno)
        setTotalCreditsForApplicationForm(result.data.total_credit.toString())
        alert(result.data.message)
        setSelectedTranscriptFile(null)
        if (transcriptInputRef.current) transcriptInputRef.current.value = ""
        setCurrentStep(ApplicationStep.ValidateDocuments)
      } else {
        setError(result.error || "Failed to upload transcript")
        setTranscriptUploadData(null)
      }
    } catch (error) {
      setError("An unexpected error occurred while uploading transcript")
      setTranscriptUploadData(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleValidateTranscript = async () => {
    if (!transcriptUploadData) {
      setError("Please upload transcript before validating.")
      return
    }
    setIsValidating(true)
    setError(null)
    try {
      const result = await validateTranscript()
      if (result.success && result.data) {
        setValidationResult(result.data)
        if (result.data.valid) {
          alert("Transcript validated successfully! You can now fill the application form.")
          setCurrentStep(ApplicationStep.FillApplication)
        } else {
          alert(`Validation Failed: ${result.data.reason || "Please review missing courses."}`)
        }
      } else {
        setError(result.error || "Failed to validate transcript.")
      }
    } catch (error) {
      setError("An unexpected error occurred during validation.")
    } finally {
      setIsValidating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      UNDER_REVIEW_BY_ADVISOR: {
        color: "bg-blue-100 text-blue-800",
        text: "Under Review by Advisor",
      },
      APPROVED_BY_ADVISOR: { color: "bg-green-100 text-green-800", text: "Approved by Advisor" },
      UNDER_REVIEW_BY_DEPSEC: {
        color: "bg-blue-100 text-blue-800",
        text: "Under Review by Department Secretary",
      },
      APPROVED_BY_DEPSEC: { color: "bg-green-100 text-green-800", text: "Approved by Department Secretary" },
      APPROVED: { color: "bg-green-100 text-green-800", text: "Approved" },
      REJECTED: { color: "bg-red-100 text-red-800", text: "Rejected" },
      RETURNED_FOR_REVISION: {
        color: "bg-orange-100 text-orange-800",
        text: "Needs Revision",
      },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return <Badge className={config.color}>{config.text}</Badge>
  }

  const renderStepIndicator = (step: ApplicationStep, label: string, currentActiveStep: ApplicationStep) => {
    const isActive = step === currentActiveStep
    const isCompleted = step < currentActiveStep
    return (
      <div
        className={`flex items-center p-2 rounded-md ${
          isActive ? "bg-blue-100" : isCompleted ? "bg-green-100" : "bg-gray-100"
        }`}
      >
        {isCompleted ? (
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
        ) : (
          <div
            className={`w-5 h-5 rounded-full border-2 ${
              isActive ? "border-blue-500 bg-blue-500" : "border-gray-400"
            } mr-2 flex items-center justify-center text-xs ${isActive ? "text-white" : ""}`}
          >
            {isCompleted ? "" : step}
          </div>
        )}
        <span
          className={`text-sm ${
            isActive ? "font-semibold text-blue-700" : isCompleted ? "text-green-700" : "text-gray-600"
          }`}
        >
          {label}
        </span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-[#990000] text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/placeholder.svg?height=40&width=40"
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

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!showApplicationForm && application && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Graduation Application Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <span className="text-gray-600">Total Credits:</span>
                  <span className="font-medium ml-2">{application.totalCredits}</span>
                </div>
                <div>
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium ml-2">{application.departmentName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Submitted:</span>
                  <span className="font-medium ml-2">{new Date(application.submissionDate).toLocaleDateString()}</span>
                </div>
              </div>
              {application.feedback && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Feedback:</p>
                  <p className="text-sm">{application.feedback}</p>
                </div>
              )}
              {application.missingCourses0 && (
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-600 mb-1">Missing Courses:</p>
                  <ul className="text-sm list-disc list-inside">
                    {application.missingCourses0 && <li>{application.missingCourses0}</li>}
                    {application.missingCourses1 && <li>{application.missingCourses1}</li>}
                    {application.missingCourses2 && <li>{application.missingCourses2}</li>}
                  </ul>
                </div>
              )}
              <p className="text-sm text-gray-500">
                Your application has been submitted. You will be notified of any updates.
              </p>
            </CardContent>
          </Card>
        )}

        {!showApplicationForm && application && application.status === "REJECTED" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <RotateCcw className="w-5 h-5 mr-2 text-orange-500" />
                Resubmit Application
              </CardTitle>
              <CardDescription>
                Your previous application was rejected. You can submit a new application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleOpenApplicationForm} className="w-full" variant="outline">
                <GraduationCap className="mr-2 h-4 w-4" />
                Submit New Application
              </Button>
            </CardContent>
          </Card>
        )}

        {!showApplicationForm && (!application || application.status === "REJECTED") && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="w-5 h-5 mr-2 text-blue-500" />
                Ready to Graduate?
              </CardTitle>
              <CardDescription>Complete the steps below to submit your graduation application.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleOpenApplicationForm} className="w-full">
                <GraduationCap className="mr-2 h-4 w-4" />
                {application?.status === "REJECTED" ? "Submit New Application" : "Start Graduation Application"}
              </Button>
            </CardContent>
          </Card>
        )}

        {showApplicationForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Submit Graduation Application</CardTitle>
              <CardDescription>Follow the steps to complete your application.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-around mb-6 p-2 bg-slate-50 rounded-lg">
                {renderStepIndicator(ApplicationStep.UploadTranscript, "Upload Transcript", currentStep)}
                <ChevronRight
                  className={`w-5 h-5 mx-1 self-center ${
                    currentStep > ApplicationStep.UploadTranscript ? "text-green-500" : "text-gray-300"
                  }`}
                />
                {renderStepIndicator(ApplicationStep.ValidateDocuments, "Validate Documents", currentStep)}
                <ChevronRight
                  className={`w-5 h-5 mx-1 self-center ${
                    currentStep > ApplicationStep.ValidateDocuments ? "text-green-500" : "text-gray-300"
                  }`}
                />
                {renderStepIndicator(ApplicationStep.FillApplication, "Application Form", currentStep)}
              </div>

              {currentStep === ApplicationStep.UploadTranscript && (
                <div className="space-y-4 p-4 border rounded-md">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Upload className="w-5 h-5 mr-2 text-blue-600" />
                    Step 1: Upload Transcript
                  </h3>
                  <p className="text-sm text-gray-600">
                    Upload your official transcript PDF. The system will analyze it and extract your GPA and credit
                    information, then compare it with the curriculum requirements.
                  </p>
                  <div>
                    <Label htmlFor="transcript">Transcript (PDF)</Label>
                    <Input
                      ref={transcriptInputRef}
                      id="transcript"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setSelectedTranscriptFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  {selectedTranscriptFile && (
                    <Button
                      onClick={() => handleUploadTranscript(selectedTranscriptFile)}
                      disabled={isUploading}
                      className="w-full"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading & Analyzing...
                        </>
                      ) : (
                        "Upload & Analyze Transcript"
                      )}
                    </Button>
                  )}
                </div>
              )}

              {currentStep === ApplicationStep.ValidateDocuments && (
                <div className="space-y-4 p-4 border rounded-md">
                  <h3 className="text-lg font-semibold flex items-center">
                    <ShieldCheck className="w-5 h-5 mr-2 text-blue-600" />
                    Step 2: Validate Documents
                  </h3>
                  <Alert className="bg-green-50 border-green-200 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Transcript uploaded successfully! (GPA: {transcriptUploadData?.agno}, Credits:{" "}
                      {transcriptUploadData?.total_credit})
                    </AlertDescription>
                  </Alert>
                  <p className="text-sm text-gray-600">
                    Now we'll validate your transcript against the curriculum requirements to check if you have
                    completed all necessary courses.
                  </p>
                  <Button onClick={handleValidateTranscript} disabled={isValidating} className="w-full">
                    {isValidating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Validating...
                      </>
                    ) : (
                      "Validate Transcript"
                    )}
                  </Button>
                  {validationResult && !validationResult.valid && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertTriangleIcon className="h-4 w-4" />
                      <AlertDescription>
                        Validation Failed: {validationResult.reason}
                        {validationResult.missing_courses && validationResult.missing_courses.length > 0 && (
                          <div className="mt-2">
                            <p className="font-semibold">Missing or Unmatched Courses:</p>
                            <ul className="list-disc list-inside pl-4">
                              {validationResult.missing_courses.map((course, index) => (
                                <li key={index}>{course}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {currentStep === ApplicationStep.FillApplication && validationResult?.valid && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmitApplication(new FormData(e.currentTarget))
                  }}
                  className="space-y-4 p-4 border rounded-md"
                >
                  <h3 className="text-lg font-semibold flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Step 3: Application Details
                  </h3>
                  <Alert className="bg-green-50 border-green-200 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Transcript validated successfully! Please review the details below.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="gpaOverall">Overall GPA (from Transcript)</Label>
                    <Input
                      id="gpaOverall"
                      name="gpaOverall"
                      type="number"
                      step="0.01"
                      value={gpaForApplicationForm}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalCredits">Total Credits (from Transcript)</Label>
                    <Input
                      id="totalCredits"
                      name="totalCredits"
                      type="number"
                      value={totalCreditsForApplicationForm}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="departmentName">Department</Label>
                    <Input id="departmentName" name="departmentName" value="CENG" readOnly className="bg-gray-100" />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        setShowApplicationForm(false)
                        await resetApplicationProcess()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="flex-grow">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                        </>
                      ) : (
                        "Submit Graduation Application"
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* Show Close button if on a step before FillApplication, OR if on ValidateDocuments step and validation failed */}
              {(currentStep < ApplicationStep.FillApplication ||
                (currentStep === ApplicationStep.ValidateDocuments && !validationResult?.valid)) && (
                <div className="mt-6 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      setShowApplicationForm(false)
                      await resetApplicationProcess()
                    }}
                  >
                    Close
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="bg-[#990000] text-white py-4 px-6 text-center">
        <p>© {new Date().getFullYear()} IYTE Graduation Management System. All rights reserved.</p>
      </footer>
    </div>
  )
}
