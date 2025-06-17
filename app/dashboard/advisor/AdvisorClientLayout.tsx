"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  FileCheck,
  Loader2,
  Calendar,
  User,
  BookOpen,
  Edit3,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import {
  reviewApplication,
  updateStudentInfo,
  type GraduationApplication,
  type ApplicationStatus,
} from "@/app/actions/advisor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdvisorClientLayoutProps {
  userName: string;
  allApplications: GraduationApplication[];
  error?: string | null;
}

export default function AdvisorClientLayout({
  userName,
  allApplications,
  error,
}: AdvisorClientLayoutProps) {
  const [applications, setApplications] = useState(allApplications);
  const [isReviewing, setIsReviewing] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<GraduationApplication | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<ApplicationStatus | null>(
    null
  );
  const [reviewFeedback, setReviewFeedback] = useState("");

  // Editable fields
  const [editableGPA, setEditableGPA] = useState("");
  const [editableCredits, setEditableCredits] = useState("");
  const [updateReason, setUpdateReason] = useState("");

  const handleReview = async (
    applicationId: string,
    status: ApplicationStatus,
    feedback?: string
  ) => {
    setIsReviewing(applicationId);
    setReviewError(null);

    try {
      const result = await reviewApplication({
        applicationId,
        status,
        feedback,
      });

      if (result.success) {
        // Update the application status in the list instead of removing it
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId ? { ...app, status, feedback } : app
          )
        );
        alert(result.message || "Application reviewed successfully!");
        setShowReviewModal(false);
        setReviewFeedback("");
        setSelectedApplication(null);
      } else {
        setReviewError(result.error || "Failed to review application");
      }
    } catch (error) {
      setReviewError("An unexpected error occurred");
    } finally {
      setIsReviewing(null);
    }
  };

  const handleUpdateStudentInfo = async (applicationId: string) => {
    setIsUpdating(applicationId);
    setReviewError(null);

    // Validate inputs
    const gpa = Number.parseFloat(editableGPA);
    const credits = Number.parseInt(editableCredits);

    if (isNaN(gpa) || gpa < 0 || gpa > 4) {
      setReviewError("GPA must be a valid number between 0 and 4");
      setIsUpdating(null);
      return;
    }

    if (isNaN(credits) || credits < 0) {
      setReviewError("Credits must be a valid positive number");
      setIsUpdating(null);
      return;
    }

    if (!updateReason.trim()) {
      setReviewError("Update reason is required");
      setIsUpdating(null);
      return;
    }

    try {
      const result = await updateStudentInfo(applicationId, {
        gpaOverall: gpa,
        totalCredits: credits,
        reason: updateReason.trim(),
      });

      if (result.success) {
        // Update the application in the list
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId
              ? { ...app, gpaOverall: gpa, totalCredits: credits }
              : app
          )
        );
        alert(result.message || "Student information updated successfully!");
        setShowEditModal(false);
        setEditableGPA("");
        setEditableCredits("");
        setUpdateReason("");
        setSelectedApplication(null);
      } else {
        setReviewError(result.error || "Failed to update student information");
      }
    } catch (error) {
      setReviewError("An unexpected error occurred");
    } finally {
      setIsUpdating(null);
    }
  };

  const openReviewModal = (
    app: GraduationApplication,
    action: ApplicationStatus
  ) => {
    setSelectedApplication(app);
    setReviewAction(action);
    setReviewFeedback("");
    setReviewError(null);
    setShowReviewModal(true);
  };

  const openEditModal = (app: GraduationApplication) => {
    setSelectedApplication(app);
    setEditableGPA(app.gpaOverall.toString());
    setEditableCredits(app.totalCredits.toString());
    setUpdateReason("");
    setReviewError(null);
    setShowEditModal(true);
  };

  const handleConfirmReview = () => {
    if (!selectedApplication || !reviewAction) return;

    const feedback = reviewFeedback.trim();
    if (reviewAction === "REJECTED" && !feedback) {
      setReviewError("Rejection reason is required");
      return;
    }
    if (reviewAction === "RETURNED_FOR_REVISION" && !feedback) {
      setReviewError("Revision instructions are required");
      return;
    }

    handleReview(selectedApplication.id, reviewAction, feedback || undefined);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800",
        text: "Pending Review",
      },
      UNDER_REVIEW_BY_ADVISOR: {
        color: "bg-blue-100 text-blue-800",
        text: "Under Review",
      },
      APPROVED: { color: "bg-green-100 text-green-800", text: "Approved" },
      REJECTED: { color: "bg-red-100 text-red-800", text: "Rejected" },
      RETURNED_FOR_REVISION: {
        color: "bg-orange-100 text-orange-800",
        text: "Needs Revision",
      },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const getActionButtonConfig = (action: ApplicationStatus) => {
    switch (action) {
      case "APPROVED":
        return {
          label: "Approve",
          icon: ThumbsUp,
          className: "bg-green-500 hover:bg-green-600 text-white",
          description:
            "Approve this application and send it to the department secretary",
        };
      case "REJECTED":
        return {
          label: "Reject",
          icon: ThumbsDown,
          className: "border-red-500 text-red-500 hover:bg-red-50",
          description: "Reject this application with a reason",
        };
      case "RETURNED_FOR_REVISION":
        return {
          label: "Return for Revision",
          icon: RotateCcw,
          className: "border-orange-500 text-orange-500 hover:bg-orange-50",
          description: "Return to student for corrections",
        };
      default:
        return {
          label: "Review",
          icon: Eye,
          className: "border-gray-500 text-gray-500 hover:bg-gray-50",
          description: "Review this application",
        };
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-[#990000] text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
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
            <Button
              variant="outline"
              className="text-white bg-[#990000] border-white hover:bg-white/10"
              type="submit"
            >
              Logout
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Graduation Application Review
          </h2>
          <p className="text-gray-600">
            Review and approve student graduation applications
          </p>
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
                  <p className="text-gray-600">Total Applications</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Pending:{" "}
                  {
                    applications.filter((app) => app.status === "PENDING")
                      .length
                  }{" "}
                  | Approved:{" "}
                  {
                    applications.filter((app) => app.status === "APPROVED")
                      .length
                  }{" "}
                  | Rejected:{" "}
                  {
                    applications.filter((app) => app.status === "REJECTED")
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Graduation Applications */}
        <Card>
          <CardHeader>
            <CardTitle>All Graduation Applications</CardTitle>
            <CardDescription>
              Manage all student graduation applications and their statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">
                          {app.studentName} {app.studentLastName}
                        </h3>
                        {getStatusBadge(app.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Student ID</p>
                            <p className="font-medium">{app.studentId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Department</p>
                            <p className="font-medium">{app.departmentName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Submitted</p>
                            <p className="font-medium">
                              {new Date(
                                app.submissionDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">GPA</p>
                          <p className="font-medium text-lg">
                            {app.gpaOverall}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Credits</p>
                          <p className="font-medium text-lg">
                            {app.totalCredits}
                          </p>
                        </div>
                      </div>

                      {(app.missingCourses0 ||
                        app.missingCourses1 ||
                        app.missingCourses2) && (
                        <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                          <p className="text-sm text-orange-600 mb-1 font-medium">
                            Missing Courses:
                          </p>
                          <ul className="text-sm list-disc list-inside">
                            {app.missingCourses0 && (
                              <li>{app.missingCourses0}</li>
                            )}
                            {app.missingCourses1 && (
                              <li>{app.missingCourses1}</li>
                            )}
                            {app.missingCourses2 && (
                              <li>{app.missingCourses2}</li>
                            )}
                          </ul>
                        </div>
                      )}

                      {app.feedback && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">
                            Previous Feedback:
                          </p>
                          <p className="text-sm">{app.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedApplication(app);
                        setShowDetailsModal(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-500 text-blue-500 hover:bg-blue-50 flex items-center gap-2"
                      onClick={() => openEditModal(app)}
                      disabled={isUpdating === app.id}
                    >
                      {isUpdating === app.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Edit3 className="w-4 h-4" />
                      )}
                      Edit GPA/Credits
                    </Button>

                    {app.status !== "APPROVED" && (
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
                        onClick={() => openReviewModal(app, "APPROVED")}
                        disabled={isReviewing === app.id}
                      >
                        {isReviewing === app.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ThumbsUp className="w-4 h-4" />
                        )}
                        {isReviewing === app.id ? "Processing..." : "Approve"}
                      </Button>
                    )}

                    {app.status !== "REJECTED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-50 flex items-center gap-2"
                        onClick={() => openReviewModal(app, "REJECTED")}
                        disabled={isReviewing === app.id}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        Reject
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {applications.length === 0 && (
                <div className="text-center py-12">
                  <FileCheck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Pending Applications
                  </h3>
                  <p className="text-gray-500">
                    All graduation applications have been reviewed.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Application Details Modal */}
      {selectedApplication && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Application Details - {selectedApplication.studentName}{" "}
                {selectedApplication.studentLastName}
              </DialogTitle>
              <DialogDescription>
                Complete information about this graduation application
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Student ID
                  </Label>
                  <p className="text-sm">{selectedApplication.studentId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Department
                  </Label>
                  <p className="text-sm">
                    {selectedApplication.departmentName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    GPA
                  </Label>
                  <p className="text-sm">{selectedApplication.gpaOverall}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Total Credits
                  </Label>
                  <p className="text-sm">{selectedApplication.totalCredits}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Status
                  </Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedApplication.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Submission Date
                  </Label>
                  <p className="text-sm">
                    {new Date(
                      selectedApplication.submissionDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {(selectedApplication.missingCourses0 ||
                selectedApplication.missingCourses1 ||
                selectedApplication.missingCourses2) && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Missing Courses
                  </Label>
                  <ul className="text-sm list-disc list-inside mt-1">
                    {selectedApplication.missingCourses0 && (
                      <li>{selectedApplication.missingCourses0}</li>
                    )}
                    {selectedApplication.missingCourses1 && (
                      <li>{selectedApplication.missingCourses1}</li>
                    )}
                    {selectedApplication.missingCourses2 && (
                      <li>{selectedApplication.missingCourses2}</li>
                    )}
                  </ul>
                </div>
              )}

              {selectedApplication.feedback && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Previous Feedback
                  </Label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded">
                    {selectedApplication.feedback}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Student Info Modal */}
      {selectedApplication && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Edit Student Information
              </DialogTitle>
              <DialogDescription>
                Update GPA and Credits for this student
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-medium">Student</Label>
                <p className="text-sm">
                  {selectedApplication.studentName}{" "}
                  {selectedApplication.studentLastName} (
                  {selectedApplication.studentId})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editableGPA" className="text-sm font-medium">
                    GPA
                  </Label>
                  <Input
                    id="editableGPA"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={editableGPA}
                    onChange={(e) => setEditableGPA(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="editableCredits"
                    className="text-sm font-medium"
                  >
                    Total Credits
                  </Label>
                  <Input
                    id="editableCredits"
                    type="number"
                    min="0"
                    value={editableCredits}
                    onChange={(e) => setEditableCredits(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="updateReason" className="text-sm font-medium">
                  Reason for Update (Required)
                </Label>
                <Textarea
                  id="updateReason"
                  value={updateReason}
                  onChange={(e) => setUpdateReason(e.target.value)}
                  placeholder="Please provide a reason for updating the student information..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              {reviewError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{reviewError}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                disabled={isUpdating !== null}
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  selectedApplication &&
                  handleUpdateStudentInfo(selectedApplication.id)
                }
                disabled={isUpdating !== null}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isUpdating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Update Information
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Review Modal */}
      {selectedApplication && reviewAction && (
        <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {getActionButtonConfig(reviewAction).label} Application
              </DialogTitle>
              <DialogDescription>
                {getActionButtonConfig(reviewAction).description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-medium">Student</Label>
                <p className="text-sm">
                  {selectedApplication.studentName}{" "}
                  {selectedApplication.studentLastName} (
                  {selectedApplication.studentId})
                </p>
              </div>

              <div>
                <Label htmlFor="feedback" className="text-sm font-medium">
                  {reviewAction === "APPROVED"
                    ? "Approval Comments (Optional)"
                    : reviewAction === "REJECTED"
                    ? "Rejection Reason (Required)"
                    : "Revision Instructions (Required)"}
                </Label>
                <Textarea
                  id="feedback"
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder={
                    reviewAction === "APPROVED"
                      ? "Add any comments about the approval..."
                      : reviewAction === "REJECTED"
                      ? "Please provide a clear reason for rejection..."
                      : "Please provide specific instructions for revision..."
                  }
                  className="mt-1"
                  rows={4}
                />
              </div>
              {reviewError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{reviewError}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowReviewModal(false)}
                disabled={isReviewing !== null}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmReview}
                disabled={isReviewing !== null}
                className={getActionButtonConfig(reviewAction).className}
              >
                {isReviewing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Confirm {getActionButtonConfig(reviewAction).label}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <footer className="bg-[#990000] text-white py-4 px-6 text-center">
        <p>
          © {new Date().getFullYear()} IYTE Graduation Management System. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
}
