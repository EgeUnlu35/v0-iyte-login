"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { ArrowLeft, AlertTriangle, Eye, ThumbsUp, ThumbsDown, RotateCcw, FileCheck } from "lucide-react"
import { logout } from "@/app/actions/auth"
import { reviewApplication, type GraduationApplication, type ApplicationStatus } from "@/app/actions/advisor"

interface AdvisorClientLayoutProps {
  userName: string
  pendingApplications: GraduationApplication[]
  error?: string | null
}

export default function AdvisorClientLayout({ userName, pendingApplications, error }: AdvisorClientLayoutProps) {
  const [isReviewing, setIsReviewing] = useState<string | null>(null)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [applications, setApplications] = useState(pendingApplications)

  const handleReview = async (applicationId: string, status: ApplicationStatus, feedback?: string) => {
    setIsReviewing(applicationId)
    setReviewError(null)

    try {
      const result = await reviewApplication({
        applicationId,
        advisorId: "current-advisor-id", // This should come from session
        status,
        feedback,
      })

      if (result.success) {
        // Remove the reviewed application from the list
        setApplications((prev) => prev.filter((app) => app.id !== applicationId))
        alert(result.message)
      } else {
        setReviewError(result.error || "Failed to review application")
      }
    } catch (error) {
      setReviewError("An unexpected error occurred")
    } finally {
      setIsReviewing(null)
    }
  }

  const handleApprove = (applicationId: string) => {
    const feedback = prompt("Add approval feedback (optional):")
    handleReview(applicationId, "APPROVED", feedback || undefined)
  }

  const handleReject = (applicationId: string) => {
    const feedback = prompt("Please provide rejection reason:")
    if (feedback) {
      handleReview(applicationId, "REJECTED", feedback)
    }
  }

  const handleReturnForRevision = (applicationId: string) => {
    const feedback = prompt("Please provide revision instructions:")
    if (feedback) {
      handleReview(applicationId, "RETURNED_FOR_REVISION", feedback)
    }
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
            <h1 className="text-xl font-bold">Advisor Portal</h1>
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
          <h2 className="text-3xl font-bold mb-2">Graduation Application Review</h2>
          <p className="text-gray-600">Review and approve student graduation applications</p>
        </div>

        {/* Error Alert */}
        {(error || reviewError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error || reviewError}</AlertDescription>
          </Alert>
        )}

        {/* Summary Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileCheck className="w-12 h-12 text-blue-500" />
                <div>
                  <h3 className="text-2xl font-bold">{applications.length}</h3>
                  <p className="text-gray-600">Pending Applications</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {applications.length === 0
                    ? "All applications reviewed!"
                    : `${applications.length} application${applications.length > 1 ? "s" : ""} awaiting your review`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Graduation Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Graduation Applications</CardTitle>
            <CardDescription>Review each application carefully before making your decision</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">{app.studentName}</h3>
                        <span className="inline-block px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          {app.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Student Email</p>
                          <p className="font-medium">{app.studentEmail}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Submission Date</p>
                          <p className="font-medium">{new Date(app.submissionDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Student ID</p>
                          <p className="font-medium">{app.studentId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Application ID</p>
                          <p className="font-medium text-xs">{app.id}</p>
                        </div>
                      </div>

                      {app.feedback && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Previous Feedback</p>
                          <p className="text-sm">{app.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => alert(`Viewing details for ${app.studentName}`)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-500 text-blue-500 hover:bg-blue-50 flex items-center gap-2"
                      onClick={() => handleReturnForRevision(app.id)}
                      disabled={isReviewing === app.id}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Return for Revision
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50 flex items-center gap-2"
                      onClick={() => handleReject(app.id)}
                      disabled={isReviewing === app.id}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      Reject
                    </Button>

                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
                      onClick={() => handleApprove(app.id)}
                      disabled={isReviewing === app.id}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {isReviewing === app.id ? "Processing..." : "Approve"}
                    </Button>
                  </div>
                </div>
              ))}

              {applications.length === 0 && (
                <div className="text-center py-12">
                  <FileCheck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Applications</h3>
                  <p className="text-gray-500">All graduation applications have been reviewed.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-[#990000] text-white py-4 px-6 text-center">
        <p>© {new Date().getFullYear()} IYTE Graduation Management System. All rights reserved.</p>
      </footer>
    </div>
  )
}
