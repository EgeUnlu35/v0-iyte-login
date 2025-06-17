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
import {
  CheckCircle,
  FileSignature,
  AlertTriangle,
  Loader2,
  Calendar,
  User,
  BookOpen,
  Eye,
  UserCheck,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import {
  signCoverLetter,
  type CoverLetter,
} from "@/app/actions/faculty-secretary";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FacultySecretaryClientLayoutProps {
  userName: string;
  coverLetters: CoverLetter[];
  error?: string | null;
}

// Helper function to safely format dates
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "Not available";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date string:", dateString);
      return "Invalid date";
    }
    return date.toLocaleDateString();
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Invalid date";
  }
};

export default function FacultySecretaryClientLayout({
  userName,
  coverLetters: initialCoverLetters,
  error: initialError,
}: FacultySecretaryClientLayoutProps) {
  const [coverLetters, setCoverLetters] = useState(initialCoverLetters);
  const [isSigningCoverLetter, setIsSigningCoverLetter] = useState<
    string | null
  >(null);
  const [actionError, setActionError] = useState<string | null>(
    initialError || null
  );
  const [selectedCoverLetter, setSelectedCoverLetter] =
    useState<CoverLetter | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);

  // Debug logging
  console.log("Faculty Secretary - Cover letters loaded:", {
    count: coverLetters.length,
    stages: coverLetters.map((letter) => ({
      id: letter.entryId,
      stage: letter.stage,
      deptChairSigned: letter.departmentChairSigned,
      facultySigned: letter.facultySecretary,
      student: `${letter.studentName} ${letter.studentLastName}`,
    })),
  });

  const handleSignCoverLetter = async (entryId: string) => {
    setIsSigningCoverLetter(entryId);
    setActionError(null);

    try {
      const result = await signCoverLetter(entryId);
      if (result.success) {
        alert(
          result.data.message ||
            "Cover letter signed successfully and forwarded to Student Affairs!"
        );
        // Remove the signed cover letter from the list
        setCoverLetters((prev) =>
          prev.filter((letter) => letter.entryId !== entryId)
        );
        setShowSignModal(false);
        setSelectedCoverLetter(null);
      } else {
        setActionError(result.error || "Failed to sign cover letter");
      }
    } catch (error) {
      setActionError(
        "An unexpected error occurred while signing the cover letter"
      );
    } finally {
      setIsSigningCoverLetter(null);
    }
  };

  const openSignModal = (coverLetter: CoverLetter) => {
    setSelectedCoverLetter(coverLetter);
    setActionError(null);
    setShowSignModal(true);
  };

  const getStatusBadge = (stage: string) => {
    const stageConfig = {
      PENDING_DEPARTMENT_CHAIR: {
        color: "bg-orange-100 text-orange-800",
        text: "Pending Department Chair",
      },
      PENDING_FACULTY_SECRETARY: {
        color: "bg-blue-100 text-blue-800",
        text: "Pending Your Signature",
      },
      PENDING_STUDENT_AFFAIRS: {
        color: "bg-purple-100 text-purple-800",
        text: "Sent to Student Affairs",
      },
      COMPLETED: { color: "bg-green-100 text-green-800", text: "Completed" },
      FULLY_SIGNED: {
        color: "bg-green-100 text-green-800",
        text: "Fully Signed",
      },
    };
    const config = stageConfig[stage as keyof typeof stageConfig] || {
      color: "bg-gray-100 text-gray-800",
      text: "Unknown",
    };
    return <Badge className={config.color}>{config.text}</Badge>;
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
            <h1 className="text-xl font-bold">Faculty Secretary Portal</h1>
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
            Faculty Secretary Dashboard
          </h2>
          <p className="text-gray-600">
            Review and sign cover letters from department chairs
          </p>
        </div>

        {actionError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}

        {/* Summary Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileSignature className="w-12 h-12 text-blue-500" />
                <div>
                  <h3 className="text-2xl font-bold">{coverLetters.length}</h3>
                  <p className="text-gray-600">
                    Cover Letters Pending Signature
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  From department chairs awaiting faculty secretary review
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cover Letters for Signature */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-blue-500" />
              Cover Letters for Signature
            </CardTitle>
            <CardDescription>
              Review and sign cover letters already approved by department
              chairs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {coverLetters.map((letter) => (
                <div
                  key={letter.entryId}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">
                          {letter.studentName} {letter.studentLastName}
                        </h3>
                        {getStatusBadge(letter.stage)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Student ID</p>
                            <p className="font-medium">{letter.studentId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Department</p>
                            <p className="font-medium">{letter.department}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">
                              Graduation Date
                            </p>
                            <p className="font-medium">
                              {formatDate(letter.graduationDate)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">GPA</p>
                          <p className="font-medium text-lg">
                            {letter.gpa.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Credits Earned
                          </p>
                          <p className="font-medium text-lg">
                            {letter.creditsEarned}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-600">Dept Chair</p>
                            <p className="font-medium text-sm">
                              {letter.departmentChairSigned ? (
                                letter.departmentChairSignedAt ? (
                                  <span className="text-green-600">
                                    ✓ Signed
                                  </span>
                                ) : (
                                  <span className="text-blue-600">
                                    ✓ Signed (inferred)
                                  </span>
                                )
                              ) : (
                                <span className="text-red-600">
                                  ✗ Not Signed
                                </span>
                              )}
                            </p>
                            {letter.departmentChairSignedAt ? (
                              <p className="text-xs text-gray-500">
                                {formatDate(letter.departmentChairSignedAt)}
                              </p>
                            ) : letter.departmentChairSigned &&
                              letter.stage === "PENDING_FACULTY_SECRETARY" ? (
                              <p className="text-xs text-blue-500">
                                Inferred from workflow stage
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {letter.notes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Notes:</p>
                          <p className="text-sm">{letter.notes}</p>
                        </div>
                      )}

                      <div className="text-sm text-gray-500 mb-2">
                        <p>
                          Cover letter generated: {formatDate(letter.createdAt)}
                        </p>
                        {letter.departmentChairSignedAt && (
                          <p>
                            Department chair signed:{" "}
                            {formatDate(letter.departmentChairSignedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedCoverLetter(letter);
                        setShowDetailsModal(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>

                    {/* Show approve button for cover letters pending faculty secretary signature */}
                    {letter.stage === "PENDING_FACULTY_SECRETARY" &&
                      (letter.departmentChairSigned ||
                        letter.departmentChairSignedAt) &&
                      !letter.facultySecretary && (
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
                          onClick={() => openSignModal(letter)}
                          disabled={isSigningCoverLetter === letter.entryId}
                        >
                          {isSigningCoverLetter === letter.entryId ? (
                            <Loader2 className="w-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          {isSigningCoverLetter === letter.entryId
                            ? "Signing..."
                            : "Sign & Forward"}
                        </Button>
                      )}
                  </div>
                </div>
              ))}

              {coverLetters.length === 0 && (
                <div className="text-center py-12">
                  <FileSignature className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Cover Letters Pending
                  </h3>
                  <p className="text-gray-500">
                    All cover letters have been signed and forwarded to Student
                    Affairs.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Cover Letter Details Modal */}
      {selectedCoverLetter && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Cover Letter Details - {selectedCoverLetter.studentName}{" "}
                {selectedCoverLetter.studentLastName}
              </DialogTitle>
              <DialogDescription>
                Complete information about this cover letter
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Student ID
                  </p>
                  <p className="text-sm">{selectedCoverLetter.studentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Department
                  </p>
                  <p className="text-sm">{selectedCoverLetter.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">GPA</p>
                  <p className="text-sm">
                    {selectedCoverLetter.gpa.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Credits Earned
                  </p>
                  <p className="text-sm">{selectedCoverLetter.creditsEarned}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedCoverLetter.stage)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Graduation Date
                  </p>
                  <p className="text-sm">
                    {formatDate(selectedCoverLetter.graduationDate)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Department Chair
                  </p>
                  <p className="text-sm">
                    {selectedCoverLetter.departmentChairSigned ? (
                      <span className="text-green-600">
                        ✓ Signed on{" "}
                        {formatDate(
                          selectedCoverLetter.departmentChairSignedAt
                        )}
                      </span>
                    ) : (
                      <span className="text-red-600">✗ Not Signed</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Faculty Secretary
                  </p>
                  <p className="text-sm">
                    {selectedCoverLetter.facultySecretary ? (
                      <span className="text-green-600">
                        ✓ Signed on{" "}
                        {formatDate(
                          selectedCoverLetter.facultySecretarySignedAt
                        )}
                      </span>
                    ) : (
                      <span className="text-orange-600">○ Pending</span>
                    )}
                  </p>
                </div>
              </div>

              {selectedCoverLetter.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Notes</p>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded">
                    {selectedCoverLetter.notes}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-600">
                  Cover Letter Generated
                </p>
                <p className="text-sm">
                  {formatDate(selectedCoverLetter.createdAt)}
                </p>
              </div>
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

      {/* Sign Cover Letter Modal */}
      {selectedCoverLetter && (
        <Dialog open={showSignModal} onOpenChange={setShowSignModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSignature className="w-5 h-5" />
                Sign Cover Letter
              </DialogTitle>
              <DialogDescription>
                Sign the cover letter for {selectedCoverLetter.studentName}{" "}
                {selectedCoverLetter.studentLastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium">Student</p>
                <p className="text-sm">
                  {selectedCoverLetter.studentName}{" "}
                  {selectedCoverLetter.studentLastName} (
                  {selectedCoverLetter.studentId})
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Department</p>
                <p className="text-sm">{selectedCoverLetter.department}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">GPA</p>
                  <p className="text-sm">
                    {selectedCoverLetter.gpa.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Credits</p>
                  <p className="text-sm">{selectedCoverLetter.creditsEarned}</p>
                </div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-4 h-4 text-green-600" />
                  <p className="text-sm font-medium text-green-800">
                    Department Chair Status
                  </p>
                </div>
                <p className="text-sm text-green-700">
                  {selectedCoverLetter.departmentChairSigned ? (
                    selectedCoverLetter.departmentChairSignedAt ? (
                      <>
                        ✓ Signed on{" "}
                        {formatDate(
                          selectedCoverLetter.departmentChairSignedAt
                        )}
                      </>
                    ) : (
                      <>
                        ✓ Signed (inferred from workflow stage)
                        <br />
                        <span className="text-xs">
                          Cover letter reached faculty secretary stage
                        </span>
                      </>
                    )
                  ) : (
                    "⚠️ Status unclear - check with department chair"
                  )}
                </p>
              </div>
              <Alert className="bg-blue-50 border-blue-200">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  By signing this cover letter, you confirm that the student has
                  met all faculty requirements for graduation. The cover letter
                  will be forwarded to Student Affairs for the final step.
                </AlertDescription>
              </Alert>
              {actionError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{actionError}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSignModal(false)}
                disabled={isSigningCoverLetter !== null}
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  selectedCoverLetter &&
                  handleSignCoverLetter(selectedCoverLetter.entryId)
                }
                disabled={isSigningCoverLetter !== null}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                {isSigningCoverLetter ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Sign & Forward to Student Affairs
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
