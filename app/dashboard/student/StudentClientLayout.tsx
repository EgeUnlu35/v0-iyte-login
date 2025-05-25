"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
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
  Loader2,
  HelpCircle,
  Info,
  ChevronRight,
  ChevronDown,
  Check,
  ShieldCheck,
  AlertTriangle as AlertTriangleIcon,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import {
  submitGraduationApplication,
  uploadTranscript,
  uploadCurriculum,
  validateTranscript,
  type GraduationApplication,
  type TranscriptValidationResult,
} from "@/app/actions/student";

interface UploadTranscriptSuccessResponse {
  agno: string;
  total_credit: number;
  message: string;
}

interface StudentClientLayoutProps {
  userName: string;
  application?: GraduationApplication | null;
  applicationError?: string | null;
}

// Enum for application steps
enum ApplicationStep {
  UploadTranscript = 1,
  UploadCurriculum = 2,
  ValidateDocuments = 3,
  FillApplication = 4,
  Submitted = 5,
}

export default function StudentClientLayout({
  userName,
  application,
  applicationError,
}: StudentClientLayoutProps) {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(applicationError || null);

  const [selectedTranscriptFile, setSelectedTranscriptFile] =
    useState<File | null>(null);
  const [selectedCurriculumFile, setSelectedCurriculumFile] =
    useState<File | null>(null);

  const [transcriptUploadData, setTranscriptUploadData] =
    useState<UploadTranscriptSuccessResponse | null>(null);
  const [curriculumUploaded, setCurriculumUploaded] = useState(false);
  const [validationResult, setValidationResult] =
    useState<TranscriptValidationResult | null>(null);

  const [gpaForApplicationForm, setGpaForApplicationForm] = useState("");
  const [totalCreditsForApplicationForm, setTotalCreditsForApplicationForm] =
    useState("");

  const transcriptInputRef = useRef<HTMLInputElement>(null);
  const curriculumInputRef = useRef<HTMLInputElement>(null);

  // State for current step in the application process
  const [currentStep, setCurrentStep] = useState<ApplicationStep>(
    ApplicationStep.UploadTranscript
  );

  const resetApplicationProcess = () => {
    setCurrentStep(ApplicationStep.UploadTranscript);
    setSelectedTranscriptFile(null);
    setSelectedCurriculumFile(null);
    setTranscriptUploadData(null);
    setCurriculumUploaded(false);
    setValidationResult(null);
    setGpaForApplicationForm("");
    setTotalCreditsForApplicationForm("");
    setError(null);
    if (transcriptInputRef.current) transcriptInputRef.current.value = "";
    if (curriculumInputRef.current) curriculumInputRef.current.value = "";
  };

  const handleOpenApplicationForm = () => {
    resetApplicationProcess();
    setShowApplicationForm(true);
  };

  const handleSubmitApplication = async (formData: FormData) => {
    if (!transcriptUploadData || !validationResult?.valid) {
      setError(
        "Please complete all previous steps, including successful document validation."
      );
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const applicationData = {
        studentId: formData.get("studentId") as string,
        gpaOverall: Number.parseFloat(gpaForApplicationForm), // Use state value
        totalCredits: Number.parseInt(totalCreditsForApplicationForm), // Use state value
        departmentId: formData.get("departmentId") as string,
        departmentName: formData.get("departmentName") as string,
      };

      const result = await submitGraduationApplication(applicationData);
      if (result.success) {
        alert("Graduation application submitted successfully!");
        setShowApplicationForm(false);
        setCurrentStep(ApplicationStep.Submitted);
        window.location.reload();
      } else {
        setError(result.error || "Failed to submit application");
      }
    } catch (error) {
      setError("An unexpected error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadTranscript = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadTranscript(formData);
      if (result.success && result.data) {
        setTranscriptUploadData(result.data);
        setGpaForApplicationForm(result.data.agno);
        setTotalCreditsForApplicationForm(result.data.total_credit.toString());
        alert(
          result.data.message ||
            `Transcript uploaded! AGNO: ${result.data.agno}, Credits: ${result.data.total_credit}`
        );
        setSelectedTranscriptFile(null);
        if (transcriptInputRef.current) transcriptInputRef.current.value = "";
        setCurrentStep(ApplicationStep.UploadCurriculum);
      } else {
        setError(result.error || "Failed to upload transcript");
        setTranscriptUploadData(null);
      }
    } catch (error) {
      setError("An unexpected error occurred while uploading transcript");
      setTranscriptUploadData(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadCurriculum = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadCurriculum(formData);
      if (result.success && result.data) {
        setCurriculumUploaded(true);
        alert(result.data.message || "Curriculum uploaded successfully!");
        setSelectedCurriculumFile(null);
        if (curriculumInputRef.current) curriculumInputRef.current.value = "";
        setCurrentStep(ApplicationStep.ValidateDocuments);
      } else {
        setError(result.error || "Failed to upload curriculum");
        setCurriculumUploaded(false);
      }
    } catch (error) {
      setError("An unexpected error occurred while uploading curriculum");
      setCurriculumUploaded(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleValidateCombined = async () => {
    if (!transcriptUploadData || !curriculumUploaded) {
      setError(
        "Please upload both transcript and curriculum before validating."
      );
      return;
    }
    setIsValidating(true);
    setError(null);
    try {
      const result = await validateTranscript(); // This action now implicitly uses previously uploaded files on server
      if (result.success && result.data) {
        setValidationResult(result.data);
        if (result.data.valid) {
          alert(
            "Documents validated successfully! You can now fill the application form."
          );
          setCurrentStep(ApplicationStep.FillApplication);
        } else {
          alert(
            `Validation Failed: ${
              result.data.reason || "Please review missing courses."
            }`
          );
          // User stays on ValidateDocuments step or can be moved to a review step
        }
      } else {
        setError(result.error || "Failed to validate documents.");
      }
    } catch (error) {
      setError("An unexpected error occurred during validation.");
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      UNDER_REVIEW: {
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

  const renderStepIndicator = (
    step: ApplicationStep,
    label: string,
    currentActiveStep: ApplicationStep
  ) => {
    const isActive = step === currentActiveStep;
    const isCompleted = step < currentActiveStep;
    return (
      <div
        className={`flex items-center p-2 rounded-md ${
          isActive
            ? "bg-blue-100"
            : isCompleted
            ? "bg-green-100"
            : "bg-gray-100"
        }`}
      >
        {isCompleted ? (
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
        ) : (
          <div
            className={`w-5 h-5 rounded-full border-2 ${
              isActive ? "border-blue-500 bg-blue-500" : "border-gray-400"
            } mr-2 flex items-center justify-center text-xs ${
              isActive ? "text-white" : ""
            }`}
          >
            {isCompleted ? "" : step}
          </div>
        )}
        <span
          className={`text-sm ${
            isActive
              ? "font-semibold text-blue-700"
              : isCompleted
              ? "text-green-700"
              : "text-gray-600"
          }`}
        >
          {label}
        </span>
      </div>
    );
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
            <h1 className="text-xl font-bold">Student Portal</h1>
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
          <h2 className="text-3xl font-bold mb-2">Student Portal</h2>
          <p className="text-gray-600">
            Track your graduation progress and manage requirements
          </p>
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
                  <span className="font-medium ml-2">
                    {application.gpaOverall}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium ml-2">
                    {application.departmentName}
                  </span>
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
              <p className="text-sm text-gray-500">
                Your application has been submitted. You will be notified of any
                updates.
              </p>
            </CardContent>
          </Card>
        )}

        {!showApplicationForm && !application && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="w-5 h-5 mr-2 text-blue-500" />
                Ready to Graduate?
              </CardTitle>
              <CardDescription>
                Complete the steps below to submit your graduation application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleOpenApplicationForm} className="w-full">
                <GraduationCap className="mr-2 h-4 w-4" />
                Start Graduation Application
              </Button>
            </CardContent>
          </Card>
        )}

        {showApplicationForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Submit Graduation Application</CardTitle>
              <CardDescription>
                Follow the steps to complete your application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-around mb-6 p-2 bg-slate-50 rounded-lg">
                {renderStepIndicator(
                  ApplicationStep.UploadTranscript,
                  "Upload Transcript",
                  currentStep
                )}
                <ChevronRight
                  className={`w-5 h-5 mx-1 self-center ${
                    currentStep > ApplicationStep.UploadTranscript
                      ? "text-green-500"
                      : "text-gray-300"
                  }`}
                />
                {renderStepIndicator(
                  ApplicationStep.UploadCurriculum,
                  "Upload Curriculum",
                  currentStep
                )}
                <ChevronRight
                  className={`w-5 h-5 mx-1 self-center ${
                    currentStep > ApplicationStep.UploadCurriculum
                      ? "text-green-500"
                      : "text-gray-300"
                  }`}
                />
                {renderStepIndicator(
                  ApplicationStep.ValidateDocuments,
                  "Validate Documents",
                  currentStep
                )}
                <ChevronRight
                  className={`w-5 h-5 mx-1 self-center ${
                    currentStep > ApplicationStep.ValidateDocuments
                      ? "text-green-500"
                      : "text-gray-300"
                  }`}
                />
                {renderStepIndicator(
                  ApplicationStep.FillApplication,
                  "Application Form",
                  currentStep
                )}
              </div>

              {currentStep === ApplicationStep.UploadTranscript && (
                <div className="space-y-4 p-4 border rounded-md">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Upload className="w-5 h-5 mr-2 text-blue-600" />
                    Step 1: Upload Transcript
                  </h3>
                  <div>
                    <Label htmlFor="transcript">Transcript (PDF)</Label>
                    <Input
                      ref={transcriptInputRef}
                      id="transcript"
                      type="file"
                      accept=".pdf"
                      onChange={(e) =>
                        setSelectedTranscriptFile(e.target.files?.[0] || null)
                      }
                    />
                  </div>
                  {selectedTranscriptFile && (
                    <Button
                      onClick={() =>
                        handleUploadTranscript(selectedTranscriptFile)
                      }
                      disabled={isUploading}
                      className="w-full"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Uploading...
                        </>
                      ) : (
                        "Upload Transcript"
                      )}
                    </Button>
                  )}
                </div>
              )}

              {currentStep === ApplicationStep.UploadCurriculum && (
                <div className="space-y-4 p-4 border rounded-md">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Upload className="w-5 h-5 mr-2 text-blue-600" />
                    Step 2: Upload Curriculum
                  </h3>
                  <Alert className="bg-green-50 border-green-200 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Transcript uploaded successfully! (AGNO:{" "}
                      {transcriptUploadData?.agno}, Credits:{" "}
                      {transcriptUploadData?.total_credit})
                    </AlertDescription>
                  </Alert>
                  <div>
                    <Label htmlFor="curriculum">Curriculum (PDF)</Label>
                    <Input
                      ref={curriculumInputRef}
                      id="curriculum"
                      type="file"
                      accept=".pdf"
                      onChange={(e) =>
                        setSelectedCurriculumFile(e.target.files?.[0] || null)
                      }
                    />
                  </div>
                  {selectedCurriculumFile && (
                    <Button
                      onClick={() =>
                        handleUploadCurriculum(selectedCurriculumFile)
                      }
                      disabled={isUploading}
                      className="w-full"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Uploading...
                        </>
                      ) : (
                        "Upload Curriculum"
                      )}
                    </Button>
                  )}
                </div>
              )}

              {currentStep === ApplicationStep.ValidateDocuments && (
                <div className="space-y-4 p-4 border rounded-md">
                  <h3 className="text-lg font-semibold flex items-center">
                    <ShieldCheck className="w-5 h-5 mr-2 text-blue-600" />
                    Step 3: Validate Documents
                  </h3>
                  <Alert className="bg-green-50 border-green-200 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Transcript & Curriculum uploaded.
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={handleValidateCombined}
                    disabled={isValidating}
                    className="w-full"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Validating...
                      </>
                    ) : (
                      "Validate Documents"
                    )}
                  </Button>
                  {validationResult && !validationResult.valid && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertTriangleIcon className="h-4 w-4" />
                      <AlertDescription>
                        Validation Failed: {validationResult.reason}
                        {validationResult.missing_courses &&
                          validationResult.missing_courses.length > 0 && (
                            <div className="mt-2">
                              <p className="font-semibold">
                                Missing or Unmatched Courses:
                              </p>
                              <ul className="list-disc list-inside pl-4">
                                {validationResult.missing_courses.map(
                                  (course, index) => (
                                    <li key={index}>{course}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {currentStep === ApplicationStep.FillApplication &&
                validationResult?.valid && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmitApplication(new FormData(e.currentTarget));
                    }}
                    className="space-y-4 p-4 border rounded-md"
                  >
                    <h3 className="text-lg font-semibold flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      Step 4: Application Details
                    </h3>
                    <Alert className="bg-green-50 border-green-200 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Documents validated successfully! Please complete the
                        form below.
                      </AlertDescription>
                    </Alert>
                    <div>
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        name="studentId"
                        required
                        placeholder="Your Student ID"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gpaOverall">
                        Overall GPA (from Transcript)
                      </Label>
                      <Input
                        id="gpaOverall"
                        name="gpaOverall"
                        type="number"
                        value={gpaForApplicationForm}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="totalCredits">
                        Total Credits (from Transcript)
                      </Label>
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
                      <Label htmlFor="departmentId">Department ID</Label>
                      <Input
                        id="departmentId"
                        name="departmentId"
                        required
                        placeholder="e.g., CENG"
                      />
                    </div>
                    <div>
                      <Label htmlFor="departmentName">Department Name</Label>
                      <Input
                        id="departmentName"
                        name="departmentName"
                        required
                        placeholder="e.g., Computer Engineering"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowApplicationForm(false);
                          resetApplicationProcess();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-grow"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                            Submitting...
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
                (currentStep === ApplicationStep.ValidateDocuments &&
                  !validationResult?.valid)) && (
                <div className="mt-6 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowApplicationForm(false);
                      resetApplicationProcess();
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
        <p>
          © {new Date().getFullYear()} IYTE Graduation Management System. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
}
